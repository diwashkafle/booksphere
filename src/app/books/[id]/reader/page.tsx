export const dynamic = "force-dynamic";

import { db } from "@/db";
import { books, lendingRecords, orders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft, Lock, FileText, BookOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ReaderPageProps {
    params: { id: string };
}

export default async function ReaderPage({ params }: ReaderPageProps) {
    const session = await auth();
    if (!session) {
        redirect(`/auth/login?callbackUrl=/books/${params.id}/reader`);
    }

    const { id } = params;
    const book = await db.query.books.findFirst({
        where: eq(books.id, id),
    });

    if (!book) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-10">
                <h1 className="text-2xl font-bold text-red-400 mb-4">Book Not Found</h1>
                <p>The ID <code className="bg-white/10 px-2 py-1 rounded">{id}</code> does not exist in our library.</p>
                <Link href="/" className="mt-8 text-primary hover:underline">Return to Browse</Link>
            </div>
        );
    }

    if (!book.ebookPdfUrl || book.ebookPdfUrl.trim() === "") {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mb-6">
                    <FileText size={40} />
                </div>
                <h1 className="text-2xl font-bold mb-4">PDF File Missing</h1>
                <p className="max-w-md text-white/60">
                    The merchant has marked <span className="text-white font-bold">"{book.title}"</span> as an ebook,
                    but the actual PDF file hasn't been uploaded yet.
                </p>
                <Link href={`/books/${id}`} className="mt-8 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition-all">
                    Back to Book Details
                </Link>
            </div>
        );
    }

    // Access Control Logic
    const activeLending = await db.query.lendingRecords.findFirst({
        where: and(
            eq(lendingRecords.userId, session.user.id),
            eq(lendingRecords.bookId, id),
            eq(lendingRecords.status, "active")
        ),
    });

    const purchase = await db.query.orders.findFirst({
        where: and(
            eq(orders.userId, session.user.id),
            eq(orders.bookId, id),
            eq(orders.status, "completed"),
            eq(orders.type, "purchase")
        ),
    });

    const isAuthorized = !!activeLending || !!purchase || session.user.role === "admin";

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <Lock className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
                <p className="text-white/60 max-w-md mb-8">
                    You need an active borrow or completed purchase to read this book.
                </p>
                <Link href={`/books/${id}`} className="bg-primary text-white py-3 px-8 rounded-xl font-bold">
                    Back to Book Details
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden text-gray-900 font-sans">
            {/* Navbar / Reader Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-5">
                    <Link
                        href={`/books/${id}`}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-500 hover:text-primary transition-all group"
                        title="Back to Details"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-4">
                        {book.imageUrl && (
                            <img src={book.imageUrl} alt="" className="w-10 h-14 object-cover rounded shadow-sm border border-gray-100 hidden md:block" />
                        )}
                        <div>
                            <h2 className="font-bold text-lg leading-tight text-gray-900 truncate max-w-[200px] md:max-w-md">{book.title}</h2>
                            <p className="text-primary text-[10px] uppercase font-black tracking-[0.3em] mt-1">{book.author}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Authorized View
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* PDF Viewer Container - CLEAN LIGHT THEME */}
                <main className="flex-1 bg-gray-200/50 relative p-4 md:p-10 overflow-auto flex justify-center">
                    <div className="w-full max-w-5xl h-full bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col">
                        <div className="flex-1 relative">
                            <iframe
                                src={`${book.ebookPdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                className="w-full h-full border-none"
                                title={book.title}
                            />
                            {/* Protection Overlay (Optional: makes it harder to right-click) */}
                            <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5" />
                        </div>
                    </div>
                </main>

                {/* Sidebar - Quick Info */}
                <aside className="w-80 bg-white border-l border-gray-100 p-8 hidden lg:flex flex-col gap-10 overflow-y-auto shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Book Overview</h3>
                        <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                            {book.description?.slice(0, 250)}...
                        </p>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100">
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Digital Rights Active</p>
                                    <p className="text-[10px] text-gray-400">Offline access restricted</p>
                                </div>
                            </div>
                            <div className="text-[9px] text-gray-400 leading-normal">
                                Licensed to <span className="text-gray-700 font-bold">{session.user.name}</span>.<br />
                                Unauthorized distribution is prohibited.
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
