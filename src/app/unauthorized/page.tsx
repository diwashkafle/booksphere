import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center px-4">
            <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-12 h-12" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-heading font-bold">Access Denied</h1>
                <p className="text-text-secondary max-w-md mx-auto text-lg">
                    You don't have the required permissions to view this page. This area is reserved for users with specific roles.
                </p>
            </div>
            <div className="flex gap-4">
                <Link href="/" className="btn-primary">
                    Back to Bookstore
                </Link>
                <Link href="/auth/login" className="btn-secondary">
                    Log in as Admin
                </Link>
            </div>
        </div>
    );
}
