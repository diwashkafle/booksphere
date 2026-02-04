"use client";

import { updateBookStatus } from "@/app/actions/books";
import { Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AdminBookCardProps {
    book: {
        id: string;
        title: string;
        author: string;
        status: string;
        price: number;
        imageUrl?: string | null;
    };
}

export default function AdminBookCard({ book }: AdminBookCardProps) {
    const [loading, setLoading] = useState(false);

    const handleStatusUpdate = async (newStatus: "published" | "unpublished") => {
        setLoading(true);
        try {
            await updateBookStatus(book.id, newStatus);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-4 flex gap-4">
            <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {book.imageUrl && <img src={book.imageUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${book.status === "published" ? "text-green-600 border-green-100 bg-green-50" : "text-orange-600 border-orange-100 bg-orange-50"
                            }`}>
                            {book.status}
                        </span>
                        <Link href={`/books/${book.id}`} target="_blank" className="text-gray-400 hover:text-primary transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                    <h3 className="font-bold text-sm line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-text-secondary mb-2">{book.author}</p>
                    <p className="font-bold text-primary text-sm">${(book.price / 100).toFixed(2)}</p>
                </div>

                <div className="flex gap-2 mt-4">
                    {book.status === "pending" || book.status === "unpublished" ? (
                        <button
                            onClick={() => handleStatusUpdate("published")}
                            disabled={loading}
                            className="flex-grow flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStatusUpdate("unpublished")}
                            disabled={loading}
                            className="flex-grow flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-lg border border-red-100 transition-colors disabled:opacity-50"
                        >
                            <X className="w-3.5 h-3.5" />
                            Unpublish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
