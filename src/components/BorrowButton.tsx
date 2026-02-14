"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";

interface BorrowButtonProps {
    bookId: string;
    bookTitle: string;
    price: number; // in cents
}

export default function BorrowButton({ bookId, bookTitle, price }: BorrowButtonProps) {
    const { data: session } = useSession();
    const [weeks, setWeeks] = useState(1);
    const router = useRouter();

    const borrowPrice = Math.round((price * 0.2) * weeks);

    const handleBorrowRedirect = () => {
        if (!session) {
            router.push("/auth/login");
            return;
        }

        // Redirect to checkout with borrow params
        router.push(`/checkout/${bookId}?type=borrow&weeks=${weeks}&amount=${borrowPrice}`);
    };

    return (
        <div className="space-y-4 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-secondary font-bold">
                    <Clock size={18} />
                    <span>Borrow Duration</span>
                </div>
                <select
                    value={weeks}
                    onChange={(e) => setWeeks(parseInt(e.target.value))}
                    className="bg-white border border-secondary/20 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-secondary/20 outline-none"
                >
                    {[1, 2, 3, 4].map(w => (
                        <option key={w} value={w}>{w} {w === 1 ? 'Week' : 'Weeks'}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Fee (20% per week)</span>
                <span className="font-bold text-secondary">${(borrowPrice / 100).toFixed(2)}</span>
            </div>

            <button
                onClick={handleBorrowRedirect}
                className="w-full bg-secondary text-white py-3 rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                BORROW FOR ${(borrowPrice / 100).toFixed(2)}
            </button>
        </div>
    );
}
