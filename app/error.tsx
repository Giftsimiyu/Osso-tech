"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[65vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-600">
        Something went wrong
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
        Your order and cart are safe. Try loading the page again.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        Try again
      </button>
    </main>
  );
}
