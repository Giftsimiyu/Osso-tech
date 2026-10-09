import Link from "next/link";
import { Clock3, Mail, MessageCircle, ShieldQuestion } from "lucide-react";
import ContactForm from "./contact-form";
import SiteShell from "../components/site-shell";

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-[2.25rem] bg-[#17151D] px-7 py-12 text-white shadow-xl shadow-[#17151D]/10 sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[32px] border-[#6F3DD0]/30" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#D8C9FA]">Contact Osso Tech</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Let&apos;s find the right next step.</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Questions about a product, order, or setup? Tell us what is on your mind.</p>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div className="space-y-4">
          {[
            { icon: MessageCircle, title: "Product advice", text: "Not sure which option fits your setup? Start here." },
            { icon: Mail, title: "Order support", text: "Include your order details and we can find the quickest answer." },
            { icon: Clock3, title: "Response time", text: "We aim to reply within one business day." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="text-[#6F3DD0]" size={22} strokeWidth={1.8} />
              <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
          <Link href="/products" className="flex items-center gap-3 rounded-[1.5rem] border border-[#D8C9FA] bg-[#EFEBFA] p-5 text-sm font-semibold text-[#4b2d96] transition hover:bg-[#E4DBFA]"><ShieldQuestion size={22} /> Browse the products first</Link>
        </div>
        <ContactForm />
      </section>
    </SiteShell>
  );
}
