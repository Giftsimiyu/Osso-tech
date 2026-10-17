import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabaseClient } from "@/backend/lib/supabase/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function isAuthenticatedUser() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  return !error && user !== null;
}

export async function GET() {
  try {
    if (!(await isAuthenticatedUser())) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 1. Get orders
    // --------------------------------------------------

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        phone,
        email,
        delivery_address,
        total_amount,
        status,
        payment_status,
        mpesa_receipt,
        merchant_request_id,
        checkout_request_id,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Admin orders fetch error:", ordersError);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch orders.",
        },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    // --------------------------------------------------
    // 2. Get order items
    // --------------------------------------------------

    const orderIds = orders.map((order) => order.id);

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        product_name,
        quantity,
        price,
        subtotal
      `)
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("Order items fetch error:", itemsError);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch order items.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 3. Attach items to their orders
    // --------------------------------------------------

    const ordersWithItems = orders.map((order) => ({
      ...order,

      items: (orderItems || []).filter(
        (item) => item.order_id === order.id
      ),
    }));

    // --------------------------------------------------
    // 4. Return orders
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error("Admin orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching orders.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// UPDATE ORDER STATUS
// --------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAuthenticatedUser())) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID and status are required.",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Order status update error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to update order status.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Admin order PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating the order.",
      },
      { status: 500 }
    );
  }
}