import { db } from "./src/db";
import { books } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkBook() {
    const id = "4a6fdce4-2683-447e-854d-1072df21ae51";
    console.log(`Checking book: ${id}`);

    const book = await db.query.books.findFirst({
        where: eq(books.id, id),
    });

    if (!book) {
        console.log("BOOK NOT FOUND");
    } else {
        console.log("BOOK FOUND:", {
            title: book.title,
            ebookPdfUrl: book.ebookPdfUrl,
            status: book.status
        });
    }
}

checkBook().then(() => process.exit());
