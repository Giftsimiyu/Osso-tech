import SiteShell from "../components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">About</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">A thoughtful storefront for modern tech</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Gadget Store is designed to make discovering premium phones, laptops, chargers, and accessories feel calm, clear, and effortless.
        </p>
      </section>
    </SiteShell>
  );
}
