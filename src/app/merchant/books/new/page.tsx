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

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-bold text-text-primary mb-1">Formats & Availability</p>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="isEbook" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer" />
                                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Available as Ebook</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="isPhysical" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer" />
                                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Available as Physical Copy</span>
                            </label>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">Note: Borrowing is only enabled for books with an Ebook version.</p>
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
