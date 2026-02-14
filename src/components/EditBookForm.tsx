"use client";

import { updateBook } from "@/app/actions/books";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Upload, Image as ImageIcon, X, Save } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";

export default function EditBookForm({ book }: { book: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(book.imageUrl || "");

    async function handleSubmit(formData: FormData) {
        if (!imageUrl) {
            alert("Please upload a book cover image first.");
            return;
        }

        setLoading(true);
        formData.set("imageUrl", imageUrl);

        try {
            await updateBook(formData, book.id);
            router.push("/merchant/dashboard");
        } catch (error) {
            alert("Failed to update book");
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
                <h1 className="text-3xl font-heading font-bold mb-2">Edit Book</h1>
                <p className="text-text-secondary mb-8 text-sm">Update your book details and click save.</p>

                <form action={handleSubmit} className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Book Cover Image</label>
                        {imageUrl ? (
                            <div className="relative w-40 h-56 rounded-xl overflow-hidden shadow-lg border-2 border-primary/20 bg-gray-50">
                                <img src={imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setImageUrl("")}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50 hover:border-primary/50 transition-colors">
                                <UploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        setImageUrl(res[0].url);
                                    }}
                                    onUploadError={(error) => {
                                        alert(`ERROR! ${error.message}`);
                                    }}
                                    appearance={{
                                        button: "bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20",
                                        allowedContent: "text-[10px] text-gray-400 mt-2"
                                    }}
                                />
                            </div>
                        )}
                        <input type="hidden" name="imageUrl" value={imageUrl} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Book Title</label>
                            <input type="text" name="title" required defaultValue={book.title} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Author</label>
                            <input type="text" name="author" required defaultValue={book.author} className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                        <select name="category" defaultValue={book.category} className="input-field">
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Biography">Biography</option>
                            <option value="Personal Development">Personal Development</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Price (USD)</label>
                            <input type="number" step="0.01" name="price" required defaultValue={book.price / 100} className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                        <textarea name="description" rows={4} defaultValue={book.description || ""} className="input-field"></textarea>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-bold text-text-primary mb-1">Formats & Availability</p>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="isEbook" defaultChecked={book.isEbook} className="w-5 h-5 rounded border-gray-300 text-primary cursor-pointer" />
                                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Available as Ebook</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="isPhysical" defaultChecked={book.isPhysical} className="w-5 h-5 rounded border-gray-300 text-primary cursor-pointer" />
                                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Available as Physical Copy</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                        {loading ? "Updating..." : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
