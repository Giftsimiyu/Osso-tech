import { createClient } from "../../backend/lib/supabase/server";
import ProductsBrowser from "./products-browser";
import SiteShell from "../components/site-shell";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const supabase = await createClient();
  const { category: categorySlug, search } = await searchParams;

  const [{ data: products, error }, { data: categories }] = await Promise.all([
    supabase.from("products").select(`
      id,
      name,
      slug,
      category_id,
      brand,
      image_url,
      featured,
      product_variants (
        id,
        sku,
        variant_name,
        price,
        stock_quantity,
        color
      )
    `).order("name"),
    supabase.from("categories").select("id, name, slug").order("name"),
  ]);

  if (error) {
    console.error(error);

    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-rose-100 bg-[#FFF8F8] p-8 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">
            Store update
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            We couldn&apos;t load the products
          </h1>
          <p className="mt-3 max-w-xl text-slate-600">
            Please try again in a moment. Our product collection is still here,
            just temporarily out of reach.
          </p>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-[2.25rem] bg-[#17151D] px-7 py-12 text-white shadow-xl shadow-[#17151D]/10 sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[32px] border-[#6F3DD0]/30" />
        <div className="absolute -bottom-32 right-24 h-56 w-56 rounded-full border-[22px] border-[#B7E4D0]/20" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#D8C9FA]">Osso Tech / Store</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Good tech, chosen well.</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Explore dependable phones, laptops, accessories, and everyday upgrades with honest pricing and useful detail.
          </p>
        </div>
      </section>

      {products && products.length > 0 ? (
        <ProductsBrowser
          products={products}
          categories={categories ?? []}
          initialCategory={(categories ?? []).find((category) => category.slug === categorySlug)?.id}
          initialQuery={search ?? ""}
        />
      ) : (
        <div className="mt-12 rounded-[1.75rem] border border-dashed border-slate-300 bg-[#F8F9FF] px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">No products yet</h2>
          <p className="mt-2 text-slate-600">New gadgets will appear here as soon as they are added.</p>
        </div>
      )}
    </SiteShell>
  );
}
