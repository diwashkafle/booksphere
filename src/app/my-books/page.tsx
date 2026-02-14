import { db } from "@/db";
import { books, lendingRecords, orders } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BookCard from "@/components/BookCard";
import { Library, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MyBooksPage() {
    const session = await auth();
    if (!session) {
        redirect("/auth/login?callbackUrl=/my-books");
    }

    // 1. Fetch user's active borrows and completed purchases
    const [activeBorrows, completedPurchases] = await Promise.all([
        db.query.lendingRecords.findMany({
            where: and(
                eq(lendingRecords.userId, session.user.id),
                eq(lendingRecords.status, "active")
            ),
            with: {
                book: true
            }
        }),
        db.query.orders.findMany({
            where: and(
                eq(orders.userId, session.user.id),
                eq(orders.status, "completed"),
                eq(orders.type, "purchase")
            ),
            with: {
                book: true
            }
        })
    ]);

    // 2. Extract unique books and mark their type (Borrowed vs Purchased)
    const bookMap = new Map();

    activeBorrows.forEach((record: any) => {
        if (record.book) {
            bookMap.set(record.book.id, {
                ...record.book,
                accessType: "Borrowed",
                expiryDate: record.expiryDate
            });
        }
    });

    completedPurchases.forEach((order: any) => {
        if (order.book) {
            // Note: Purchase takes precedence over borrowing in display
            bookMap.set(order.book.id, {
                ...order.book,
                accessType: "Purchased",
                expiryDate: null
            });
        }
    });

    const myBooks = Array.from(bookMap.values());

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Library className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">MY DIGITAL LIBRARY</h1>
                        <p className="text-gray-500 font-medium">You have access to {myBooks.length} ebooks.</p>
                    </div>
                </div>
            </header>

            {myBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {myBooks.map((book) => (
                        <div key={book.id} className="relative">
                            <BookCard
                                id={book.id}
                                title={book.title}
                                author={book.author}
                                price={book.price}
                                imageUrl={book.imageUrl}
                                category={book.category}
                                isAuthorized={true}
                            />
                            {/* Overlay Badge for access type */}
                            <div className="absolute top-3 right-3 z-10">
                                {book.accessType === "Borrowed" ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest border border-orange-400">
                                        <Clock size={10} />
                                        Borrowed
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest border border-green-500">
                                        <BookOpen size={10} />
                                        Own Forever
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-gray-200" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Your library is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Start exploring our collection to borrow or purchase your first digital book.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black tracking-widest hover:bg-secondary transition-all shadow-xl shadow-primary/20"
                    >
                        BROWSE BOOKS
                    </Link>
                </div>
            )}
        </div>
    );
}
