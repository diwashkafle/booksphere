"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TFIDF } from "@/lib/tfidf";

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

        const booksContextFull = allBooks.map((b: any) =>
            `- [ID: ${b.id}] ${b.title} by ${b.author} [Category: ${b.category}] ($${(b.price / 100).toFixed(2)}) Description: ${b.description}`
        );

        // 2. Perform Hybrid Search (TF/IDF)
        const tfidf = new TFIDF(booksContextFull);
        const similarIndices = tfidf.getSimilarDocuments(message, 5);

        // 3. Prioritize context
        let focusedContext = "";
        if (similarIndices.length > 0) {
            focusedContext = "STRICT RECOMMENDATION CANDIDATES (Statistical Matches):\n" +
                similarIndices.map(idx => booksContextFull[idx]).join("\n");
        } else {
            focusedContext = "ALL AVAILABLE BOOKS (No direct matches, use your best judgment):\n" +
                booksContextFull.slice(0, 10).join("\n");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
      You are "Booksie", the official Virtual Librarian for the BookSphere online bookstore.
      
      ROLE: You are an expert curator with a warm, encouraging, and slightly sophisticated tone. You love helping people find the perfect companion in a book.
      
      HERE IS OUR COLLECTION:
      ${focusedContext}
      
      - IF A USER ASKS FOR A BOOK NOT IN THIS LIST:
        1. Acknowledge that while that book is a classic/great choice, we don't currently have it in our local collection. 
        2. IMMEDIATELY suggest the best alternative from WITHIN the provided list above that matches the vibe or genre.
      
      GUIDELINES:
      - Always refer to yourself as the BookSphere Librarian.
      - Use phrases like "In our collection...", "I would recommend...", "A wonderful choice would be...".
      - Keep responses helpful but concise.
      - Use Markdown for bolding titles and creating lists.
      - IMPORTANT: When recommending a book from the list, ALWAYS provide a link to it using this exact format: [Title](/books/ID). Replace ID with the actual ID provided for that book.
      - If they ask for prices, mention the specific prices from the list.
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
