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
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
            <div className="relative flex items-center">
                <div className="absolute left-5 text-gray-400 group-focus-within:text-primary transition-colors">
                    <SearchIcon size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search titles, authors, genres..."
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-32 py-4 text-sm font-medium focus:border-primary/30 focus:ring-4 focus:ring-primary/5 shadow-xl shadow-gray-200/50 outline-none transition-all placeholder:text-gray-300"
                />
                <div className="absolute right-2 flex items-center gap-2">
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Search
                    </button>
                </div>
            </div>
        </form>
    );
};

export default SearchBar;
