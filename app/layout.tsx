import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./components/cartProvider";
import Navbar from "./components/navbar";
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Osso Tech",
  description: "A modern online store for phones, laptops, chargers, and accessories.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <CartProvider>
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 sm:py-4">
              <Navbar />
            </div>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
