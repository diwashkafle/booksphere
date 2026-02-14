import { db } from "@/db";
import { books, lendingRecords, orders } from "@/db/schema";
import { ilike, or, eq, and } from "drizzle-orm";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { TFIDF } from "@/lib/tfidf";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface HomeProps {
    searchParams: { q?: string; category?: string };
}

export default async function Home({ searchParams }: HomeProps) {
    const session = await auth();
    const query = searchParams.q;
    const category = searchParams.category;

    // 1. Fetch user's active borrows/purchases if logged in
    let userBorrowedBookIds: Set<string> = new Set();
    if (session?.user?.id) {
        const [activeBorrows, completedPurchases] = await Promise.all([
            db.query.lendingRecords.findMany({
                where: and(
                    eq(lendingRecords.userId, session.user.id),
                    eq(lendingRecords.status, "active")
                ),
                columns: { bookId: true }
            }),
            db.query.orders.findMany({
                where: and(
                    eq(orders.userId, session.user.id),
                    eq(orders.status, "completed"),
                    eq(orders.type, "purchase")
                ),
                columns: { bookId: true }
            })
        ]);

        activeBorrows.forEach((r: { bookId: string }) => userBorrowedBookIds.add(r.bookId));
        completedPurchases.forEach((o: { bookId: string }) => userBorrowedBookIds.add(o.bookId));
    }

    // 2. Fetch all published books
    let allBooksRaw = await db.query.books.findMany({
        where: eq(books.status, "published"),
    });

    let displayBooks = allBooksRaw;
    // ... (rest of filtering/search logic remains same)

    // 2. Filter by category if selected
    if (category) {
        displayBooks = displayBooks.filter((b: any) => b.category === category);
    }

    // 3. Intelligent Search Logic
    let isSmartSearch = false;
    if (query) {
        const queryLower = query.toLowerCase();

        // Prepare data for TF-IDF
        const searchDocs = displayBooks.map((b: any) =>
            `${b.title} ${b.author} ${b.description || ""} ${b.category || ""}`.toLowerCase()
        );

        const tfidf = new TFIDF(searchDocs);

        // Use TFIDF for the actual ranking
        const topIndices = tfidf.getSimilarDocuments(query, displayBooks.length);

        // Re-calculate displayBooks based on intelligent ranking
        const finalResults = displayBooks
            .map((b: any, i: number) => {
                const isDirectMatch = b.title.toLowerCase().includes(queryLower) || b.author.toLowerCase().includes(queryLower);
                const manualBonus = isDirectMatch ? 50 : 0;

                // Find if this book index is in the TFIDF results and get its position
                const tfidfRank = topIndices.indexOf(i);
                // Inverse rank score (the higher the rank, the higher the score)
                const tfidfScore = tfidfRank !== -1 ? (topIndices.length - tfidfRank) : 0;

                return { ...b, totalScore: manualBonus + tfidfScore };
            })
            .filter((b: any) => b.totalScore > 0)
            .sort((a: any, b: any) => (b.totalScore || 0) - (a.totalScore || 0));

        displayBooks = finalResults;
        isSmartSearch = true;
    } else {
        // Default sort by title if no search
        displayBooks = [...displayBooks].sort((a: any, b: any) => a.title.localeCompare(b.title));
    }

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl">
                <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-text-primary">
                    Discover Your Next <span className="text-primary">Great Read</span>
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10">
                    Explore thousands of ebooks from talented authors. Borrow instantly and start reading your favorite stories today.
                </p>
                <SearchBar />
            </section>

            {/* Book Grid */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-heading">
                            {query ? `Results for "${query}"` : "Featured Books"}
                        </h2>
                        {isSmartSearch && query && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-tighter border border-primary/20">
                                <Sparkles className="w-3 h-3" />
                                Smart Semantic Ranking
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Explore Genres</span>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 overflow-x-auto no-scrollbar">
                            <div className="flex gap-2 min-w-max pb-1">
                                {["Fiction", "Non-Fiction", "Sci-Fi", "Mystery", "Biography", "Business", "History", "Fantasy", "Thriller", "Romance", "Horror", "Poetry", "Self-Help", "Travel", "Cooking", "Art", "Science", "Technology", "Health", "Parenting", "Spirituality", "Comics", "Young Adult"].map((cat) => (
                                    <a
                                        key={cat}
                                        href={`/?category=${cat}`}
                                        className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${category === cat
                                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                            : "bg-white text-text-secondary border-gray-200 hover:border-primary/30 hover:text-primary hover:bg-primary/5 shadow-sm"
                                            }`}
                                    >
                                        {cat}
                                    </a>
                                ))}
                            </div>
                        </div>
                        {category && (
                            <a href="/" className="flex-shrink-0 text-xs font-bold px-4 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100 shadow-sm">
                                Reset Filter
                            </a>
                        )}
                    </div>
                </div>

                {displayBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {displayBooks.map((book: any) => (
                            <BookCard
                                key={book.id}
                                id={book.id}
                                title={book.title}
                                author={book.author}
                                price={book.price}
                                imageUrl={book.imageUrl}
                                category={book.category}
                                isAuthorized={userBorrowedBookIds.has(book.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <p className="text-text-secondary">No books found matching your criteria.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
