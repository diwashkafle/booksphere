import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, merchants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // In a real app, hash password here
        const [newUser] = await db.insert(users).values({
            name,
            email,
            password,
            role: role as "user" | "merchant",
        }).returning();

        // If merchant, create merchant profile
        if (role === "merchant") {
            await db.insert(merchants).values({
                userId: newUser.id,
                storeName: `${name}'s Bookshop`,
            });
        }

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Failed to register" }, { status: 500 });
    }
}
