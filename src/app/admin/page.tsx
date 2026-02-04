import { auth } from "@/lib/auth";
import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AdminBookCard from "@/components/AdminBookCard";

export default async function AdminPanel() {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
        redirect("/");
    }

    const pendingBooks = await db.query.books.findMany({
        where: eq(books.status, "pending"),
        orderBy: (books: any, { desc }: any) => [desc(books.createdAt)],
    });

    const publishedBooks = await db.query.books.findMany({
        where: eq(books.status, "published"),
        orderBy: (books: any, { desc }: any) => [desc(books.createdAt)],
        limit: 10,
    });

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-heading font-bold mb-2">Admin Moderation</h1>
                <p className="text-text-secondary">Approve or unpublish book listings from merchants.</p>
            </div>

            <section>
                <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
                    Pending Approval <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">{pendingBooks.length}</span>
                </h2>
                {pendingBooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingBooks.map((book: any) => (
                            <AdminBookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-text-secondary">
                        No pending books to moderate.
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-bold font-heading mb-6">Recently Published</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                    {publishedBooks.map((book: any) => (
                        <AdminBookCard key={book.id} book={book} />
                    ))}
                </div>
            </section>
        </div>
    );
}
