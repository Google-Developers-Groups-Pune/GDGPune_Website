import type { Metadata, Viewport } from "next";
import { Google_Sans_Code, Google_Sans_Flex } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { site } from "@/data/site";
import "./globals.css";

const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
  axes: ["opsz"],
  // Next has no metric overrides for these families; globals.css supplies the fallback stack.
  adjustFontFallback: false,
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  subsets: ["latin"],
  adjustFontFallback: false,
});

const title = "GDG Pune — A community powered by Google for Developers Program!";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: "%s | GDG Pune",
  },
  description: site.description,
  keywords: [
    "GDG Pune",
    "Google Developer Groups",
    "Google Cloud",
    "Cloud Community Day Pune",
    "Build with AI",
    "Pune developer community",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    locale: "en_IN",
    title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    site: "@gdgcloudpune",
    title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1e1e",
  colorScheme: "dark",
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${googleSansFlex.variable} ${googleSansCode.variable}`}>
      <body className="relative isolate min-h-full">
        <div className="relative z-10">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          {children}
        </div>
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
