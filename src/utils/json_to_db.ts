import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../db";
import { books } from "../db/schema";


const merchantIds = [
    "49cea25f-323a-4451-84cf-ddd7f27bfd4c",
    "cde2dd04-d76e-4057-a6de-16d55f0cfc8c",
    "debc1111-af16-472e-b56b-7d52c039f5f6",
] as const;

function randomMerchantId() {
    return merchantIds[Math.floor(Math.random() * merchantIds.length)];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const booksData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "books.json"), "utf-8")
);

async function importBooks() {
    await db.insert(books).values(
        booksData.map((book: any) => ({
            title: book.title,
            author: book.author,
            description: book.description ?? null,
            price: book.price,
            stock: book.stock ?? 0,
            category: book.category ?? null,
            imageUrl: book.imageUrl ?? null,
            merchantId: randomMerchantId(),
            status: book.status ?? "published",
            // createdAt is auto-handled by defaultNow()
        }))
    );

    console.log(`✅ Imported ${booksData.length} books`);
    process.exit(0);
}

importBooks().catch(err => {
    console.error("❌ Import failed:", err);
    process.exit(1);
});
