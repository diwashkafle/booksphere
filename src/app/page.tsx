import { db } from "@/db";
import { books } from "@/db/schema";
import { ilike, or, eq, and } from "drizzle-orm";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { TFIDF } from "@/lib/tfidf";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface HomeProps {
    searchParams: { q?: string; category?: string };
}

export default async function Home({ searchParams }: HomeProps) {
    const query = searchParams.q;
    const category = searchParams.category;

    // 1. Fetch all published books
    let allBooksRaw = await db.query.books.findMany({
        where: eq(books.status, "published"),
    });

    let displayBooks = allBooksRaw;

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
                    <div className="flex gap-2">
                        {["Fiction", "Non-Fiction", "Sci-Fi", "Mystery"].map((cat) => (
                            <a
                                key={cat}
                                href={`/?category=${cat}`}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${category === cat
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-text-secondary border-gray-200 hover:border-primary hover:text-primary"
                                    }`}
                            >
                                {cat}
                            </a>
                        ))}
                        {category && (
                            <a href="/" className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                                Clear
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
