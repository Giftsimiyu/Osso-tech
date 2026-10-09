import Image from "next/image";
import Link from "next/link";
import { getProductImageUrl } from "./image-url";

type ProductVariant = {
	id: string;
	sku: string;
	variant_name: string;
	price: number;
	stock_quantity: number;
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
	const hasStock = variants.some((variant) => variant.stock_quantity > 0);

	return (
		<Link
			href={`/products/${product.slug}`}
			className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9B9ED] hover:shadow-xl hover:shadow-[#6F3DD0]/10"
		>
			<div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#F8F9FF] via-[#E4EBFB] to-[#EFEBFA]">
				<div className="absolute inset-5 rounded-[1.5rem] border border-white/70 bg-white/45" />
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={product.name}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
						unoptimized
						className="relative object-contain p-8 transition duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="relative flex h-full items-center justify-center text-sm font-medium text-slate-400">
						Product image unavailable
					</div>
				)}
			</div>

			<div className="flex flex-1 flex-col p-5">
				{product.brand && (
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F3DD0]">
						{product.brand}
					</p>
				)}

				<h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
					{product.name}
				</h3>

				<div className="mt-auto pt-5">
					{lowestPrice !== null && (
						<p className="text-xl font-semibold text-slate-900">
							From KSh {lowestPrice.toLocaleString()}
						</p>
					)}

					<p
						className={`mt-3 flex items-center gap-2 text-sm font-medium ${
							hasStock ? "text-emerald-600" : "text-rose-500"
						}`}
					>
						<span
							className={`h-2 w-2 rounded-full ${
								hasStock ? "bg-emerald-500" : "bg-rose-400"
							}`}
						/>
						{hasStock ? "In stock" : "Out of stock"}
					</p>
				</div>
			</div>
		</Link>
	);
}
