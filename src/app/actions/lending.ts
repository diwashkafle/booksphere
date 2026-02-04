"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { lendingRecords, books } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function borrowBook(bookId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const book = await db.query.books.findFirst({
            where: (books, { eq }) => eq(books.id, bookId),
        });

        if (!book) {
            return { success: false, error: "Book not found" };
        }

        if (book.stock <= 0) {
            return { success: false, error: "Book out of stock" };
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14); // 14 days borrowing

        await db.insert(lendingRecords).values({
            userId: session.user.id,
            bookId: book.id,
            expiryDate,
            status: "active",
        });

        // We don't decrement stock for ebooks usually, but for POC we can or just leave it.
        // Let's assume ebooks have "infinite" stock if it's high or just a flag.

        revalidatePath(`/books/${bookId}`);
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Borrow error:", error);
        return { success: false, error: "Failed to record borrowing" };
    }
}
