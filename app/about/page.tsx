import Link from "next/link";
import { ArrowRight, Check, Heart, ShieldCheck, Sparkles } from "lucide-react";
import SiteShell from "../components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-[2.25rem] bg-[#17151D] px-7 py-12 text-white shadow-xl shadow-[#17151D]/10 sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border-[34px] border-[#6F3DD0]/30" />
        <div className="absolute -bottom-40 right-32 h-64 w-64 rounded-full border-[24px] border-[#B7E4D0]/20" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#D8C9FA]">About Osso Tech</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Technology should feel simpler.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            We are building a calmer way to shop for the devices and accessories that keep your everyday life moving.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6F3DD0]">Our approach</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Less noise. Better choices.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Gadget shopping can quickly become a maze of specifications, inflated promises, and endless tabs. Osso Tech keeps the experience focused on useful products, clear details, and support when you need it.
          </p>
          <Link href="/categories" className="btn btn-primary mt-8">Explore the collection <ArrowRight size={18} /></Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { icon: Sparkles, title: "Curated", text: "A focused range across the categories people use every day." },
            { icon: ShieldCheck, title: "Clear", text: "Straightforward prices, specifications, and stock information." },
            { icon: Heart, title: "Human", text: "Practical help when you are choosing, ordering, or setting up." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <Icon className="text-[#6F3DD0]" size={24} strokeWidth={1.8} />
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 border-y border-slate-200 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            "Browse by the way you use technology.",
            "Compare the details that actually matter.",
            "Order with a clear next step at every stage.",
          ].map((step, index) => (
            <div key={step} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFEBFA] text-sm font-bold text-[#6F3DD0]">0{index + 1}</span>
              <div>
                <p className="font-semibold leading-6 text-slate-900">{step}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600"><Check size={16} /> Built around your needs</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
