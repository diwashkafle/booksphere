"use server";

import { db } from "@/db";
import { orders, books, lendingRecords } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function processMockPayment(
    bookId: string,
    amount: number,
    type: "purchase" | "borrow" = "purchase",
    durationDays?: number
) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "You must be logged in to complete this transaction." };
    }

    try {
        // 1. Validate book existence
        const book = await db.query.books.findFirst({
            where: eq(books.id, bookId),
        });

        if (!book) {
            return { error: "Book not found." };
        }

        // 2. Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 3. Create order record
        await db.insert(orders).values({
            userId: session.user.id,
            bookId: book.id,
            amount: amount,
            type: type,
            status: "completed",
        });

        // 4. If borrow, also create a lending record
        if (type === "borrow" && durationDays) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + durationDays);

            await db.insert(lendingRecords).values({
                userId: session.user.id,
                bookId: book.id,
                expiryDate,
                status: "active",
            });
        }

        revalidatePath("/profile");
        revalidatePath(`/books/${bookId}`);

        return { success: true };
    } catch (error) {
        console.error("Payment Error:", error);
        return { error: "Something went wrong during the checkout process." };
    }
}
