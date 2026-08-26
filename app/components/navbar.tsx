'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSearch, FiShoppingCart } from "react-icons/fi";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSearchOpen]);

  return (
    <div className="relative w-full rounded-full border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7E9DD3] to-[#6F3DD0] text-sm font-semibold text-white">
            GS
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Gadget Store</p>
            <p className="text-xs text-slate-500">Premium tech</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex gap-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`btn btn-tertiary ${active ? "text-[#6F3DD0]" : "text-slate-700"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open search"
            onClick={() => setIsSearchOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0]"
          >
            <FiSearch size={18} />
          </button>

          <Link
            href="/cart"
            aria-label="View cart"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0]"
          >
            <FiShoppingCart size={18} />
          </Link>
        </div>
      </div>

      {isSearchOpen && (
        <div className="absolute right-3 top-full mt-3 w-[min(92vw,24rem)] overflow-hidden rounded-2xl bg-gradient-to-r from-[#7E9DD3] via-[#6F3DD0] to-[#1E1E1E] p-[1px] shadow-xl">
          <div className="flex items-center gap-3 rounded-[15px] bg-white/95 px-4 py-3 backdrop-blur">
            <FiSearch className="text-slate-500" size={18} />
            <input
              autoFocus
              type="text"
              placeholder="Search gadgets"
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}