import { auth } from "@/lib/auth";
import { db } from "@/db";
import { books, merchants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Plus, Package, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import MerchantBookActions from "@/components/MerchantBookActions";

export default async function MerchantDashboard() {
    const session = await auth();

    if (!session || session.user.role !== "merchant") {
        redirect("/");
    }

    const merchant = await db.query.merchants.findFirst({
        where: eq(merchants.userId, session.user.id),
    });

    if (!merchant) {
        return <div>Merchant profile not found. Please contact support.</div>;
    }

    const merchantBooks = await db.query.books.findMany({
        where: eq(books.merchantId, merchant.id),
        orderBy: (books: any, { desc }: any) => [desc(books.createdAt)],
    });

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold">Merchant Dashboard</h1>
                    <p className="text-text-secondary mt-1">Manage your book listings and track performance.</p>
                </div>
                <Link href="/merchant/books/new" className="btn-primary flex items-center gap-2 self-start md:self-auto">
                    <Plus className="w-5 h-5" />
                    Add New Book
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-text-secondary text-sm">Total Books</p>
                        <p className="text-2xl font-bold">{merchantBooks.length}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-text-secondary text-sm">Published</p>
                        <p className="text-2xl font-bold">
                            {merchantBooks.filter((b: any) => b.status === "published").length}
                        </p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-text-secondary text-sm">Pending Approval</p>
                        <p className="text-2xl font-bold">
                            {merchantBooks.filter((b: any) => b.status === "pending").length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Book List */}
            <div className="card border-none shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-text-secondary text-sm font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Book Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {merchantBooks.map((book: any) => (
                                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                                {book.imageUrl && <img src={book.imageUrl} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{book.title}</p>
                                                <p className="text-xs text-text-secondary">{book.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {book.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">Rs. {(book.price / 100).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${book.status === "published"
                                                ? "text-green-600 bg-green-50 border-green-100"
                                                : book.status === "pending"
                                                    ? "text-orange-600 bg-orange-50 border-orange-100"
                                                    : "text-red-600 bg-red-50 border-red-100"
                                                }`}
                                        >
                                            {book.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-text-secondary">
                                        {new Date(book.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <MerchantBookActions bookId={book.id} />
                                    </td>
                                </tr>
                            ))}
                            {merchantBooks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-text-secondary">
                                        You haven't added any books yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
