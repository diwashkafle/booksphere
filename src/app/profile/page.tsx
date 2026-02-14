import { db } from "@/db";
import { orders, books, lendingRecords } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ShoppingBag, BookOpen, User, Clock } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const userId = session.user.id as string;

    // Fetch All Orders (Purchases & Borrow Fees)
    const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        with: {
            book: true
        },
        orderBy: [desc(orders.createdAt)]
    });

    // Fetch Active Borrows (The actual rental records)
    const userBorrows = await db.query.lendingRecords.findMany({
        where: eq(lendingRecords.userId, userId),
        with: {
            book: true
        },
        orderBy: [desc(lendingRecords.borrowDate)]
    });

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <div className="flex items-center gap-6 mb-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/5">
                    <User size={40} />
                </div>
                <div>
                    <h1 className="text-3xl font-heading font-bold">{session.user.name}</h1>
                    <p className="text-text-secondary">{session.user.email}</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full border border-primary/10 uppercase tracking-widest">
                        {session.user.role} Account
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Order History Section */}
                <section>
                    <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3">
                        <ShoppingBag className="text-primary" size={24} />
                        Payment History
                    </h2>
                    <div className="space-y-4">
                        {userOrders.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                                <p className="text-text-secondary">No transaction history found.</p>
                                <Link href="/" className="text-primary font-bold text-sm mt-2 inline-block hover:underline">
                                    Browse Bookstore →
                                </Link>
                            </div>
                        ) : (
                            userOrders.map((order: any) => (
                                <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:border-primary/20 transition-all hover:shadow-md">
                                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {order.book.imageUrl ? (
                                            <img src={order.book.imageUrl} alt={order.book.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm line-clamp-1">{order.book.title}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${order.type === 'purchase'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-secondary/10 text-secondary'
                                                }`}>
                                                {order.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-secondary mb-2">{order.book.author}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[10px] font-medium text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-sm font-bold text-primary">${(order.amount / 100).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Borrows Section */}
                <section>
                    <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3">
                        <Clock className="text-secondary" size={24} />
                        Active Borrows
                    </h2>
                    <div className="space-y-4">
                        {userBorrows.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                                <p className="text-text-secondary">No books currently borrowed.</p>
                            </div>
                        ) : (
                            userBorrows.map((borrow: any) => (
                                <div key={borrow.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {borrow.book.imageUrl ? (
                                            <img src={borrow.book.imageUrl} alt={borrow.book.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm line-clamp-1">{borrow.book.title}</h4>
                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
                                                {borrow.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-secondary mb-2">{borrow.book.author}</p>
                                        <div className="text-[10px] text-gray-400 mt-auto">
                                            Expires: {new Date(borrow.expiryDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
