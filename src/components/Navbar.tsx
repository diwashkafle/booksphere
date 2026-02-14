"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, User, LogOut, Menu, X, ChevronDown, LayoutDashboard, UserCircle, LogIn } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { data: session } = useSession();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userRole = session?.user?.role;
    const isAdmin = userRole === "admin";
    const isMerchant = userRole === "merchant" || isAdmin;

    const DropdownContent = () => (
        <div className="py-1 w-full flex flex-col">
            <Link
                href="/profile"
                onClick={() => { setIsDropdownOpen(false); setIsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <UserCircle size={16} className="text-gray-400" />
                Your Profile
            </Link>

            {isMerchant && (
                <Link
                    href="/merchant/dashboard"
                    onClick={() => { setIsDropdownOpen(false); setIsOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <LayoutDashboard size={16} className="text-gray-400" />
                    Merchant Dashboard
                </Link>
            )}

            {isAdmin && (
                <Link
                    href="/admin"
                    onClick={() => { setIsDropdownOpen(false); setIsOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <BookOpen size={16} className="text-gray-400" />
                    Admin Panel
                </Link>
            )}

            <div className="h-px bg-gray-100 my-1 mx-2" />

            <button
                onClick={() => { signOut(); setIsDropdownOpen(false); setIsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
                <LogOut size={16} />
                Sign Out
            </button>
        </div>
    );

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="BookSphere" className="h-16 w-auto group-hover:scale-105 transition-transform" />
                    </Link>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-bold transition-all hover:text-primary tracking-wide ${pathname === "/" ? "text-primary" : "text-gray-500"
                                }`}
                        >
                            BROWSE
                        </Link>

                        {session && (
                            <Link
                                href="/my-books"
                                className={`text-sm font-bold transition-all hover:text-primary tracking-wide ${pathname === "/my-books" ? "text-primary" : "text-gray-500"
                                    }`}
                            >
                                MY BOOKS
                            </Link>
                        )}

                        {session ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 pl-3 pr-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100 transition-all hover:border-gray-200 group"
                                >
                                    <div className="mr-1 hidden sm:block">
                                        <p className="text-xs font-black text-gray-700 leading-tight truncate max-w-[100px]">
                                            {session.user.name?.split(' ')[0].toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow transition-all overflow-hidden">
                                        {session.user.image ? (
                                            <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{session.user.email}</p>
                                        </div>
                                        <DropdownContent />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-xs font-black tracking-widest hover:bg-secondary hover:translate-y-[-1px] transition-all shadow-lg shadow-primary/20 active:translate-y-0"
                            >
                                <LogIn size={14} />
                                LOGIN
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-50 animate-in fade-in slide-in-from-top duration-300">
                    <div className="px-4 py-6 space-y-4">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-3 rounded-2xl text-base font-bold ${pathname === "/" ? "bg-primary/5 text-primary" : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            Browse Books
                        </Link>

                        {session && (
                            <Link
                                href="/my-books"
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-2xl text-base font-bold ${pathname === "/my-books" ? "bg-primary/5 text-primary" : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                My Bookshelf
                            </Link>
                        )}

                        {session ? (
                            <div className="bg-gray-50 rounded-2xl p-2 space-y-1">
                                <div className="px-4 py-3 border-b border-gray-100/50 flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-xs">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{session.user.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{session.user.role}</p>
                                    </div>
                                </div>
                                <DropdownContent />
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full bg-primary text-white px-4 py-4 rounded-2xl text-center font-black tracking-widest shadow-lg shadow-primary/10"
                            >
                                LOGIN TO ACCOUNT
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
