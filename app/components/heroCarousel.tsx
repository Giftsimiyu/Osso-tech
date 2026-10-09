"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HeroProduct = {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
};

type HeroCarouselProps = {
  products: HeroProduct[];
};

export default function HeroCarousel({ products }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = products.map((product, index) => ({
    ...product,
    title: [
      "Meet the newest release",
      "Built for hybrid work",
      "Charge faster, travel lighter",
    ][index] ?? "Upgrade your everyday setup",
    description: [
      "A fresh addition with thoughtful design and performance for everyday use.",
      "Reliable technology and refined performance for workdays on the move.",
      "Practical tech selected to keep your setup powered and ready.",
    ][index] ?? "Carefully selected tech for a smoother everyday experience.",
    accent: [
      "from-[#7E9DD3] via-[#6F3DD0] to-[#1E1E1E]",
      "from-[#E4EBFB] via-[#EFE7FF] to-[#D9F4E7]",
      "from-[#FDEFEC] via-[#F8E7EB] to-[#E4EBFB]",
    ][index] ?? "from-[#E4EBFB] via-[#6F3DD0] to-[#1E1E1E]",
  }));
  const activeSlideData = heroSlides[activeSlide] ?? heroSlides[0];

  useEffect(() => {
    if (heroSlides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E4EBFB] px-4 py-2 text-sm font-semibold text-slate-800">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6F3DD0]" />
            Mobile-ready gadget store
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Discover the best tech for work, play, and everyday life.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              {activeSlideData?.description ?? "Carefully selected gadgets, honest pricing, and the essentials for a smoother setup."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/products" className="btn btn-primary">Shop now</Link>
            <Link href="/about" className="btn btn-secondary">Learn more</Link>
          </div>

          {heroSlides.length > 0 && (
            <div className="flex items-center gap-2" aria-label="Featured products">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.name}`}
                  aria-current={activeSlide === index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition ${activeSlide === index ? "w-8 bg-[#6F3DD0]" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className={`rounded-[2rem] bg-gradient-to-br ${activeSlideData?.accent ?? "from-[#E4EBFB] via-[#6F3DD0] to-[#1E1E1E]"} p-6 text-slate-900 shadow-xl`}>
          <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">Featured release</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{activeSlideData?.name ?? "New gadgets are on the way"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{activeSlideData?.title ?? "Discover something new for your setup."}</p>
            <div className="mt-6 rounded-[1.2rem] bg-slate-950/90 px-4 py-3 text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Limited offer</p>
              <p className="mt-2 text-2xl font-semibold">Up to 30% off</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
