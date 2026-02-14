import { auth } from "@/lib/auth";
import { db } from "@/db";
import { books, users, merchants, orders, lendingRecords } from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import AdminBookCard from "@/components/AdminBookCard";
import {
    Users,
    BookOpen,
    DollarSign,
    ShoppingBag,
    ShieldAlert,
    Store,
    ChevronRight,
    Search,
    UserCircle,
    Activity
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
        redirect("/");
    }

    // 1. Fetch Overview Stats
    const [
        allUsers,
        allMerchants,
        allOrders,
        allLending,
        pendingBooksCount
    ] = await Promise.all([
        db.query.users.findMany({
            with: { orders: true, lendingRecords: true }
        }),
        db.query.merchants.findMany({
            with: { books: true }
        }),
        db.query.orders.findMany({
            where: eq(orders.status, "completed")
        }),
        db.query.lendingRecords.findMany(),
        db.select({ count: sql<number>`count(*)` }).from(books).where(eq(books.status, "pending"))
    ]);

    const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0) / 100;

    // 2. Fetch Pending Moderation Books
    const pendingBooks = await db.query.books.findMany({
        where: eq(books.status, "pending"),
        orderBy: [desc(books.createdAt)],
    });

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">ADMIN COMMAND CENTER</h1>
                    <p className="text-gray-500 font-medium mt-1">Live overview of BookSphere ecosystem</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider">System Operational</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`Rs. ${totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="bg-blue-600"
                    subtitle="Platform Earnings"
                />
                <StatCard
                    title="Active Users"
                    value={allUsers.length}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-purple-600"
                    subtitle="Registered Readers"
                />
                <StatCard
                    title="Merchants"
                    value={allMerchants.length}
                    icon={<Store className="w-6 h-6" />}
                    color="bg-orange-600"
                    subtitle="Strategic Partners"
                />
                <StatCard
                    title="Pending Tasks"
                    value={pendingBooksCount[0].count}
                    icon={<ShieldAlert className="w-6 h-6" />}
                    color="bg-red-600"
                    subtitle="Requires Moderation"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Moderation Queue */}
                <div className="xl:col-span-2 space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <ShieldAlert className="w-8 h-8 text-red-500" />
                                MODERATION QUEUE
                            </h2>
                            <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold border border-red-100 shadow-sm">
                                {pendingBooks.length} ITEMS WAITING
                            </span>
                        </div>

                        {pendingBooks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pendingBooks.map((book: any) => (
                                    <AdminBookCard key={book.id} book={book} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
                                    <Activity className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Clean Slate</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">No books are currently pending approval. Great job!</p>
                            </div>
                        )}
                    </section>

                    {/* Global Activity Feed / User Directory */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                            <Users className="w-8 h-8 text-primary" />
                            USER ACTIVITY & EXPENDITURE
                        </h2>
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/50">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Expenditure</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {allUsers.map((user: any) => {
                                        const spend = user.orders?.reduce((sum: number, o: any) => sum + (o.amount || 0), 0) / 100 || 0;
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{user.name}</p>
                                                            <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 uppercase tracking-tight">
                                                            {user.lendingRecords?.length || 0} Borrows
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-lg border border-purple-100 uppercase tracking-tight">
                                                            {user.orders?.length || 0} Orders
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <p className="font-black text-gray-900">Rs. {spend.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Lifetime value</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Merchant Sidebar */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                            <Store className="w-8 h-8 text-orange-500" />
                            MERCHANTS
                        </h2>
                        <div className="space-y-4">
                            {allMerchants.map((merchant: any) => (
                                <div key={merchant.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/20 hover:border-orange-200 hover:-translate-y-1 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-gray-900 leading-none">{merchant.storeName.toUpperCase()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-2">ID: {merchant.id.slice(0, 8)}...</p>
                                        </div>
                                        <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                            <Store size={20} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="text-center flex-1">
                                            <p className="text-lg font-black text-gray-900">{merchant.books?.length || 0}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Books</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100" />
                                        <div className="text-center flex-1">
                                            <p className="text-lg font-black text-gray-900">
                                                {merchant.books?.filter((b: any) => b.status === "published").length || 0}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Shortcuts */}
                    <section className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                        <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6">Admin Shortcuts</h3>
                        <div className="space-y-3">
                            <Link href="/admin/settings" className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:scale-[1.02] transition-all group">
                                <span className="text-sm font-bold text-gray-700">Platform Settings</span>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link href="/admin/audits" className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:scale-[1.02] transition-all group">
                                <span className="text-sm font-bold text-gray-700">System Logs</span>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, subtitle }: any) {
    return (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 flex items-center gap-6 group hover:-translate-y-1 transition-all">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">{title}</p>
                <div className="text-2xl font-black text-gray-900 leading-tight">{value}</div>
                <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tighter">{subtitle}</p>
            </div>
        </div>
    );
}
