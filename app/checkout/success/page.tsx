"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import SiteShell from "../../components/site-shell";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "unknown";
  const phone = searchParams.get("phone") ?? "your phone";

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} strokeWidth={1.7} />
        </div>

        <p className="mt-8 text-center text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">
          Order received
        </p>
        <h1 className="mt-3 text-center text-3xl font-semibold text-slate-900 sm:text-4xl">
          Payment request sent successfully
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
          We have created your order and sent the M-Pesa prompt to {phone}. Please complete the payment on your phone to confirm the purchase.
        </p>

        <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-[#F8F9FF] p-5 text-sm text-slate-600 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Order ID</p>
            <p className="mt-2 font-semibold text-slate-900">#{orderId}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">M-Pesa number</p>
            <p className="mt-2 font-semibold text-slate-900">{phone}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 shrink-0 text-amber-600" size={18} />
            <p className="text-sm leading-6 text-amber-900">
              Please check your phone for the STK pop-up and complete the payment. Once confirmed, your order will move into processing.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-[1.25rem] bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#6F3DD0]" size={18} />
          <span>Your order details are saved and the payment verification will be processed automatically after confirmation.</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products" className="btn btn-primary">
            Continue shopping
          </Link>
          <Link href="/cart" className="btn btn-secondary">
            Review cart
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
