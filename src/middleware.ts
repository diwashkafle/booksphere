import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isMerchantRoute = nextUrl.pathname.startsWith("/merchant");
    const isAuthRoute = nextUrl.pathname.startsWith("/auth");

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        return NextResponse.next();
    }

    if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    if (isMerchantRoute && role !== "merchant" && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    if (!isLoggedIn && (isAdminRoute || isMerchantRoute)) {
        return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
