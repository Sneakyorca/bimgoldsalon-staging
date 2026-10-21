import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import NavProgress from "@/components/site/NavProgress";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { CartProvider } from "@/context/CartContext";
import { BookingProvider } from "@/context/BookingContext";
import ScrollState from "@/components/site/ScrollState";
import { DEFAULT_DESCRIPTION, SITE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "BIM-GOLD Hair & Beauty Salon | Braids & Hair Salon in Huddersfield",
    template: "%s | BIM-GOLD",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "BIM-GOLD Hair & Beauty Salon",
    locale: "en_GB",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      {
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon/favicon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon/favicon-dark-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  twitter: { card: "summary_large_image" },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, jakarta.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-white"
        >
          Skip to main content
        </a>
        <NavProgress />
        <ScrollState />
        <CartProvider>
          <BookingProvider>
            <Navbar />
            {children}
            <Footer />
          </BookingProvider>
        </CartProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
