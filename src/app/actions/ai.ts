"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function chatWithLibrarian(message: string, history: { role: string; parts: string }[]) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return { error: "AI Librarian is resting (API key missing). Please check .env file." };
    }

    try {
        // 1. Fetch available books for context
        const allBooks = await db.query.books.findMany({
            where: eq(books.status, "published"),
            columns: {
                id: true,
                title: true,
                author: true,
                category: true,
                description: true,
                price: true,
            }
        });

        const booksContext = allBooks.map((b: any) =>
            `- ${b.title} by ${b.author} [Category: ${b.category}] ($${(b.price / 100).toFixed(2)})`
        ).join("\n");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const systemPrompt = `
      You are "Booksie", the friendly and helpful virtual librarian for BookSphere, an online bookstore.
      
      Your goal is to help users find their next great read from our collection.
      
      HERE IS OUR CURRENT COLLECTION:
      ${booksContext}
      
      RULES:
      1. ONLY recommend books that are in the list above. If we don't have a specific book, politely suggest a similar one we DO have.
      2. Keep your answers warm, concise, and professional, like a real librarian.
      3. If a user asks something unrelated to books, gently bring them back to the world of literature.
      4. Format your recommendations clearly (e.g., using bold for titles).
      5. Mention the category or price if it helps the user decide.
    `;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood! I am Booksie, your BookSphere librarian. How can I help you find a book today?" }] },
                ...history.map(h => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.parts }] }))
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return { text };
    } catch (error) {
        console.error("AI Librarian Error:", error);
        return { error: "I'm having a bit of trouble connecting to my library records. Please try again in a moment!" };
    }
}
