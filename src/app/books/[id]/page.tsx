import { db } from "@/db";
import { books } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Book, Calendar, ShieldCheck, Tag, User as UserIcon, Layers } from "lucide-react";
import BorrowButton from "@/components/BorrowButton";
import { TFIDF } from "@/lib/tfidf";
import BookCard from "@/components/BookCard";
import Link from "next/link";

interface BookDetailPageProps {
    params: { id: string };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
    const book = await db.query.books.findFirst({
        where: eq(books.id, params.id),
    });

    if (!book) {
        notFound();
    }

    // 2. Fetch candidates for "Similar Books"
    const otherBooks = await db.query.books.findMany({
        where: and(eq(books.status, "published"), ne(books.id, book.id)),
    });

    const currentDoc = `${book.title} ${book.author} ${book.description} ${book.category}`;
    const otherDocs = otherBooks.map((b: any) => `${b.title} ${b.author} ${b.description} ${b.category}`);

    const tfidf = new TFIDF([currentDoc, ...otherDocs]);
    // index 0 is currentDoc, so we want similar docs from index 1+
    const similarIndices = tfidf.getSimilarDocuments(currentDoc, 5);

    // Adjust indices back to otherBooks (-1 because currentDoc was at index 0)
    const similarBooks = similarIndices
        .filter(idx => idx > 0)
        .map(idx => otherBooks[idx - 1])
        .slice(0, 4);

    return (
        <div className="max-w-6xl mx-auto py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Book Cover */}
                <div className="bg-gray-100 rounded-3xl aspect-[3/4] overflow-hidden shadow-xl sticky top-24 max-w-sm mx-auto w-full">
                    {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <Book className="w-24 h-24 mb-4 opacity-10" />
                            <span className="text-xl font-medium">No Cover Available</span>
                        </div>
                    )}
                </div>

                {/* Book Info */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                                {book.category || "Ebook"}
                            </span>
                            {book.status === "published" && (
                                <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                    Published
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{book.title}</h1>
                        <div className="flex items-center gap-4 text-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <UserIcon className="w-4 h-4 text-primary" />
                                <span className="font-medium">{book.author}</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>{new Date(book.createdAt).getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-text-secondary font-medium">Standard Price</span>
                            <span className="text-3xl font-heading font-bold text-primary">
                                Rs. {(book.price / 100).toFixed(2)}
                            </span>
                        </div>

                        {book.isEbook && (
                            <div className="space-y-4 pt-2 border-t border-gray-50 mt-4">
                                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ebook Options</div>
                                <BorrowButton bookId={book.id} bookTitle={book.title} price={book.price} />
                                <Link
                                    href={`/checkout/${book.id}?type=purchase&format=ebook&amount=${book.price}`}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    BUY EBOOK (LIFETIME)
                                </Link>
                            </div>
                        )}

                        {book.isPhysical && (
                            <div className="space-y-4 pt-2 border-t border-gray-50 mt-4">
                                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Physical Copy</div>
                                <Link
                                    href={`/checkout/${book.id}?type=purchase&format=physical&amount=${book.price}`}
                                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    BUY PHYSICAL BOOK
                                </Link>
                            </div>
                        )}

                        {!book.isEbook && !book.isPhysical && (
                            <p className="text-red-500 text-sm italic font-medium">This book is currently unavailable for purchase.</p>
                        )}

                        <p className="text-[10px] text-center text-text-secondary">
                            {book.isPhysical && "Physical books require shipping address and contact info."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                            <Tag className="w-5 h-5 text-primary" />
                            Description
                        </h3>
                        <p className="text-text-secondary leading-relaxed text-lg whitespace-pre-line">
                            {book.description || "No description provided for this book yet."}
                        </p>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium">Safe Checkout</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Book className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">Instant PDF/EPUB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Books Section */}
            {similarBooks.length > 0 && (
                <div className="mt-20 pt-10 border-t border-gray-100">
                    <h2 className="text-2xl font-bold font-heading mb-8 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-primary" />
                        You Might Also Like
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarBooks.map((b) => (
                            <BookCard
                                key={b.id}
                                id={b.id}
                                title={b.title}
                                author={b.author}
                                price={b.price}
                                imageUrl={b.imageUrl}
                                category={b.category}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
