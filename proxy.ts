import { NextResponse, type NextRequest } from "next/server";

const PROJECT_REF = "wqvuekbbcltafvpvkmjh";
const BASE64_PREFIX = "base64-";

// @supabase/ssr ≥0.6 stores cookies as "base64-{base64url}" (UTF-8 via custom encoder).
// Session tokens are ASCII-only so standard atob works after converting the alphabet.
function decodeBase64URL(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return atob(padded);
}

function getSession(request: NextRequest) {
  try {
    // Cookie may be stored whole or split into chunks (.0, .1, …)
    let raw = request.cookies.get(`sb-${PROJECT_REF}-auth-token`)?.value;
    if (!raw) {
      const parts: string[] = [];
      for (let i = 0; ; i++) {
        const chunk = request.cookies.get(`sb-${PROJECT_REF}-auth-token.${i}`)?.value;
        if (!chunk) break;
        parts.push(chunk);
      }
      if (parts.length) raw = parts.join("");
    }
    if (!raw) return null;

    const jsonStr = raw.startsWith(BASE64_PREFIX)
      ? decodeBase64URL(raw.slice(BASE64_PREFIX.length))
      : decodeURIComponent(raw);

    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = getSession(request);
  const payload = session?.access_token
    ? (() => {
        try {
          const b64 = session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          return JSON.parse(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)));
        } catch { return null; }
      })()
    : null;
  const role = payload?.user_metadata?.role as string | undefined;

  // Unauthenticated users → /login
  const authRequired = ["/dashboard", "/campaigns", "/creators", "/collaborations", "/brands", "/messages", "/settings"];
  if (!payload && authRequired.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (payload) {
    // Brand-only routes → creators redirected to dashboard
    const brandOnly = ["/campaigns", "/creators"];
    if (role !== "brand" && brandOnly.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Creator-only routes → brands redirected to dashboard
    const creatorOnly = ["/brands"];
    if (role !== "creator" && creatorOnly.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
