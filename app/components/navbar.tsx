'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiSearch, FiShoppingCart, FiX } from "react-icons/fi";
import { useCart } from "./cartProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const isMenuOpen = menuPath === pathname;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (isSearchOpen || isMenuOpen)) {
        setIsSearchOpen(false);
        setMenuPath(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen, isSearchOpen]);

  return (
    <div className="relative w-full">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-1" onClick={() => setMenuPath(null)}>
          <span className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
            <Image
              src="/osso-logo.svg"
              alt="Osso Tech logo"
              width={100}
              height={100}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <div>
            <p className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">Osso Tech</p>
            <p className="hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block">TECH, CHOSEN WELL</p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-sm font-semibold transition-colors hover:text-[#6F3DD0] ${active ? "text-[#6F3DD0] after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[#6F3DD0]" : "text-slate-600"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            onClick={() => {
              setMenuPath(isMenuOpen ? null : pathname);
              setIsSearchOpen(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0] lg:hidden"
          >
            {isMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
          <button
            type="button"
            aria-label={isSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isSearchOpen}
            onClick={() => {
              setIsSearchOpen((open) => !open);
              setMenuPath(null);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0]"
          >
            {isSearchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
          </button>

          <Link
            href="/cart"
            aria-label={`View cart${totalItems > 0 ? `, ${totalItems} ${totalItems === 1 ? "item" : "items"}` : ""}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0]"
          >
            <FiShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#6F3DD0] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <nav aria-label="Mobile navigation" className="mt-3 grid gap-1 border-t border-slate-100 pt-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuPath(null)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${pathname === link.href ? "bg-[#EFEBFA] text-[#6F3DD0]" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {isSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-10 flex min-h-12 items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:rounded-full sm:p-2.5">
          <form action="/products" method="get" className="flex w-full items-center gap-3 rounded-full bg-slate-50 px-4 py-2">
            <FiSearch className="shrink-0 text-slate-500" size={18} />
            <input
              autoFocus
              type="text"
              name="search"
              placeholder="Search gadgets"
              aria-label="Search gadgets"
              required
              className="min-w-0 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setIsSearchOpen(false)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
            >
              <FiX size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}