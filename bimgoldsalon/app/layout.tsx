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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BIM - GOLD HAIR & BEAUTY SALON",
  description: "Crowning You With Confidence And Beauty",
  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, jakarta.variable)}
    >
      <body className="min-h-full flex flex-col">
        {" "}
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
