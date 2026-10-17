export default function Loading() {
  return (
    <main
      role="status"
      aria-label="Loading page"
      className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="h-56 animate-pulse rounded-[2rem] bg-slate-200 sm:h-72" />
      <div className="mt-8 h-10 max-w-sm animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-4 h-5 max-w-xl animate-pulse rounded-lg bg-slate-100" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl border border-slate-100 bg-white"
          />
        ))}
      </div>
      <span className="sr-only">Loading store content…</span>
    </main>
  );
}
