"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-text-primary">Welcome Back</h1>
                    <p className="text-text-secondary mt-2">Log in to your BookSphere account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                    <button type="submit" className="w-full btn-primary py-3 font-semibold shadow-lg shadow-primary/20">
                        Sign In
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-text-secondary">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-primary font-bold hover:underline">
                        Register for free
                    </Link>
                </div>
            </div>
        </div>
    );
}
