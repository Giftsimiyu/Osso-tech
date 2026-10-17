import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../../backend/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(
  body: object,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

  if (!UUID_PATTERN.test(productId)) {
    return jsonResponse(
      { success: false, message: "A valid product is required." },
      400,
    );
  }

  const supabase = createAdminClient();
  const { data: reviews, error } = await supabase
    .from("product_reviews")
    .select("id, rating, review_text, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Product reviews lookup error:", error);
    return jsonResponse(
      { success: false, message: "Unable to load product reviews." },
      500,
    );
  }

  const reviewList = reviews ?? [];
  const averageRating = reviewList.length
    ? reviewList.reduce((sum, review) => sum + review.rating, 0) /
      reviewList.length
    : null;

  return jsonResponse({
    success: true,
    reviews: reviewList,
    averageRating,
    reviewCount: reviewList.length,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

  if (!UUID_PATTERN.test(productId)) {
    return jsonResponse(
      { success: false, message: "A valid product is required." },
      400,
    );
  }

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(
        { success: false, message: "Enter valid review details." },
        400,
      );
    }
    const submission = body as Record<string, unknown>;
    const orderId =
      typeof submission.orderId === "string" ? submission.orderId.trim() : "";
    const email =
      typeof submission.email === "string" ? submission.email.trim() : "";
    const rating = Number(submission.rating);
    const reviewText =
      typeof submission.reviewText === "string"
        ? submission.reviewText.trim()
        : "";

    if (
      !UUID_PATTERN.test(orderId) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      reviewText.length < 5 ||
      reviewText.length > 2000
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Enter your order number, checkout email, a 1–5 star rating, and a review between 5 and 2,000 characters.",
        },
        400,
      );
    }

    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, email, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Review order verification error:", orderError);
      return jsonResponse(
        { success: false, message: "Unable to verify this order." },
        500,
      );
    }

    if (
      !order ||
      !order.email ||
      order.email.toLowerCase() !== email.toLowerCase() ||
      !["paid", "completed"].includes(
        String(order.payment_status).toLowerCase(),
      )
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Reviews are available to customers with a completed M-Pesa purchase. Check the order number and checkout email.",
        },
        403,
      );
    }

    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    if (variantsError) {
      console.error("Review product variant lookup error:", variantsError);
      return jsonResponse(
        { success: false, message: "Unable to verify this product." },
        500,
      );
    }

    const variantIds = (variants ?? []).map((variant) => variant.id);
    if (variantIds.length === 0) {
      return jsonResponse(
        { success: false, message: "This product is not available for review." },
        404,
      );
    }

    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .in("variant_id", variantIds)
      .limit(1)
      .maybeSingle();

    if (itemError) {
      console.error("Review purchase verification error:", itemError);
      return jsonResponse(
        { success: false, message: "Unable to verify this purchase." },
        500,
      );
    }
    if (!orderItem) {
      return jsonResponse(
        {
          success: false,
          message: "This order does not contain this product.",
        },
        403,
      );
    }

    const { data: existingReview, error: existingReviewError } =
      await supabase
        .from("product_reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("order_id", orderId)
        .maybeSingle();

    if (existingReviewError) {
      console.error("Existing review lookup error:", existingReviewError);
      return jsonResponse(
        { success: false, message: "Unable to submit your review." },
        500,
      );
    }
    if (existingReview) {
      return jsonResponse(
        { success: false, message: "You have already reviewed this product." },
        409,
      );
    }

    const { data: review, error: insertError } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        order_id: orderId,
        rating,
        review_text: reviewText,
      })
      .select("id, rating, review_text, created_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return jsonResponse(
          { success: false, message: "You have already reviewed this product." },
          409,
        );
      }
      console.error("Product review creation error:", insertError);
      return jsonResponse(
        { success: false, message: "Unable to submit your review." },
        500,
      );
    }

    return jsonResponse({ success: true, review }, 201);
  } catch (error) {
    console.error("Product review request error:", error);
    return jsonResponse(
      { success: false, message: "Unable to process your review." },
      500,
    );
  }
}
