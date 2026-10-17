import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./components/cartProvider";
import Navbar from "./components/navbar";
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Osso Tech | Everyday tech, chosen well",
  description: "Shop thoughtfully selected phones, laptops, and everyday tech essentials at Osso Tech.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <CartProvider>
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
              <Navbar />
            </div>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
