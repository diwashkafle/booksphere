"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, User, Building, Shield, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user" as "user" | "merchant",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/auth/login?registered=true");
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-10">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="BookSphere Logo" className="h-20 w-auto mx-auto mb-4" />
                    <h1 className="text-3xl font-heading font-bold text-text-primary">Join BookSphere</h1>
                    <p className="text-text-secondary mt-2">Create your account to start reading</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">Account Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "user" })}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${formData.role === "user" ? "border-primary bg-primary/5 text-primary" : "border-gray-100 text-text-secondary grayscale"
                                    }`}
                            >
                                <User className="w-6 h-6 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Reader</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: "merchant" })}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${formData.role === "merchant" ? "border-primary bg-primary/5 text-primary" : "border-gray-100 text-text-secondary grayscale"
                                    }`}
                            >
                                <Building className="w-6 h-6 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Merchant</span>
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Register Now"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-text-secondary">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-primary font-bold hover:underline">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    );
}
