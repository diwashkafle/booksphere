"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { books, merchants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const getFileKey = (url: string) => {
    if (!url) return null;
    const parts = url.split("/");
    return parts[parts.length - 1];
};

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
    const ebookPdfUrl = formData.get("ebookPdfUrl") as string;
    const isEbook = formData.get("isEbook") === "on";
    const isPhysical = formData.get("isPhysical") === "on";

    await db.insert(books).values({
        title,
        author,
        description,
        price,
        category,
        imageUrl,
        ebookPdfUrl,
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

    const book = await db.query.books.findFirst({
        where: eq(books.id, bookId),
    });

    if (!book) throw new Error("Book not found");

    // If merchant, check ownership
    if (session.user.role === "merchant") {
        const merchant = await db.query.merchants.findFirst({
            where: eq(merchants.userId, session.user.id),
        });

        if (!merchant || book.merchantId !== merchant.id) {
            throw new Error("Unauthorized to delete this book");
        }
    }

    // Cleanup files from UploadThing
    const fileKeys: string[] = [];
    if (book.imageUrl) {
        const key = getFileKey(book.imageUrl);
        if (key) fileKeys.push(key);
    }
    if (book.ebookPdfUrl) {
        const key = getFileKey(book.ebookPdfUrl);
        if (key) fileKeys.push(key);
    }

    if (fileKeys.length > 0) {
        try {
            await utapi.deleteFiles(fileKeys);
        } catch (error) {
            console.error("Failed to delete files from UploadThing:", error);
            // We still proceed with DB deletion even if storage cleanup fails
        }
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
    const ebookPdfUrl = formData.get("ebookPdfUrl") as string;
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
            ebookPdfUrl,
            isEbook,
            isPhysical,
        })
        .where(eq(books.id, bookId));

    revalidatePath("/merchant/dashboard");
    revalidatePath(`/books/${bookId}`);
    revalidatePath("/");
}
