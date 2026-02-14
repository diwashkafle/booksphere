"use client";

import { updateBook } from "@/app/actions/books";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Upload, Image as ImageIcon, X, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";

export default function EditBookForm({ book }: { book: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(book.imageUrl || "");
    const [ebookPdfUrl, setEbookPdfUrl] = useState(book.ebookPdfUrl || "");
    const [isEbookSelected, setIsEbookSelected] = useState(book.isEbook || false);

    async function handleSubmit(formData: FormData) {
        if (!imageUrl) {
            alert("Please upload a book cover image first.");
            return;
        }

        setLoading(true);
        formData.set("imageUrl", imageUrl);
        formData.set("ebookPdfUrl", ebookPdfUrl);

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
                            <option value="History">History</option>
                            <option value="Business">Business</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Thriller">Thriller</option>
                            <option value="Romance">Romance</option>
                            <option value="Horror">Horror</option>
                            <option value="Personal Development">Personal Development</option>
                            <option value="Poetry">Poetry</option>
                            <option value="Self-Help">Self-Help</option>
                            <option value="Travel">Travel</option>
                            <option value="Cooking">Cooking</option>
                            <option value="Science">Science</option>
                            <option value="Technology">Technology</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Price (Rs.)</label>
                            <input type="number" step="0.01" name="price" required defaultValue={book.price / 100} className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                        <textarea name="description" rows={4} defaultValue={book.description || ""} className="input-field"></textarea>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                        <p className="text-sm font-bold text-text-primary mb-1">Formats & Availability</p>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isEbook"
                                    checked={isEbookSelected}
                                    onChange={(e) => setIsEbookSelected(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary cursor-pointer"
                                />
                                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Available as Ebook</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="isPhysical" defaultChecked={book.isPhysical} className="w-5 h-5 rounded border-gray-300 text-primary cursor-pointer" />
                                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Available as Physical Copy</span>
                            </label>
                        </div>

                        {isEbookSelected && (
                            <div className="pt-4 border-t border-gray-200 animate-in fade-in duration-300">
                                <label className="block text-sm font-medium text-text-secondary mb-3">Ebook PDF File</label>
                                {ebookPdfUrl ? (
                                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-primary/20 shadow-sm">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-text-primary truncate">ebook_ready.pdf</p>
                                            <p className="text-[10px] text-gray-400">PDF Document uploaded</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEbookPdfUrl("")}
                                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-100 rounded-xl hover:border-primary/30 transition-colors">
                                        <UploadButton
                                            endpoint="pdfUploader"
                                            onClientUploadComplete={(res) => {
                                                setEbookPdfUrl(res[0].url);
                                            }}
                                            onUploadError={(error: Error) => {
                                                alert(`PDF ERROR! ${error.message}`);
                                            }}
                                            appearance={{
                                                button: "bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/20 transition-all",
                                                allowedContent: "text-[10px] text-gray-400 mt-2"
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        <input type="hidden" name="imageUrl" value={imageUrl} />
                        <input type="hidden" name="ebookPdfUrl" value={ebookPdfUrl} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Updating...
                            </>
                        ) : (
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
