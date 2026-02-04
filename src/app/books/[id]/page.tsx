import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Book, Calendar, ShieldCheck, Tag, User as UserIcon } from "lucide-react";
import BorrowButton from "@/components/BorrowButton";

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

    return (
        <div className="max-w-6xl mx-auto py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Book Cover */}
                <div className="bg-gray-100 rounded-3xl aspect-[3/4] overflow-hidden shadow-2xl sticky top-24">
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
                            <span className="text-text-secondary font-medium">Borrowing Price</span>
                            <span className="text-3xl font-heading font-bold text-primary">
                                ${(book.price / 100).toFixed(2)}
                            </span>
                        </div>
                        <BorrowButton bookId={book.id} bookTitle={book.title} />
                        <p className="text-[10px] text-center text-text-secondary">
                            14-day borrowing period included. Ebook access is instant.
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
        </div>
    );
}
