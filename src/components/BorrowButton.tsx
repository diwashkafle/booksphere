"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { borrowBook } from "@/app/actions/lending";

interface BorrowButtonProps {
    bookId: string;
    bookTitle: string;
}

export default function BorrowButton({ bookId, bookTitle }: BorrowButtonProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleBorrow = async () => {
        if (!session) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await borrowBook(bookId);
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || "Failed to borrow book");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold border border-green-100">
                Success! You have borrowed "{bookTitle}". Check your library.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <button
                onClick={handleBorrow}
                disabled={loading}
                className="w-full btn-secondary py-4 text-lg font-bold shadow-lg shadow-secondary/20 disabled:opacity-50"
            >
                {loading ? "Processing..." : "BORROW EBOOK NOW"}
            </button>
            {error && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                    {error}
                </p>
            )}
        </div>
    );
}
