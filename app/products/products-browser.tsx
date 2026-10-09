"use client";

import { useState } from "react";
import { FiCheck, FiChevronDown, FiSearch, FiSliders } from "react-icons/fi";
import ProductCard from "../components/productCard";

type ProductVariant = {
  id: string;
  sku: string;
  variant_name: string;
  price: number;
  stock_quantity: number;
  color: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  brand: string | null;
  image_url: string | null;
  featured: boolean;
  product_variants: ProductVariant[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductsBrowserProps = {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
};

export default function ProductsBrowser({ products, categories, initialCategory = "", initialQuery = "" }: ProductsBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const [brand, setBrand] = useState("All brands");
  const [category, setCategory] = useState(initialCategory);
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(12);

  const brands = Array.from(
    new Set(products.map((product) => product.brand).filter(Boolean)),
  ).sort();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = products
    .filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.name} ${product.brand ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesBrand = brand === "All brands" || product.brand === brand;
      const matchesCategory = !category || product.category_id === category;
      const matchesStock =
        !stockOnly ||
        product.product_variants.some((variant) => variant.stock_quantity > 0);

      return matchesQuery && matchesBrand && matchesCategory && matchesStock;
    })
    .sort((first, second) => {
      if (sort === "name") return first.name.localeCompare(second.name);
      if (sort === "price-low") {
        const firstPrice = Math.min(...first.product_variants.map((variant) => variant.price));
        const secondPrice = Math.min(...second.product_variants.map((variant) => variant.price));
        return firstPrice - secondPrice;
      }
      if (sort === "price-high") {
        const firstPrice = Math.min(...first.product_variants.map((variant) => variant.price));
        const secondPrice = Math.min(...second.product_variants.map((variant) => variant.price));
        return secondPrice - firstPrice;
      }
      return Number(second.featured) - Number(first.featured);
    });
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  return (
    <section aria-label="Product catalog" className="mt-12">
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#6F3DD0]" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6F3DD0]">The collection</p>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Find your next essential.</h2>
          <p className="mt-2 text-slate-500">{filteredProducts.length} of {products.length} products shown</p>
        </div>

        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Search products</span>
          <FiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(12);
            }}
            placeholder="Search phones, laptops..."
            className="h-12 w-full rounded-full border border-slate-300 bg-white pl-11 pr-5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6F3DD0] focus:ring-4 focus:ring-[#6F3DD0]/10"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-[#F8F9FF] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <FiSliders aria-hidden="true" className="text-[#6F3DD0]" />
          Refine
        </div>

        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 sm:min-w-40 sm:flex-none">
          <span className="sr-only">Filter by brand</span>
          <select value={brand} onChange={(event) => { setBrand(event.target.value); setVisibleCount(12); }} className="w-full bg-transparent outline-none">
            <option>All brands</option>
            {brands.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 sm:min-w-40 sm:flex-none">
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(event) => { setCategory(event.target.value); setVisibleCount(12); }} className="w-full bg-transparent outline-none">
            <option value="">All categories</option>
            {categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={stockOnly} onChange={(event) => { setStockOnly(event.target.checked); setVisibleCount(12); }} className="sr-only" />
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${stockOnly ? "border-[#6F3DD0] bg-[#6F3DD0] text-white" : "border-slate-300 bg-white"}`}>
            {stockOnly && <FiCheck size={13} aria-hidden="true" />}
          </span>
          In stock only
        </label>

        <label className="flex items-center justify-between gap-2 text-sm text-slate-600 sm:ml-auto sm:justify-start">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => { setSort(event.target.value); setVisibleCount(12); }} className="min-w-0 rounded-full border border-slate-200 bg-white px-3 py-3 font-semibold text-slate-700 outline-none focus:border-[#6F3DD0] sm:px-4">
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-[#F8F9FF] px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6F3DD0]">No match</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Nothing fits those filters.</h3>
          <p className="mt-2 text-slate-600">Try another search or clear one of the filters.</p>
        </div>
      )}

      {hasMoreProducts && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 12)}
            className="btn btn-secondary min-w-44"
          >
            Load more <FiChevronDown size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}