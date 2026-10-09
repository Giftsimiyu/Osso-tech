import Link from "next/link";
import {
  Camera,
  ChevronRight,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Mouse,
  Smartphone,
  Tablet,
  Watch,
  Zap,
} from "lucide-react";
import { categoryThemes } from "../categories";
import { createClient } from "../../backend/lib/supabase/server";
import SiteShell from "../components/site-shell";

const icons = { smartphone: Smartphone, laptop: Laptop, tablet: Tablet, zap: Zap, headphones: Headphones, mouse: Mouse, cpu: Cpu, gamepad: Gamepad2, camera: Camera, monitor: Monitor, watch: Watch };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories, error }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, image_url").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  if (error) {
    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-rose-100 bg-[#FFF8F8] p-8 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Store update</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">We couldn&apos;t load the categories</h1>
          <p className="mt-3 text-slate-600">Please try again in a moment. Our collection is temporarily out of reach.</p>
        </section>
      </SiteShell>
    );
  }

  const counts = new Map<string, number>();
  products?.forEach((product) => counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1));
  const categoryRows = categories ?? [];

  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-[2.25rem] bg-[#17151D] px-7 py-12 text-white shadow-xl shadow-[#17151D]/10 sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[32px] border-[#6F3DD0]/30" />
        <div className="absolute -bottom-32 right-24 h-56 w-56 rounded-full border-[22px] border-[#B7E4D0]/20" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#D8C9FA]">Osso Tech / Categories</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Shop by the way you use tech.</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Start with a category, then find the right piece for your setup.</p>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6F3DD0]">Browse the collection</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">What are you looking for?</h2>
          </div>
          <Link href="/products" className="hidden text-sm font-semibold text-[#6F3DD0] hover:text-[#4b2d96] sm:inline-flex">View all products <ChevronRight size={18} /></Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryRows.map((category) => {
            const theme = categoryThemes.find((item) => item.slug === category.slug);
            const Icon = icons[theme?.icon ?? "cpu"];
            const count = counts.get(category.id) ?? 0;

            return (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C9B9ED] hover:shadow-xl hover:shadow-[#6F3DD0]/10">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${theme?.accent ?? "bg-[#E8F0FC]"} text-slate-900`}><Icon size={26} strokeWidth={1.8} /></div>
                <div className="mt-8 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
                    <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-600">{theme?.description ?? "Explore this part of the collection."}</p>
                  </div>
                  <ChevronRight className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#6F3DD0]" size={20} />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{count} {count === 1 ? "product" : "products"}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}