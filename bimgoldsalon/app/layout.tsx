import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BIM - GOLD HAIR & BEAUTY AND SALON",
  description: "Crowning You With Confidence And Beauty",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, jakarta.variable)}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
