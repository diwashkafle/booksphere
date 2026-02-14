"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const navLinks = [
        { name: "Browse", href: "/" },
        { name: "Profile", href: "/profile", auth: true },
        { name: "Merchant", href: "/merchant/dashboard", role: "merchant" },
        { name: "Admin", href: "/admin", role: "admin" },
    ];

    const filteredLinks = navLinks.filter(
        (link) => {
            if (link.auth && !session) return false;
            if (link.role && session?.user?.role !== link.role && session?.user?.role !== "admin") return false;
            return true;
        }
    );

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center">
                        <img src="/logo.png" alt="BookSphere Logo" className="h-10 w-auto" />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {filteredLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-text-secondary"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-text-secondary" />
                                </div>
                            </div>
                        ) : (
                            <Link href="/auth/login" className="btn-primary py-1.5 text-sm">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-text-secondary focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {filteredLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-gray-50"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {!session && (
                            <Link
                                href="/auth/login"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-primary"
                            >
                                Login
                            </Link>
                        )}
                        {session && (
                            <button
                                onClick={() => signOut()}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-50"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
