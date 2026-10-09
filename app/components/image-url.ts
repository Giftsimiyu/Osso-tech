export function getProductImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const embeddedImageUrl = url.searchParams.get("imgurl");

    return embeddedImageUrl || imageUrl;
  } catch {
    return null;
  }
}