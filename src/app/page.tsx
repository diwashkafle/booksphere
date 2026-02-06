import { db } from "@/db";
import { books } from "@/db/schema";
import { ilike, or, eq, and } from "drizzle-orm";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";

interface HomeProps {
    searchParams: { q?: string; category?: string };
}

export default async function Home({ searchParams }: HomeProps) {
    const query = searchParams.q;
    const category = searchParams.category;

    const filters = [eq(books.status, "published")];

    if (query) {
        filters.push(or(ilike(books.title, `%${query}%`), ilike(books.author, `%${query}%`)) as any);
    }

    if (category) {
        filters.push(eq(books.category, category));
    }

    const allBooks = await db.query.books.findMany({
        where: and(...filters),
        orderBy: (books: any, { asc }: any) => [asc(books.title)],
    });

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
                    <h2 className="text-2xl font-bold font-heading">
                        {query ? `Search Results for "${query}"` : "Featured Books"}
                    </h2>
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

                {allBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {allBooks.map((book: any) => (
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
