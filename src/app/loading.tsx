import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain animate-pulse" />
                </div>
            </div>
            <p className="mt-4 text-sm font-bold text-primary tracking-widest uppercase animate-pulse">Loading Sphere...</p>
        </div>
    );
}
