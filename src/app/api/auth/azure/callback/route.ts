import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Next.js rewrites() do not forward Set-Cookie response headers from external
// upstream servers to the browser. This route handler intercepts the Azure AD
// OAuth callback, proxies it to the backend, and explicitly forwards every
// Set-Cookie header so cookies land on the frontend domain.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? new URL(request.url).host;
  const publicOrigin = `${proto}://${host}`;

  const params = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    params.set(key, value);
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/auth/azure/callback?${params.toString()}`, {
      redirect: "manual",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.redirect(new URL(`/auth/callback?error=${encodeURIComponent(msg)}`, `${publicOrigin}/`));
  }

  // Extract only the path from the backend's redirect — ignore whatever domain
  // it contains so the browser always lands on the correct public frontend URL.
  const location = backendRes.headers.get("location") ?? "/dashboard";
  let redirectPath: string;
  try {
    const dest = new URL(location);
    redirectPath = dest.pathname + dest.search;
  } catch {
    redirectPath = location.startsWith("/") ? location : "/dashboard";
  }

  const response = NextResponse.redirect(new URL(redirectPath, `${publicOrigin}/`));

  // Forward every Set-Cookie header from the backend response.
  const rawCookies: string[] =
    typeof (backendRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === "function"
      ? (backendRes.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : backendRes.headers.get("set-cookie")
        ? [backendRes.headers.get("set-cookie") as string]
        : [];

  for (const cookie of rawCookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}
