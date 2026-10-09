"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiChevronLeft, FiShoppingCart } from "react-icons/fi";
import { useCart } from "./cartProvider";
import { getProductImageUrl } from "./image-url";

type Variant = {
  id: string;
  sku: string;
  variant_name: string;
  price: number;
  stock_quantity: number;
  condition: string | null;
  warranty: string | null;
  color: string | null;
  exact_specifications: string | null;
  image_url: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  image_url: string | null;
  featured: boolean;
  product_variants: Variant[];
};

export default function ProductDetail({ product }: { product: Product }) {
  const variants = product.product_variants ?? [];
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants[0] ?? null,
  );

  if (!selectedVariant) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">
          Product details
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{product.name}</h1>
        <p className="mt-3 text-slate-600">This product currently has no available variants.</p>
      </section>
    );
  }

  const image = getProductImageUrl(selectedVariant.image_url || product.image_url);
  const inStock = selectedVariant.stock_quantity > 0;

  return (
    <article className="space-y-10">
      <Link
        href="/products"
        className="btn btn-tertiary text-sm text-slate-600 hover:text-[#6F3DD0]"
      >
        <FiChevronLeft size={18} aria-hidden="true" />
        Back to shop
      </Link>

      <section className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-[#F8F9FF] via-[#E4EBFB] to-[#EFEBFA] shadow-sm sm:rounded-[2rem]">
          <div className="absolute inset-5 rounded-[1.25rem] border border-white/70 bg-white/45 sm:inset-8 sm:rounded-[1.75rem]" />
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
              className="relative object-contain p-7 sm:p-14"
            />
          ) : (
            <span className="relative text-sm font-medium text-slate-400">Product image unavailable</span>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            {product.brand && (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">{product.brand}</p>
            )}
            {product.featured && (
              <span className="rounded-full bg-[#EFEBFA] px-3 py-1 text-xs font-semibold text-[#6F3DD0]">Featured</span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{product.name}</h1>
          {product.model && <p className="mt-2 text-slate-500">{product.model}</p>}
          {product.description && <p className="mt-6 leading-8 text-slate-600">{product.description}</p>}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-3xl font-semibold text-slate-900">KSh {selectedVariant.price.toLocaleString()}</p>
            <p className={`mt-3 flex items-center gap-2 text-sm font-medium ${inStock ? "text-emerald-600" : "text-rose-500"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-400"}`} />
              {inStock ? `${selectedVariant.stock_quantity} available` : "Out of stock"}
            </p>
          </div>

          {variants.length > 1 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Choose configuration</h2>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => {
                  const selected = selectedVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${selected ? "border-[#6F3DD0] bg-[#6F3DD0] text-white shadow-md shadow-[#6F3DD0]/20" : "border-slate-300 bg-white text-slate-700 hover:border-[#6F3DD0] hover:text-[#6F3DD0]"}`}
                    >
                      {variant.variant_name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3 border-y border-slate-100 py-6 text-sm">
            {selectedVariant.color && <div className="flex justify-between gap-4"><span className="text-slate-500">Color</span><span className="font-medium text-slate-800">{selectedVariant.color}</span></div>}
            {selectedVariant.condition && <div className="flex justify-between gap-4"><span className="text-slate-500">Condition</span><span className="font-medium text-slate-800">{selectedVariant.condition}</span></div>}
            {selectedVariant.warranty && <div className="flex justify-between gap-4"><span className="text-slate-500">Warranty</span><span className="font-medium text-slate-800">{selectedVariant.warranty}</span></div>}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!selectedVariant) return;

              addItem({
                variantId: selectedVariant.id,
                productId: product.id,
                name: product.name,
                variantName: selectedVariant.variant_name,
                price: selectedVariant.price,
                imageUrl: selectedVariant.image_url || product.image_url,
                sku: selectedVariant.sku,
              });
            }}
            disabled={!inStock}
            className="btn btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            <FiShoppingCart size={20} aria-hidden="true" />
            {inStock ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </section>

      {selectedVariant.exact_specifications && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">Product details</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Specifications</h2>
          <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">{selectedVariant.exact_specifications}</p>
        </section>
      )}
    </article>
  );
}
