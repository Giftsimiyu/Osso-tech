"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../components/cartProvider";
import SiteShell from "../components/site-shell";

const defaultForm = {
  customerName: "",
  phone: "",
  email: "",
  deliveryAddress: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          phone: form.phone,
          email: form.email,
          deliveryAddress: form.deliveryAddress,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const orderPayload = await orderResponse.json();

      if (!orderResponse.ok || !orderPayload.success || !orderPayload.order) {
        throw new Error(
          orderPayload.message || "Unable to create your order right now.",
        );
      }

      const paymentResponse = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderPayload.order.id }),
      });

      const paymentPayload = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentPayload.success) {
        throw new Error(
          paymentPayload.message || "We could not send the M-Pesa request.",
        );
      }

      clearCart();
      router.push(
        `/checkout/success?orderId=${encodeURIComponent(orderPayload.order.id)}&phone=${encodeURIComponent(form.phone)}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while processing your payment.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EFEBFA] text-[#6F3DD0]">
            <CheckCircle2 size={36} strokeWidth={1.7} />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">
            Ready when you are
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Your cart is empty
          </h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
            Add some products before checking out.
          </p>
          <Link href="/products" className="btn btn-primary mt-8">
            Browse products
          </Link>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#6F3DD0]"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <div className="mb-8 mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">
            Secure checkout
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Complete your order
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Share your delivery details and we will send the M-Pesa payment prompt to your phone.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900">Customer information</h2>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="mb-2 block text-sm font-medium text-slate-700">
                  Full name <span className="text-[#6F3DD0]">*</span>
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                  M-Pesa phone number <span className="text-[#6F3DD0]">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  This number will receive the payment prompt.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium text-slate-700">
                  Delivery address <span className="text-[#6F3DD0]">*</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  required
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Enter your delivery location"
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing..." : `Pay KSh ${subtotal.toLocaleString()}`}
            </button>
          </form>

          <aside className="h-fit rounded-[1.75rem] border border-slate-200 bg-[#F8F9FF] p-6 shadow-sm lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6F3DD0]">Summary</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your order</h2>

            <div className="mt-6 space-y-5">
              {items.map((item) => (
                <div key={item.variantId} className="flex min-w-0 gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-white via-[#E4EBFB] to-[#EFEBFA]">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-center text-[10px] text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.variantName} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-slate-900">
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex justify-between text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-white p-4 text-sm leading-5 text-slate-600">
              <ShieldCheck className="mt-0.5 shrink-0 text-[#6F3DD0]" size={18} />
              <span>Your payment details stay protected throughout checkout.</span>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
