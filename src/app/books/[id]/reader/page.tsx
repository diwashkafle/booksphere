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
        <div className="h-screen flex flex-col bg-[#1a1a1a] overflow-hidden text-white font-sans">
            <div className="bg-[#2a2a2a] border-b border-white/10 p-4 flex items-center justify-between shadow-2xl z-10">
                <div className="flex items-center gap-5">
                    <Link
                        href={`/books/${id}`}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white/70 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-4">
                        {book.imageUrl && (
                            <img src={book.imageUrl} alt="" className="w-10 h-14 object-cover rounded shadow-md border border-white/10 hidden md:block" />
                        )}
                        <div>
                            <h2 className="font-bold text-base leading-tight truncate max-w-[200px] md:max-w-md">{book.title}</h2>
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">{book.author}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 text-[11px] font-bold uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5" />
                        Authorized View
                    </div>
                    <a
                        href={book.ebookPdfUrl}
                        download
                        target="_blank"
                        className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all"
                    >
                        <FileText className="w-5 h-5" />
                    </a>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 bg-black relative">
                    <iframe
                        src={`${book.ebookPdfUrl}#view=FitH&toolbar=1`}
                        className="w-full h-full border-none"
                        title={book.title}
                    />
                </main>

                <aside className="w-80 bg-[#252525] border-l border-white/5 p-6 hidden lg:flex flex-col gap-8 overflow-y-auto">
                    <div>
                        <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">You are reading</h3>
                        <p className="text-sm text-white/80 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                            {book.description?.slice(0, 200)}...
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Reading Progress</h3>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-primary/50" />
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold">DRM Protected</p>
                                <p className="text-[10px] text-white/40">Exclusive to {session.user.name}</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
