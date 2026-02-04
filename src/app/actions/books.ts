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

    await db.insert(books).values({
        title,
        author,
        description,
        price,
        category,
        imageUrl,
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
