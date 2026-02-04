import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const getDb = () => {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not set. Please create a .env file based on .env.example.");
        return null as any; // Or return a proxy that throws on access
    }
    const sql = neon(process.env.DATABASE_URL);
    return drizzle(sql, { schema });
};

export const db = getDb();
