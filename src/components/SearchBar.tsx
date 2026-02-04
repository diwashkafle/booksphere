"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SearchBar = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        } else {
            router.push("/");
        }
    };

    const clearSearch = () => {
        setQuery("");
        router.push("/");
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for books, authors, or categories..."
                    className="input-field pl-12 pr-12 py-3 shadow-md"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </form>
    );
};

export default SearchBar;
