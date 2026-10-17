"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
};

export default function ProductReviews({
  productId,
}: {
  productId: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [rating, setRating] = useState(5);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}/reviews`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load reviews.");
      }
      setReviews(payload.reviews);
      setAverageRating(payload.averageRating);
      setReviewCount(payload.reviewCount);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load reviews.",
      );
      setIsError(true);
    } finally {
      setLoadingReviews(false);
    }
  }, [productId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReviews(), 0);
    return () => window.clearTimeout(timer);
  }, [loadReviews]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, email, rating, reviewText }),
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to submit your review.");
      }

      setReviewText("");
      setOrderId("");
      setEmail("");
      setMessage("Thanks for sharing your experience. Your review is live.");
      await loadReviews();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to submit your review.",
      );
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">
            Customer feedback
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Product reviews
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Star size={18} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-900">
            {averageRating === null ? "New" : averageRating.toFixed(1)}
          </span>
          <span>
            · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.75fr)]">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            What customers say
          </h3>
          {loadingReviews ? (
            <p className="mt-4 text-sm text-slate-500" role="status">
              Loading reviews…
            </p>
          ) : reviews.length ? (
            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-slate-100 bg-[#FAF9F7] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={15}
                          className={
                            index < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                    <time
                      className="text-xs text-slate-500"
                      dateTime={review.created_at}
                    >
                      {new Date(review.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {review.review_text}
                  </p>
                  <p className="mt-3 text-xs font-medium text-emerald-700">
                    Verified purchase
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-[#FAF9F7] p-4 text-sm leading-6 text-slate-600">
              No reviews yet. Customers who have completed an M-Pesa purchase
              can share the first review.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 p-4 sm:p-5"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Write a review
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Reviews are limited to customers with a completed purchase of this
            product.
          </p>

          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Your rating
            </legend>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    aria-pressed={rating === value}
                    className="rounded p-1 focus-visible:outline-2 focus-visible:outline-[#6F3DD0]"
                  >
                    <Star
                      size={22}
                      className={
                        value <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label
            htmlFor="review-order-id"
            className="mb-1.5 mt-4 block text-sm font-medium text-slate-700"
          >
            Order number
          </label>
          <input
            id="review-order-id"
            type="text"
            required
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Paste the order ID from your confirmation"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]"
          />

          <label
            htmlFor="review-email"
            className="mb-1.5 mt-4 block text-sm font-medium text-slate-700"
          >
            Checkout email
          </label>
          <input
            id="review-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email used for your order"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]"
          />

          <label
            htmlFor="review-text"
            className="mb-1.5 mt-4 block text-sm font-medium text-slate-700"
          >
            Your review
          </label>
          <textarea
            id="review-text"
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="What did you think of the product?"
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#7E9DD3] focus:ring-4 focus:ring-[#E4EBFB]"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {reviewText.length}/2,000
          </p>

          {message && (
            <p
              className={`mt-3 text-sm ${isError ? "text-rose-700" : "text-emerald-700"}`}
              role={isError ? "alert" : "status"}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      </div>
    </section>
  );
}
