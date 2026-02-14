import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import EditBookForm from "@/components/EditBookForm";

export default async function EditBookPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || session.user.role !== "merchant") {
        redirect("/");
    }

    const book = await db.query.books.findFirst({
        where: eq(books.id, params.id),
    });

    if (!book) {
        notFound();
    }

    return <EditBookForm book={book} />;
}
