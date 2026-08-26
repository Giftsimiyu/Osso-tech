import SiteShell from "../components/site-shell";

const products = [
  { name: "Nexora Phone 15", price: "$799", category: "Phones" },
  { name: "AeroBook Pro 14", price: "$1,199", category: "Laptops" },
  { name: "ChargeWave Pad", price: "$49", category: "Chargers" },
  { name: "Orbit Headset", price: "$129", category: "Accessories" },
];

export default function ProductsPage() {
  return (
    <SiteShell>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">Products</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Browse our collection</h1>
          </div>
          <a href="/contact" className="btn btn-primary">Need help?</a>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.name} className="rounded-[1.75rem] border border-slate-200 bg-[#F8F9FF] p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm">📦</div>
              <p className="mt-6 text-lg font-semibold text-slate-900">{product.name}</p>
              <p className="mt-2 text-sm text-slate-600">{product.category}</p>
              <p className="mt-4 text-xl font-semibold text-slate-900">{product.price}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
