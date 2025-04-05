import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Example: Check if user is authenticated for protected routes
  // You would replace this logic with your actual authentication check

  // Check for accessibility settings in cookies and add appropriate headers
  const accessibilityHeaders = new Headers(request.headers);

  if (request.cookies.has("useDyslexicFont")) {
    accessibilityHeaders.set(
      "X-Use-Dyslexic-Font",
      request.cookies.get("useDyslexicFont")?.value || "false"
    );
  }

  if (request.cookies.has("highContrast")) {
    accessibilityHeaders.set(
      "X-High-Contrast",
      request.cookies.get("highContrast")?.value || "false"
    );
  }

  // Continue the request with added headers
  return NextResponse.next({
    request: {
      headers: accessibilityHeaders,
    },
  });
}

// Configure the paths that this middleware should run on
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
