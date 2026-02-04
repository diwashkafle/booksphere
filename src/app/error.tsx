"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10" />
            </div>
            <div>
                <h2 className="text-3xl font-heading font-bold mb-2">Something went wrong!</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                    We encountered an error. If this persists, the database might be in read-only mode or temporarily unavailable.
                </p>
            </div>
            <button
                onClick={() => reset()}
                className="btn-primary flex items-center gap-2"
            >
                <RefreshCcw className="w-4 h-4" />
                Try again
            </button>
            <a href="/" className="text-sm font-bold text-primary hover:underline">
                Back to Home
            </a>
        </div>
    );
}
