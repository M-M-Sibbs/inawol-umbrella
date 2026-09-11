import { NextResponse } from "next/server";

// The admin URL path. Defaults to /dashboard. Override with ADMIN_PATH env var
// to move the admin to any non-guessable URL like /dashboard-x9k2.
const ADMIN_PATH = process.env.ADMIN_PATH || "/dashboard";
const SESSION_COOKIE = "umb_session";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const customPath = ADMIN_PATH !== "/dashboard";

  // API routes handle their own auth (and Paynow's server-to-server callback
  // has no session cookie), so never apply the admin redirect/404 logic here.
  if (pathname.startsWith("/api/")) {
    return withSecurityHeaders(NextResponse.next());
  }

  // Block the legacy /admin path entirely so it stops being a target.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  // If a custom ADMIN_PATH is configured, hide the physical /dashboard route
  // so the dashboard is only reachable via the secret path.
  if (customPath && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Protect the dashboard (everything under ADMIN_PATH except its login page).
  const isAdminArea =
    pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
  const isLoginPage = pathname === `${ADMIN_PATH}/login`;

  if (isAdminArea && !isLoginPage) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = `${ADMIN_PATH}/login`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // Map the custom admin path onto the physical /dashboard route files.
  if (customPath && isAdminArea) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(ADMIN_PATH, "/dashboard");
    const response = NextResponse.rewrite(url);
    return withSecurityHeaders(response);
  }

  // Continue with security headers attached.
  return withSecurityHeaders(NextResponse.next());
}

function withSecurityHeaders(response) {
  const headers = response.headers;

  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Content-Security-Policy.
  // Next.js's dev server needs 'unsafe-eval' and a websocket connection for
  // hot-reloading, which a strict production CSP would block. So we relax the
  // policy in development and keep it tight in production.
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";
  // Cloudflare Stream needs: the player iframe (frame-src) and direct
  // browser->Cloudflare uploads from the dashboard (connect-src).
  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: https://upload.videodelivery.net https://*.cloudflarestream.com https://api.cloudflare.com"
    : "connect-src 'self' https://upload.videodelivery.net https://*.cloudflarestream.com https://api.cloudflare.com";

  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      connectSrc,
      // Lesson video player (Cloudflare Stream).
      "frame-src 'self' https://iframe.videodelivery.net https://*.cloudflarestream.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      // Paynow redirects the browser to its hosted checkout page.
      "form-action 'self' https://www.paynow.co.zw",
    ].join("; ")
  );

  // HSTS only makes sense over HTTPS (production), not on localhost.
  if (!isDev) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

// Run on all routes except Next internals and static files.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
