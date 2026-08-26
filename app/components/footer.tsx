import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#F8F9FF] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:items-start">
        <div className="space-y-4 border-b border-slate-200 pb-6 lg:border-b-0 lg:border-r lg:pr-8 lg:pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7E9DD3] to-[#6F3DD0] text-sm font-semibold text-white">
              GS
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Gadget Store</p>
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
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">Follow us</p>
          <div className="mt-4 flex items-center gap-3">
            <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0]">
              <FaFacebookF size={16} />
            </a>
            <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0]">
              <FaTwitter size={16} />
            </a>
            <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#7E9DD3] hover:text-[#6F3DD0]">
              <FaInstagram size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
