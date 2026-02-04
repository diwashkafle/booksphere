"use client";

import { createBook } from "@/app/actions/books";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export default function NewBookPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await createBook(formData);
            router.push("/merchant/dashboard");
        } catch (error) {
            alert("Failed to create book");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Link href="/merchant/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h1 className="text-3xl font-heading font-bold mb-6">List a New Book</h1>

                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Book Title</label>
                            <input type="text" name="title" required className="input-field" placeholder="The Great Gatsby" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Author</label>
                            <input type="text" name="author" required className="input-field" placeholder="F. Scott Fitzgerald" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                        <select name="category" className="input-field">
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Biography">Biography</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Price (USD)</label>
                            <input type="number" step="0.01" name="price" required className="input-field" placeholder="9.99" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Image URL</label>
                            <input type="url" name="imageUrl" className="input-field" placeholder="https://example.com/cover.jpg" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                        <textarea name="description" rows={4} className="input-field" placeholder="Enter book synopsis..."></textarea>
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                        {loading ? "Listing Book..." : (
                            <>
                                <Upload className="w-5 h-5" />
                                List Book for Approval
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
