import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProductImageUrl } from "./image-url";

type ProductVariant = {
	id: string;
	sku: string;
	variant_name: string;
	price: number;
	color: string | null;
};

type Product = {
	id: string;
	name: string;
	slug: string;
	brand: string | null;
	image_url: string | null;
	product_variants: ProductVariant[];
};

type ProductCardProps = {
	product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
	const variants = product.product_variants ?? [];
	const imageUrl = getProductImageUrl(product.image_url);
	const lowestPrice = variants.length
		? Math.min(...variants.map((variant) => variant.price))
		: null;

	return (
		<Link
			href={`/products/${product.slug}`}
			className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9B9ED] hover:shadow-xl hover:shadow-[#6F3DD0]/10 sm:rounded-[1.75rem]"
		>
			<div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#F8F9FF] via-[#E4EBFB] to-[#EFEBFA] sm:aspect-square">
				<div aria-hidden="true" className="motion-product-halo absolute left-1/2 top-1/2 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(111,61,208,0.3)_0%,rgba(126,157,211,0.16)_48%,transparent_72%)] blur-md sm:h-52 sm:w-52" />
				<div aria-hidden="true" className="motion-orbit absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
				<div aria-hidden="true" className="motion-orbit absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6F3DD0]/15" style={{ animationDirection: "reverse", animationDuration: "24s" }} />
				<div className="absolute inset-4 rounded-[1.25rem] border border-white/70 bg-white/35 sm:inset-5 sm:rounded-[1.5rem]" />
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={product.name}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
						unoptimized
						className="relative object-contain p-5 transition duration-500 group-hover:scale-105 sm:p-8"
					/>
				) : (
					<div className="relative flex h-full items-center justify-center text-sm font-medium text-slate-400">
						Product image unavailable
					</div>
				)}
			</div>

			<div className="flex flex-1 flex-col p-4 sm:p-5">
				{product.brand && (
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F3DD0]">
						{product.brand}
					</p>
				)}

				<h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
					{product.name}
				</h3>

				<div className="mt-auto pt-5">
					<div className="flex items-end justify-between gap-3">
						{lowestPrice !== null && (
							<p className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
								From KSh {lowestPrice.toLocaleString()}
							</p>
						)}
						<ArrowUpRight size={19} aria-hidden="true" className="mb-0.5 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#6F3DD0]" />
					</div>

				</div>
			</div>
		</Link>
	);
}
