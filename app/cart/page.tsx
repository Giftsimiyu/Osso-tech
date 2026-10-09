"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../components/cartProvider";
import SiteShell from "../components/site-shell";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EFEBFA] text-[#6F3DD0]">
            <ShoppingBag size={36} strokeWidth={1.7} />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">
            Your collection
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Your cart is empty
          </h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
            You have not added anything yet. Find something that fits your setup
            and it will appear here.
          </p>
          <Link href="/products" className="btn btn-primary mt-8">
            Continue shopping
          </Link>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section>
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">
            Your collection
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Your cart
              </h1>
              <p className="mt-3 text-slate-600">
                Review your selected gadgets before checkout.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.variantId}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5"
              >
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#F8F9FF] via-[#E4EBFB] to-[#EFEBFA]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                    {item.variantName && <p className="mt-1 text-sm text-slate-500">{item.variantName}</p>}
                    {item.sku && <p className="mt-1 text-xs text-slate-400">SKU: {item.sku}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-full border border-slate-200 bg-[#F8F9FF]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-[#EFEBFA] hover:text-[#6F3DD0]"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-[#EFEBFA] hover:text-[#6F3DD0]"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-rose-500 transition hover:text-rose-700"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                <p className="text-lg font-semibold text-slate-900 sm:self-start">
                  KSh {(item.price * item.quantity).toLocaleString()}
                </p>
              </article>
            ))}
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-[#F8F9FF] p-6 shadow-sm lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6F3DD0]">
              Summary
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Order summary</h2>

            <div className="mt-6 flex justify-between border-b border-slate-200 pb-4 text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="mt-4 flex justify-between text-lg font-semibold text-slate-900">
              <span>Total</span>
              <span>KSh {subtotal.toLocaleString()}</span>
            </div>

            <Link href="/checkout" className="btn btn-primary mt-6 w-full">
              Proceed to checkout
            </Link>
            <Link href="/products" className="mt-4 block text-center text-sm font-medium text-slate-500 transition hover:text-[#6F3DD0]">
              Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
