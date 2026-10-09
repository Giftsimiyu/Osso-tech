import { notFound } from "next/navigation";
import { createClient } from "../../../backend/lib/supabase/server";
import ProductDetail from "../../components/productDetail";
import SiteShell from "../../components/site-shell";

type Props = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function ProductPage({ params }: Props) {
	const { slug } = await params;
	const supabase = await createClient();

	const { data: product, error } = await supabase
		.from("products")
		.select(`
			id,
			name,
			slug,
			brand,
			model,
			description,
			image_url,
			featured,
			product_variants (
				id,
				sku,
				variant_name,
				price,
				stock_quantity,
				condition,
				warranty,
				color,
				exact_specifications,
				image_url
			)
		`)
		.eq("slug", slug)
		.single();

	if (error || !product) {
		notFound();
	}

	return (
		<SiteShell>
			<ProductDetail product={product} />
		</SiteShell>
	);
}
