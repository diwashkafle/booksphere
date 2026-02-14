"use client";

import { useState } from "react";
import { Trash2, Edit } from "lucide-react";
import { deleteBook } from "@/app/actions/books";
import Link from "next/link";

interface MerchantBookActionsProps {
    bookId: string;
}

export default function MerchantBookActions({ bookId }: MerchantBookActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            await deleteBook(bookId);
        } catch (error) {
            alert("Failed to delete book");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/merchant/books/edit/${bookId}`}
                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                title="Edit Book"
            >
                <Edit size={18} />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                title="Delete Book"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
