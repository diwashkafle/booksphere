import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "user" | "merchant" | "admin";
        } & DefaultSession["user"];
    }

    interface User {
        role: "user" | "merchant" | "admin";
    }
}

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email as string),
                });

                if (!user) return null;

                // In a real app, use bcrypt to compare passwords
                if (user.password !== credentials.password) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as "user" | "merchant" | "admin";
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
});
