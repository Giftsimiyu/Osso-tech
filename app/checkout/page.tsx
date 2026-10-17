"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../components/cartProvider";
import SiteShell from "../components/site-shell";

type PaymentMethod = "mpesa" | "arrival";

const defaultForm = {
  customerName: "",
  phone: "",
  email: "",
  deliveryAddress: "",
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const [form, setForm] = useState(defaultForm);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
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
          paymentMethod,
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

      if (paymentMethod === "mpesa") {
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
      }

      clearCart();
      router.push(
        `/checkout/success?orderId=${encodeURIComponent(orderPayload.order.id)}`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing your order.",
      );
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
      <section className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#6F3DD0]"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <div className="mb-7 mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Complete your order
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Add your delivery details and choose how you would like to pay.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            {errorMessage && (
              <div
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <section aria-labelledby="delivery-heading">
              <h2
                id="delivery-heading"
                className="text-lg font-semibold text-slate-900"
              >
                1. Contact & delivery
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="customerName"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    pattern="(?:\+?254|0)?[17](?:[ -]?[0-9]){8}"
                    title="Enter a valid Kenyan mobile number, such as 0712345678 or +254712345678."
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    className={inputClassName}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {paymentMethod === "mpesa"
                      ? "We’ll send the M-Pesa prompt to this number."
                      : "Our team will use this number to coordinate delivery."}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="deliveryAddress"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Delivery address
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    required
                    minLength={5}
                    maxLength={500}
                    autoComplete="street-address"
                    value={form.deliveryAddress}
                    onChange={handleChange}
                    placeholder="Building, street, area or town"
                    rows={3}
                    className={`${inputClassName} resize-y`}
                  />
                </div>
              </div>
            </section>

            <section
              aria-labelledby="payment-heading"
              className="border-t border-slate-100 pt-5"
            >
              <h2
                id="payment-heading"
                className="text-lg font-semibold text-slate-900"
              >
                2. Payment method
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "mpesa"
                      ? "border-[#6F3DD0] bg-[#F8F5FF] ring-2 ring-[#6F3DD0]/10"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mpesa"
                    checked={paymentMethod === "mpesa"}
                    onChange={() => setPaymentMethod("mpesa")}
                    className="mt-1 accent-[#6F3DD0]"
                  />
                  <span className="flex min-w-0 gap-3">
                    <Smartphone
                      size={20}
                      className="mt-0.5 shrink-0 text-[#6F3DD0]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        M-Pesa
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Pay securely using a prompt on your phone.
                      </span>
                    </span>
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "arrival"
                      ? "border-[#6F3DD0] bg-[#F8F5FF] ring-2 ring-[#6F3DD0]/10"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="arrival"
                    checked={paymentMethod === "arrival"}
                    onChange={() => setPaymentMethod("arrival")}
                    className="mt-1 accent-[#6F3DD0]"
                  />
                  <span className="flex min-w-0 gap-3">
                    <Truck size={20} className="mt-0.5 shrink-0 text-[#6F3DD0]" />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        Pay on delivery
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Pay when your order arrives.
                      </span>
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole size={14} className="text-emerald-700" />
                Secure checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                Your M-Pesa PIN stays private
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-700" />
                Order tracking
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Placing order…"
                : paymentMethod === "mpesa"
                  ? `Continue to M-Pesa · KSh ${subtotal.toLocaleString()}`
                  : `Place order · KSh ${subtotal.toLocaleString()}`}
            </button>
          </form>

          <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-[#F8F9FF] p-5 shadow-sm lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6F3DD0]">
              Order summary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </h2>

            <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex min-w-0 gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-center text-[10px] text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.variantName} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-slate-900">
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Delivery</span>
                <span>Confirmed after order</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
                <span>Total</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-white p-3.5 text-xs leading-5 text-slate-600">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-emerald-700"
                size={17}
              />
              <span>
                Your order details are handled securely. We never ask for your
                M-Pesa PIN.
              </span>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
