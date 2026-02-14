"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { books, merchants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createBook(formData: FormData) {
    const session = await auth();

    if (!session || (session.user.role !== "merchant" && session.user.role !== "admin")) {
        throw new Error("Unauthorized");
    }

    const merchant = await db.query.merchants.findFirst({
        where: eq(merchants.userId, session.user.id),
    });

    if (!merchant && session.user.role !== "admin") {
        throw new Error("Merchant profile not found");
    }

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const price = parseInt(formData.get("price") as string) * 100; // Convert to cents
    const category = formData.get("category") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const isEbook = formData.get("isEbook") === "on";
    const isPhysical = formData.get("isPhysical") === "on";

    await db.insert(books).values({
        title,
        author,
        description,
        price,
        category,
        imageUrl,
        isEbook,
        isPhysical,
        merchantId: merchant ? merchant.id : "00000000-0000-0000-0000-000000000000", // Fallback for admin
        status: "pending",
    });

    revalidatePath("/merchant/dashboard");
    revalidatePath("/");
}

export async function updateBookStatus(bookId: string, status: "published" | "unpublished" | "pending") {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.update(books)
        .set({ status })
        .where(eq(books.id, bookId));

    revalidatePath("/admin");
    revalidatePath("/");
}
export async function deleteBook(bookId: string) {
    const session = await auth();
    if (!session || (session.user.role !== "merchant" && session.user.role !== "admin")) {
        throw new Error("Unauthorized");
    }

    // If merchant, check ownership
    if (session.user.role === "merchant") {
        const merchant = await db.query.merchants.findFirst({
            where: eq(merchants.userId, session.user.id),
        });

        if (!merchant) throw new Error("Merchant not found");

        const book = await db.query.books.findFirst({
            where: (books: any, { and, eq }: any) => and(eq(books.id, bookId), eq(books.merchantId, merchant.id)),
        });

        if (!book) throw new Error("Book not found or unauthorized");
    }

    await db.delete(books).where(eq(books.id, bookId));

    revalidatePath("/merchant/dashboard");
    revalidatePath("/");
}
export async function updateBook(formData: FormData, bookId: string) {
    const session = await auth();
    if (!session || (session.user.role !== "merchant" && session.user.role !== "admin")) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const price = parseInt(formData.get("price") as string) * 100;
    const category = formData.get("category") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const isEbook = formData.get("isEbook") === "on";
    const isPhysical = formData.get("isPhysical") === "on";

    await db.update(books)
        .set({
            title,
            author,
            description,
            price,
            category,
            imageUrl,
            isEbook,
            isPhysical,
        })
        .where(eq(books.id, bookId));

    revalidatePath("/merchant/dashboard");
    revalidatePath(`/books/${bookId}`);
    revalidatePath("/");
}
