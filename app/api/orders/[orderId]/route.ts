import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../backend/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  if (!UUID_PATTERN.test(orderId)) {
    return NextResponse.json(
      { success: false, message: "A valid order number is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total_amount, status, payment_status, updated_at")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Order status lookup error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to check your order right now." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Order not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      order: {
        id: order.id,
        totalAmount: Number(order.total_amount),
        status: order.status,
        paymentStatus: order.payment_status,
        updatedAt: order.updated_at,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
