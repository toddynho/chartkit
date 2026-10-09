import { NextRequest, NextResponse } from 'next/server';

// Expose the request pathname to the /components and /utilities section
// layouts. Their child pages live in static folders (e.g. components/sparkline),
// which Next.js routes ahead of the [slug] layouts, so the section layouts need
// the pathname to resolve each page's own title, description and canonical.
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/components/:path*', '/utilities/:path*'],
};
