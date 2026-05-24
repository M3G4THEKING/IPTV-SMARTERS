import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fixDuplicateLocalePath } from '@/lib/i18n/locale-path';

const locales = ['en', 'es', 'fr', 'ca', 'uk'];
const defaultLocale = 'en';

function detectCountry(request: NextRequest): string | undefined {
  const raw =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code');
  return raw?.trim().toUpperCase() || undefined;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // CRITICAL: Root domain redirect - must be 301 permanent redirect for SEO
  // Redirect root domain to /en/ to prevent duplicate content
  // Add noindex header so Google doesn't try to index the root domain
  if (pathname === '/') {
    const country = detectCountry(request);
    const targetLocale =
      country === 'CA' ? 'ca' : country === 'GB' || country === 'UK' ? 'uk' : defaultLocale;
    url.pathname = `/${targetLocale}/`;
    const response = NextResponse.redirect(url, 301);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Redirect root language pages without trailing slash to with trailing slash
  // e.g., /en -> /en/, /ca -> /ca/, /es -> /es/, /fr -> /fr/
  if (locales.includes(pathname.slice(1)) && pathname.length === 3) {
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url, 301);
  }

  // Fix malformed URLs from old locale switcher (e.g. /ca/uk/ → /uk/)
  const fixedDuplicateLocale = fixDuplicateLocalePath(pathname);
  if (fixedDuplicateLocale) {
    url.pathname = fixedDuplicateLocale;
    return NextResponse.redirect(url, 301);
  }

  // Parse path segments for locale and slug detection
  const pathSegments = pathname.split('/').filter(Boolean);
  const hasTrailingSlash = pathname.endsWith('/');
  
  // Redirect English slugs to localized slugs for non-English locales
  // AND handle trailing slash in one redirect to avoid double redirects
  // This ensures canonical URLs are used (localized slugs are canonical)
  // CRITICAL: Add noindex header so Google doesn't try to index these redirect pages
  if (pathSegments.length >= 2) {
    const locale = pathSegments[0];
    const slug = pathSegments[1];

    // Spanish redirects - redirect English slugs to Spanish slugs
    if (locale === 'es') {
      const redirectMap: Record<string, string> = {
        'iptv-installation-guide': 'guia-instalacion-iptv',
        'iptv-installation-ios': 'instalacion-ios-iptv',
        'iptv-installation-windows': 'instalacion-windows-iptv',
        'iptv-installation-smart-tv': 'instalacion-smart-tv-iptv',
        'iptv-installation-firestick': 'instalacion-firestick-iptv',
        'iptv-reseller-program': 'programa-revendedor-iptv',
        'refund-policy': 'politica-de-reembolso',
        'privacy-policy': 'politica-de-privacidad',
        'terms-of-service': 'terminos-de-servicio',
      };

      if (redirectMap[slug]) {
        // Redirect directly to localized version with trailing slash
        url.pathname = `/es/${redirectMap[slug]}/`;
        const response = NextResponse.redirect(url, 301);
        // Add noindex header so Google doesn't try to index the English slug URL
        // This prevents it from appearing in Search Console as "not indexed"
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return response;
      }
    }

    // French redirects - redirect English slugs to French slugs
    if (locale === 'fr') {
      const redirectMap: Record<string, string> = {
        'iptv-installation-guide': 'guide-installation-iptv',
        'iptv-installation-ios': 'installation-ios-iptv',
        'iptv-installation-windows': 'installation-windows-iptv',
        'iptv-installation-smart-tv': 'installation-smart-tv-iptv',
        'iptv-installation-firestick': 'installation-firestick-iptv',
        'iptv-reseller-program': 'programme-revendeur-iptv',
        'refund-policy': 'politique-de-remboursement',
        'privacy-policy': 'politique-de-confidentialite',
        'terms-of-service': 'conditions-utilisation',
      };

      if (redirectMap[slug]) {
        // Redirect directly to localized version with trailing slash
        url.pathname = `/fr/${redirectMap[slug]}/`;
        const response = NextResponse.redirect(url, 301);
        // Add noindex header so Google doesn't try to index the English slug URL
        // This prevents it from appearing in Search Console as "not indexed"
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return response;
      }
    }
  }

  // Handle trailing slash consistency for other routes
  // But exclude API routes, admin routes, and static files
  // Only do this if we haven't already redirected above
  if (
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/_next') &&
    !pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/i) &&
    pathname.length > 1 &&
    !hasTrailingSlash &&
    pathSegments.length > 0 &&
    locales.includes(pathSegments[0])
  ) {
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|sitemap.xml|robots.txt).*)',
  ],
};


