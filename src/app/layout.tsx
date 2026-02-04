import type { Metadata } from "next";
import { Inter, Poppins, Lato } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
    variable: "--font-poppins",
});
const lato = Lato({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-lato",
});

export const metadata: Metadata = {
    title: "BookSphere | Your Cozy Online Bookstore",
    description: "Browse, search, and borrow ebooks in a minimal, modern interface.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${poppins.variable} ${lato.variable} antialiased`}>
                <Providers>
                    <Navbar />
                    <main className="min-h-screen pt-20 px-4 md:px-8 max-w-7xl mx-auto">
                        {children}
                    </main>
                    <footer className="py-10 text-center text-text-secondary border-t border-gray-100 bg-white mt-20">
                        <p>© {new Date().getFullYear()} BookSphere. All rights reserved.</p>
                    </footer>
                </Providers>
            </body>
        </html>
    );
}
