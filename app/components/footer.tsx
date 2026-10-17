import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },

];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#F8F9FF] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:items-start">
        <div className="space-y-4 border-b border-slate-200 pb-6 lg:border-b-0 lg:border-r lg:pr-8 lg:pb-0">
          <div className="flex items-center gap-3">
            <Image
              src="/osso-logo.svg"
              alt="Osso Tech logo"
              width={80}
              height={80}
              className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
            />
            <div>
              <p className="text-lg font-semibold text-slate-900">Osso Tech</p>
              <p className="text-sm text-slate-500">Premium gear, delivered simply.</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            Your destination for phones, laptops, chargers, and accessories curated for everyday modern life.
          </p>
        </div>

        <div className="border-b border-slate-200 pb-6 lg:border-b-0 lg:border-r lg:pr-8 lg:pb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">Quick links</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[#6F3DD0]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">Need a hand?</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
            We&apos;re here to help you find the right gear for your setup.
          </p>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-[#6F3DD0]">
            Talk to our team <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
