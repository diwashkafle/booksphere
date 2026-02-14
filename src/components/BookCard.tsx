import Link from "next/link";
import { Book } from "lucide-react";

interface BookCardProps {
    id: string;
    title: string;
    author: string;
    price: number;
    imageUrl?: string | null;
    category?: string | null;
}

const BookCard = ({ id, title, author, price, imageUrl, category }: BookCardProps) => {
    return (
        <div className="card group hover:scale-[1.02] transition-all duration-300">
            <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:blur-[2px] transition-all"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                        <Book className="w-12 h-12 mb-2 opacity-20" />
                        <span className="text-sm font-medium">{title}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                    <Link
                        href={`/books/${id}`}
                        className="opacity-0 group-hover:opacity-100 bg-white text-primary px-4 py-2 rounded-full font-semibold shadow-lg transition-all transform translate-y-4 group-hover:translate-y-0"
                    >
                        View Details
                    </Link>
                </div>
            </div>
            <div className="p-4">
                {category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-1 rounded-md mb-2 inline-block">
                        {category}
                    </span>
                )}
                <h3 className="font-heading font-semibold text-lg line-clamp-1">{title}</h3>
                <p className="text-text-secondary text-sm mb-4 line-clamp-1">{author}</p>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-primary font-heading">Rs. {(price / 100).toFixed(2)}</span>
                    <Link href={`/books/${id}`} className="text-xs font-bold text-text-secondary hover:text-primary transition-colors">
                        BORROW →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
