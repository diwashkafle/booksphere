"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CreditCard, ShieldCheck, Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { processMockPayment } from "@/app/actions/orders";

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get transaction details from URL
    const type = searchParams.get("type") as "purchase" | "borrow" || "purchase";
    const amount = parseInt(searchParams.get("amount") || "1999");
    const weeks = parseInt(searchParams.get("weeks") || "0");

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: "4242 4242 4242 4242",
        expiry: "12/26",
        cvv: "123",
        name: "Demo User"
    });

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const result = await processMockPayment(
            params.id as string,
            amount,
            type,
            type === "borrow" ? weeks * 7 : undefined
        );

        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => {
                router.push("/profile");
            }, 3000);
        } else {
            alert(result.error);
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-3xl font-heading font-bold mb-4">Payment Successful!</h1>
                <p className="text-text-secondary mb-8">
                    Your {type} transaction has been processed. You can now access your ebook in your library.
                </p>
                <div className="animate-pulse text-sm text-primary font-medium">
                    Redirecting to your library...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <Link href={`/books/${params.id}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Book Details
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Checkout Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold mb-2">Secure Checkout</h1>
                        <p className="text-text-secondary">
                            {type === "borrow"
                                ? `Borrowing this book for ${weeks} week${weeks > 1 ? 's' : ''}.`
                                : "Securing lifetime access to this ebook."}
                        </p>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-semibold text-text-primary ml-1">Cardholder Name</span>
                                <input
                                    type="text"
                                    value={formData.name}
                                    readOnly
                                    className="w-full mt-1 bg-gray-50 border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-semibold text-text-primary ml-1">Card Number</span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.cardNumber}
                                        readOnly
                                        className="w-full mt-1 bg-gray-50 border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none pr-12"
                                    />
                                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-sm font-semibold text-text-primary ml-1">Expiry Date</span>
                                    <input
                                        type="text"
                                        value={formData.expiry}
                                        readOnly
                                        className="w-full mt-1 bg-gray-50 border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-semibold text-text-primary ml-1">CVV</span>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.cvv}
                                            readOnly
                                            className="w-full mt-1 bg-gray-50 border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing Securely...
                                </>
                            ) : (
                                `PAY $${(amount / 100).toFixed(2)} NOW`
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-6 pt-4 text-text-secondary opacity-60">
                            <ShieldCheck size={20} />
                            <span className="text-xs font-medium uppercase tracking-widest">SSL Encrypted Checkout</span>
                        </div>
                    </form>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:pl-12">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-text-secondary text-sm">
                                <span>
                                    {type === "borrow"
                                        ? `Borrow Period (${weeks} week${weeks > 1 ? 's' : ''})`
                                        : "Digital Ebook (Lifetime Access)"}
                                </span>
                                <span className="text-text-primary font-medium">${(amount / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary text-sm">
                                <span>Processing Fee</span>
                                <span className="text-text-primary font-medium">$0.00</span>
                            </div>
                            <div className="h-px bg-gray-200 mt-4" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-lg">Total</span>
                                <span className="text-2xl font-heading font-bold text-primary">${(amount / 100).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-blue-50 flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold mb-1">Instant Delivery</h4>
                                <p className="text-[11px] text-text-secondary leading-tight">
                                    The download link will be available in your profile immediately after payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
