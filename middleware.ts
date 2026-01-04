import { auth } from "@/auth";

export const runtime = "nodejs";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", req.url));
    }
    return;
  }

  if (!isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/", "/api/generate"],
};
