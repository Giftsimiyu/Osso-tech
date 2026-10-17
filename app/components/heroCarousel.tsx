"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { getProductImageUrl } from "./image-url";
import HeroThreeScene from "./hero-three-scene";

type HeroProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  image_url: string | null;
  product_variants: { price: number }[];
};

type HeroCarouselProps = {
  products: HeroProduct[];
};

const descriptions = [
  "Thoughtfully chosen tech to make your everyday setup work better.",
  "Reliable performance and considered design, wherever the day takes you.",
  "Find the little upgrades that make a big difference to your setup.",
];

export default function HeroCarousel({ products }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const activeProduct = products[activeSlide];
  const imageUrl = getProductImageUrl(activeProduct?.image_url ?? null);
  const prices = activeProduct?.product_variants.map((variant) => variant.price) ?? [];
  const lowestPrice = prices.length ? Math.min(...prices) : null;

  useEffect(() => {
    if (products.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % products.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [products.length]);

  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#17151D] text-white shadow-xl shadow-slate-900/10 sm:rounded-[2.25rem]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-36 -top-40 h-96 w-96 rounded-full border-[1px] border-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full border border-white/10" />

      <div className="relative grid gap-8 p-5 sm:p-8 md:p-10 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-12 lg:p-12">
        <div className="flex flex-col items-start">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-wide text-violet-100">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-400" />
            Thoughtful tech. Better everyday.
          </p>

          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.65rem]">
            A better setup starts with the right tech.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {activeProduct
              ? descriptions[activeSlide % descriptions.length]
              : "Shop dependable phones, laptops, and everyday essentials, all in one place."}
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 min-[420px]:w-auto min-[420px]:flex-row">
            <Link href="/products" className="btn btn-primary w-full min-[420px]:w-auto">
              Explore the store <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/categories" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">
              Browse categories
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-5 text-xs font-medium text-slate-300 sm:mt-10 sm:gap-x-7 sm:text-sm">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-violet-200" aria-hidden="true" /> Secure checkout</span>
            <span className="inline-flex items-center gap-2"><Truck size={16} className="text-violet-200" aria-hidden="true" /> Convenient delivery</span>
          </div>
        </div>

        <div className="relative min-h-[270px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(ellipse_at_50%_42%,#51406D_0%,#292433_42%,#201D25_100%)] sm:min-h-[380px] lg:min-h-[430px]">
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <HeroThreeScene />

          {imageUrl ? (
            <Image
              key={imageUrl}
              src={imageUrl}
              alt={activeProduct?.name ?? "Featured Osso Tech product"}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="relative z-10 object-contain p-7 transition duration-500 sm:p-10"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-36 w-36 items-center justify-center rounded-[2.5rem] border border-white/15 bg-white/5 text-violet-100 shadow-2xl shadow-violet-950/40 backdrop-blur-sm sm:h-44 sm:w-44">
                <Sparkles size={62} strokeWidth={1.1} aria-hidden="true" />
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#17151D] via-[#17151D]/90 to-transparent px-5 pb-5 pt-16 sm:px-7 sm:pb-7">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                  {activeProduct?.brand ?? "Selected for you"}
                </p>
                <h2 className="mt-1 truncate text-xl font-semibold text-white sm:text-2xl">
                  {activeProduct?.name ?? "Your next everyday essential"}
                </h2>
                {lowestPrice !== null && (
                  <p className="mt-1 text-sm font-medium text-slate-300">
                    From KSh {lowestPrice.toLocaleString()}
                  </p>
                )}
              </div>
              {activeProduct && (
                <Link
                  href={`/products/${activeProduct.slug}`}
                  aria-label={`View ${activeProduct.name}`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 transition hover:bg-violet-100"
                >
                  <ArrowRight size={19} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {products.length > 1 && (
        <div className="absolute right-7 top-7 z-30 flex gap-2 sm:right-10 sm:top-10" aria-label="Featured products">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Show ${product.name}`}
              aria-current={activeSlide === index}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${activeSlide === index ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
