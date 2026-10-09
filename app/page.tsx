import Link from "next/link";
import { createClient } from "../backend/lib/supabase/server";
import ProductCard from "./components/productCard";
import HeroCarousel from "./components/heroCarousel";
import SiteShell from "./components/site-shell";

const categories = [
  { title: "Phones", slug: "phones", subtitle: "Smart devices for every lifestyle", accent: "bg-[#E4EBFB]" },
  { title: "Laptops", slug: "laptops", subtitle: "Performance meets portability", accent: "bg-[#FDEFEC]" },
  { title: "Chargers", slug: "chargers", subtitle: "Power solutions that keep up", accent: "bg-[#EFEBFA]" },
  { title: "Accessories", slug: "accessories", subtitle: "Essential gear and extras", accent: "bg-[#E1F2EC]" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      brand,
      model,
      image_url,
      featured,
      product_variants (
        id,
        sku,
        variant_name,
        price,
        stock_quantity,
        color
      )
    `)
    .order("name");

  if (error) {
    console.error(error);

    return (
      <SiteShell>
        <section className="rounded-[2rem] border border-rose-100 bg-[#FFF8F8] p-8 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Store update</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">We couldn&apos;t load the store</h1>
          <p className="mt-3 max-w-xl text-slate-600">Please try again in a moment. Our product collection is temporarily out of reach.</p>
        </section>
      </SiteShell>
    );
  }

  const allProducts = products ?? [];
  const featuredProducts = allProducts.filter((product) => product.featured);
  const productSelection = (featuredProducts.length > 0 ? featuredProducts : allProducts).slice(0, 3);

  return (
    <SiteShell>
      <section className="space-y-6">
        <HeroCarousel products={(featuredProducts.length > 0 ? featuredProducts : allProducts).slice(0, 3)} />
        <p className="text-sm font-medium text-slate-500">{allProducts.length} {allProducts.length === 1 ? "product" : "products"} available now</p>
      </section>

      <section id="shop" className="mt-16 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">Featured products</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Curated picks for every setup</h2>
          </div>
          <Link href="/products" className="btn btn-primary">See more</Link>
        </div>
        {productSelection.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {productSelection.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-[#F8F9FF] px-6 py-16 text-center">
            <h3 className="text-2xl font-semibold text-slate-900">No products yet</h3>
            <p className="mt-2 text-slate-600">New gadgets will appear here as soon as they are added.</p>
          </div>
        )}
      </section>

      <section id="categories" className="mt-16 rounded-[2rem] bg-white p-8 shadow-sm shadow-slate-200">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">Categories</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Shop by category</h2>
          </div>
          <Link href="/categories" className="btn btn-secondary">Explore all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.title} href={`/products?category=${category.slug}`} className="rounded-[1.75rem] border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className={`inline-flex rounded-3xl px-3 py-2 text-sm font-semibold ${category.accent}`}>{category.title}</div>
              <p className="mt-5 text-lg font-semibold text-slate-900">{category.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.subtitle}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6F3DD0]">Shop now <span aria-hidden="true">-&gt;</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">Why choose us</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Everything you need to buy with confidence</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Fast fulfilment",
              description: "Orders are handled quickly, with smooth shipping updates from the moment your cart is confirmed.",
              accent: "bg-[#E4EBFB]",
            },
            {
              title: "Secure checkout",
              description: "Your payment and delivery details are protected with a clean, guided checkout flow built around trust.",
              accent: "bg-[#EFEBFA]",
            },
            {
              title: "Expertly curated gear",
              description: "Every product is selected to help customers upgrade their setup without the guesswork.",
              accent: "bg-[#E1F2EC]",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`inline-flex rounded-2xl px-3 py-2 text-sm font-semibold ${item.accent}`}>{item.title}</div>
              <p className="mt-5 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

{/*const heroSlides = [
  {
    title: "Meet the newest release",
    subtitle: "Nexora Phone 15",
    description: "A premium smartphone with a pro camera system and gorgeous video capture for creators.",
    accent: "from-[#7E9DD3] via-[#6F3DD0] to-[#1E1E1E]",
  },
  {
    title: "Built for hybrid work",
    subtitle: "AeroBook Pro 14",
    description: "Lightweight performance, buttery-smooth display, and refined portability for workdays on the move.",
    accent: "from-[#E4EBFB] via-[#EFE7FF] to-[#D9F4E7]",
  },
  {
    title: "Charge faster, travel lighter",
    subtitle: "ChargeWave Pad",
    description: "Fast wireless charging with a slim profile that keeps your workspace clutter-free.",
    accent: "from-[#FDEFEC] via-[#F8E7EB] to-[#E4EBFB]",
  },
];

const featuredProducts = [
  {
    name: "Nexora Phone 15",
    category: "Phones",
    price: "$799",
    badge: "Bestseller",
    description: "Fast 5G, premium screen, and a pro camera system.",
  },
  {
    name: "AeroBook Pro 14",
    category: "Laptops",
    price: "$1,199",
    badge: "Hot Deal",
    description: "Lightweight performance for creators and professionals.",
  },
  {
    name: "ChargeWave Pad",
    category: "Chargers",
    price: "$49",
    badge: "New",
    description: "High-speed wireless charging with refined design.",
  },
];

const categories = [
  { title: "Phones", subtitle: "Smart devices for every lifestyle", accent: "bg-[#E4EBFB] text-[#1E1E1E]" },
  { title: "Laptops", subtitle: "Performance meets portability", accent: "bg-[#FDEFEC] text-[#1E1E1E]" },
  { title: "Chargers", subtitle: "Power solutions that keep up", accent: "bg-[#EFEBFA] text-[#1E1E1E]" },
  { title: "Accessories", subtitle: "Essential gear and extras", accent: "bg-[#E1F2EC] text-[#1E1E1E]" },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E4EBFB] px-4 py-2 text-sm font-semibold text-slate-800">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6F3DD0]" />
                Mobile-ready gadget store
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Discover the best tech for work, play, and everyday life.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-slate-600">
                  {heroSlides[activeSlide].description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/products" className="btn btn-primary">
                  Shop now
                </Link>
                <Link href="/about" className="btn btn-secondary">
                  Learn more
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.subtitle}
                    type="button"
                    aria-label={`Show ${slide.subtitle}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition ${activeSlide === index ? "w-8 bg-[#6F3DD0]" : "w-2.5 bg-slate-300"}`}
                  />
                ))}
              </div>
            </div>

            <div className={`rounded-[2rem] bg-gradient-to-br ${heroSlides[activeSlide].accent} p-6 text-slate-900 shadow-xl`}>
              <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6F3DD0]">Featured release</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">{heroSlides[activeSlide].subtitle}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{heroSlides[activeSlide].title}</p>
                <div className="mt-6 rounded-[1.2rem] bg-slate-950/90 px-4 py-3 text-white">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Limited offer</p>
                  <p className="mt-2 text-2xl font-semibold">Up to 30% off</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="shop" className="mt-16 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">Featured products</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Curated picks for every setup</h2>
          </div>
          <Link href="/products" className="btn btn-primary">
            See more
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.name} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#EFEBFA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6F3DD0]">
                  {product.badge}
                </span>
                <div className="rounded-3xl bg-[#FDEFEC] px-3 py-2 text-xs font-semibold text-slate-900">{product.category}</div>
              </div>
              <div className="mt-8 rounded-[1.75rem] bg-gradient-to-br from-[#FEFEFE] via-[#E4EBFB] to-[#D5DFF4] p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-md">📦</div>
                <p className="mt-5 text-xl font-semibold text-slate-900">{product.name}</p>
              </div>
              <p className="mt-5 text-xl font-semibold text-slate-900">{product.price}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
              <button className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#6F3DD0] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5a34b8]">
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="categories" className="mt-16 rounded-[2rem] bg-white p-8 shadow-sm shadow-slate-200">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#6F3DD0]">Categories</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Shop by category</h2>
          </div>
          <Link href="/products" className="btn btn-secondary">
            Explore all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div key={category.title} className="rounded-[1.75rem] border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className={`inline-flex rounded-3xl px-3 py-2 text-sm font-semibold ${category.accent}`}>
                {category.title}
              </div>
              <p className="mt-5 text-lg font-semibold text-slate-900">{category.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.subtitle}</p>
              <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6F3DD0] transition hover:text-[#4b2d96]">
                Shop now <span aria-hidden="true">→</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}*/}
