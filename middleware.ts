import { auth } from "@/lib/auth";

export default auth((req) => {
    console.log(req.auth);
    // if is not loggedIn and is also not at /login or /signup, then push to login
    if (!req.auth && req.nextUrl.pathname !== "/login" && req.nextUrl.pathname !== "/signup") {
        const newUrl = new URL("/login", req.nextUrl.origin);
        return Response.redirect(newUrl);
    }

    // if is loggedIn and going to /login or /signup, then push back to the origin
    if (req.auth && (req.nextUrl.pathname == "/login" || req.nextUrl.pathname == "/signup")) {
        return Response.redirect(req.nextUrl.origin);
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
