"use client";

import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import SiteShell from "../../components/site-shell";

type OrderStatus = {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string | null;
  updatedAt: string | null;
};

type PaymentState = "pending" | "paid" | "failed" | "arrival";

const POLL_INTERVAL_MS = 4_000;

function getPaymentState(paymentStatus: string | null | undefined): PaymentState {
  const normalizedStatus = paymentStatus?.toLowerCase() ?? "";

  if (normalizedStatus === "paid" || normalizedStatus === "completed") {
    return "paid";
  }
  if (normalizedStatus === "failed") {
    return "failed";
  }
  if (normalizedStatus === "pay on delivery") {
    return "arrival";
  }

  return "pending";
}

function getProgressIndex(status: string) {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus.includes("deliver")) return 3;
  if (normalizedStatus.includes("ship") || normalizedStatus.includes("transit")) {
    return 2;
  }
  if (
    normalizedStatus.includes("process") ||
    normalizedStatus.includes("prepar")
  ) {
    return 1;
  }
  return 0;
}

const orderSteps = [
  { label: "Order received", icon: CheckCircle2 },
  { label: "Preparing your order", icon: PackageCheck },
  { label: "On the way", icon: Truck },
  { label: "Delivered", icon: CheckCircle2 },
];

export default function OrderConfirmation({
  orderId,
}: {
  orderId: string;
}) {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryMessage, setRetryMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const terminalStatus = useRef(false);
  const requestInFlight = useRef(false);

  const refreshOrder = useCallback(async () => {
    if (!orderId || requestInFlight.current) return;

    requestInFlight.current = true;
    setIsRefreshing(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}`,
        { cache: "no-store" },
      );
      const payload = await response.json();

      if (!response.ok || !payload.success || !payload.order) {
        throw new Error(payload.message || "Unable to check your order.");
      }

      const nextOrder = payload.order as OrderStatus;
      setOrder(nextOrder);
      terminalStatus.current = ["delivered", "cancelled"].includes(
        nextOrder.status.toLowerCase(),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not check your order right now.",
      );
    } finally {
      requestInFlight.current = false;
      setIsRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const initialCheck = window.setTimeout(() => {
      void refreshOrder();
    }, 0);
    const interval = window.setInterval(() => {
      if (!terminalStatus.current) void refreshOrder();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialCheck);
      window.clearInterval(interval);
    };
  }, [orderId, refreshOrder]);

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    setRetryMessage("");

    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "We could not send a new payment prompt.");
      }

      terminalStatus.current = false;
      setOrder((currentOrder) =>
        currentOrder
          ? { ...currentOrder, paymentStatus: "Pending", status: "Pending" }
          : currentOrder,
      );
      setRetryMessage("A new M-Pesa prompt has been sent to your phone.");
      void refreshOrder();
    } catch (error) {
      setRetryMessage(
        error instanceof Error
          ? error.message
          : "We could not send a new payment prompt.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const paymentState = order
    ? getPaymentState(order.paymentStatus)
    : "pending";
  const progressIndex = order ? getProgressIndex(order.status) : 0;

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            paymentState === "paid"
              ? "bg-emerald-100 text-emerald-600"
              : paymentState === "failed"
                ? "bg-rose-100 text-rose-600"
                : "bg-violet-100 text-[#6F3DD0]"
          }`}
        >
          {paymentState === "paid" ? (
            <CheckCircle2 size={36} strokeWidth={1.7} />
          ) : paymentState === "failed" ? (
            <AlertCircle size={36} strokeWidth={1.7} />
          ) : paymentState === "arrival" ? (
            <Truck size={36} strokeWidth={1.7} />
          ) : (
            <Clock3 size={36} strokeWidth={1.7} />
          )}
        </div>

        <p className="mt-8 text-center text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">
          {paymentState === "paid"
            ? "Payment confirmed"
            : paymentState === "failed"
              ? "Payment not completed"
              : paymentState === "arrival"
                ? "Order confirmed"
                : order
                  ? "Payment pending"
                  : "Checking order"}
        </p>
        <h1 className="mt-3 text-center text-3xl font-semibold text-slate-900 sm:text-4xl">
          {paymentState === "paid"
            ? "Thank you for your order"
            : paymentState === "failed"
              ? "Your payment could not be confirmed"
              : paymentState === "arrival"
                ? "Your order is confirmed"
                : order
                  ? "Confirming your payment"
                  : "Looking up your order"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center leading-7 text-slate-600">
          {paymentState === "paid"
            ? "Your M-Pesa payment is confirmed. We are preparing your order and will keep its progress updated here."
            : paymentState === "failed"
              ? "The M-Pesa request was cancelled or did not complete. You can request another payment prompt below."
              : paymentState === "arrival"
                ? "Your order has been placed. Pay KSh " +
                  (order ? order.totalAmount.toLocaleString() : "…") +
                  " when it arrives. We’ll contact you to coordinate delivery."
                : order
                  ? "Your order is saved. Complete the M-Pesa prompt on your phone; this page will update automatically as soon as your payment is confirmed."
                  : "We’re checking the latest order and payment details. This should only take a moment."}
        </p>

        <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-[#F8F9FF] p-4 text-sm sm:grid-cols-2 sm:p-5">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Order number
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {orderId ? (
                <span className="break-all font-mono text-xs">{orderId}</span>
              ) : (
                "Unavailable"
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Order total
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {order
                ? `KSh ${order.totalAmount.toLocaleString()}`
                : "Loading…"}
            </p>
          </div>
        </div>
        {order && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Order status:{" "}
            <span className="font-semibold text-slate-900">{order.status}</span>
          </p>
        )}

        {!orderId ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            This confirmation link is missing its order number. Please contact
            us so we can help locate your order.
          </div>
        ) : errorMessage ? (
          <div
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => void refreshOrder()}
              disabled={isRefreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 font-semibold text-[#6F3DD0] disabled:opacity-60"
            >
              <RefreshCw size={15} />
              Check again
            </button>
          </div>
        ) : paymentState === "pending" ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            {isRefreshing ? (
              <LoaderCircle
                className="mt-1 shrink-0 animate-spin text-amber-700"
                size={17}
              />
            ) : (
              <Clock3 className="mt-1 shrink-0 text-amber-700" size={17} />
            )}
            <p>
              {order
                ? "Waiting for M-Pesa to confirm the payment. Keep this page open or return to this order number later."
                : "Checking your order details…"}
            </p>
          </div>
        ) : null}

        {paymentState === "paid" && order && (
          <div className="mt-8 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
            <p className="flex items-center gap-2 font-semibold text-emerald-900">
              <CheckCircle2 size={19} />
              M-Pesa payment received
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              The payment for this order has been verified. Your order is now in
              our fulfilment process.
            </p>
          </div>
        )}

        {paymentState === "arrival" && order && (
          <div className="mt-8 rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5">
            <p className="flex items-center gap-2 font-semibold text-violet-950">
              <Truck size={19} />
              Pay on delivery selected
            </p>
            <p className="mt-2 text-sm leading-6 text-violet-900">
              Your order is confirmed. Please pay KSh{" "}
              {order.totalAmount.toLocaleString()} when it arrives. We’ll use
              your phone number to coordinate delivery.
            </p>
          </div>
        )}

        {order && order.status.toLowerCase() !== "cancelled" && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Order progress
            </h2>
            <ol className="mt-5 space-y-0">
              {orderSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isComplete = index < progressIndex;
                const isCurrent = index === progressIndex;

                return (
                  <li key={step.label} className="flex min-h-14 gap-4">
                    <div className="flex w-8 shrink-0 flex-col items-center">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isComplete || isCurrent
                            ? "bg-[#6F3DD0] text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isComplete ? (
                          <Check size={16} />
                        ) : (
                          <StepIcon size={16} />
                        )}
                      </span>
                      {index < orderSteps.length - 1 && (
                        <span
                          className={`my-1 w-px flex-1 ${
                            isComplete ? "bg-[#6F3DD0]" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-4">
                      <p
                        className={`pt-1 text-sm ${
                          isCurrent || isComplete
                            ? "font-semibold text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="mt-1 text-xs text-slate-500">
                          {index === 3
                            ? "Your order has been delivered."
                            : "We’ll update this step as your order progresses."}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {order?.status.toLowerCase() === "cancelled" && (
          <div className="mt-8 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5">
            <p className="font-semibold text-rose-900">This order was cancelled</p>
            <p className="mt-2 text-sm leading-6 text-rose-800">
              Contact us if you need help with this order or payment.
            </p>
          </div>
        )}

        {paymentState === "failed" && (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => void handleRetryPayment()}
              disabled={isRetrying}
              className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRetrying ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Sending prompt…
                </>
              ) : (
                "Try payment again"
              )}
            </button>
            {retryMessage && (
              <p className="text-center text-sm text-slate-600" role="status">
                {retryMessage}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-[1.25rem] bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#6F3DD0]" size={18} />
          <span>
            {paymentState === "paid"
              ? "Your payment has been verified securely. Keep your order number for any follow-up."
              : paymentState === "arrival"
                ? "Your order is confirmed. Keep your order number and pay when your delivery arrives."
              : "Payment confirmation is automatic. Your order status will update here when M-Pesa responds."}
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products" className="btn btn-primary">
            Continue shopping
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            Get help with this order
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
