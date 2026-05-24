import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";
import { getSiteBaseUrl } from "@/lib/seo/og-image";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  weight: ["400", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  weight: ["400", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getSiteBaseUrl();

  const title =
    "Best IPTV Subscription Service | IPTV Smarters Pro | 20,000+ Channels | Free Test";
  const description =
    "Get the #1 IPTV subscription service with IPTV Smarters Pro. Access 20,000+ live TV channels, movies, and series in 4K quality. 99.9% uptime guarantee. Free test available. Works on Windows, Android, iOS, Mac, Smart TV, Firestick. Instant activation.";

  return {
    ...buildSocialMetadata({
      title,
      description,
      locale: "en",
      canonicalUrl: `${baseUrl}/en/`,
      type: "website",
      useGeneratedOgImage: true,
    }),
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={getSiteBaseUrl()} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="google-site-verification" content="UsDivhmxwn1peRYhvqO8TmyNGB180fGmIwM8BST2kh4" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var path = window.location.pathname;
                  var localeMatch = path.match(/^\\/(en|es|fr|ca|uk)/);
                  if (localeMatch) {
                    document.documentElement.lang = localeMatch[1];
                  }
                } catch (e) {
                  // Suppress errors
                }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && window.addEventListener) {
                    window.addEventListener('error', function(e) {
                      try {
                        if (e && e.message && typeof e.message === 'string' && e.message.indexOf('ipapi.co') !== -1) {
                          e.preventDefault();
                        }
                      } catch (err) {
                        // Suppress
                      }
                    }, true);
                  }
                } catch (err) {
                  // Suppress
                }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && window.addEventListener) {
                    window.addEventListener('unhandledrejection', function(e) {
                      try {
                        if (e && e.reason) {
                          var reasonStr = '';
                          if (e.reason.message && typeof e.reason.message === 'string') {
                            reasonStr = e.reason.message;
                          } else {
                            try {
                              reasonStr = String(e.reason);
                            } catch (strErr) {
                              // Suppress
                            }
                          }
                          if (reasonStr.indexOf('ipapi.co') !== -1) {
                            e.preventDefault();
                          }
                        }
                      } catch (err) {
                        // Suppress
                      }
                    });
                  }
                } catch (err) {
                  // Suppress
                }
              })();
            `,
          }}
        />
        <link rel="preload" as="image" href="/images/hero.png" fetchPriority="high" media="(min-width: 768px)" />
      </head>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <div id="root">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
