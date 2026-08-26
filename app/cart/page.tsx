import SiteShell from "../components/site-shell";

export default function CartPage() {
  return (
    <SiteShell>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">Cart</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your cart is ready</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Add your favorite gadgets and continue to checkout when you are ready.
        </p>
      </section>
    </SiteShell>
  );
}
