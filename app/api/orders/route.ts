import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      phone,
      email,
      deliveryAddress,
      items,
    } = body;

    // ---------------------------------------------
    // 1. Validate customer information
    // ---------------------------------------------

    if (!customerName || !phone || !deliveryAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer name, phone number and delivery address are required.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 2. Validate cart
    // ---------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 3. Get variant IDs from the cart
    // ---------------------------------------------

    const variantIds = items.map((item) => item.variantId);

    if (variantIds.some((id) => !id)) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more cart items are invalid.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 4. Fetch REAL variant data from Supabase
    // ---------------------------------------------

    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select(`
        id,
        sku,
        variant_name,
        price,
        stock_quantity,
        product_id
      `)
      .in("id", variantIds);

    if (variantsError) {
      console.error("Variant lookup error:", variantsError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify your cart items.",
        },
        { status: 500 }
      );
    }

    if (!variants || variants.length !== variantIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more products in your cart are no longer available.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 4b. Fetch the parent products
    // ---------------------------------------------

    const productIds = [
      ...new Set(variants.map((variant) => variant.product_id)),
    ];

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    if (productsError) {
      console.error("Product lookup error:", productsError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify product information.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // 5. Build order items using database prices
    // ---------------------------------------------

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const variant = variants.find(
        (v) => v.id === item.variantId
      );

      if (!variant) {
        return NextResponse.json(
          {
            success: false,
            message: "A product in your cart could not be found.",
          },
          { status: 400 }
        );
      }

      const product = products?.find(
        (p) => p.id === variant.product_id
      );

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product quantity.",
          },
          { status: 400 }
        );
      }

      // -------------------------------------------
      // Check stock
      // -------------------------------------------

      if (variant.stock_quantity < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `${product?.name ?? "A product"} does not have enough stock.`,
          },
          { status: 400 }
        );
      }

      const price = Number(variant.price);
      const subtotal = price * quantity;

      totalAmount += subtotal;

      orderItems.push({
        variant_id: variant.id,
        variant_name: variant.variant_name,
        product_name: product?.name ?? "Product",
        quantity,
        price,
      });
    }

    // ---------------------------------------------
    // 6. Create the order
    // ---------------------------------------------

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        phone,
        email: email || null,
        delivery_address: deliveryAddress,
        total_amount: totalAmount,
        status: "Pending",
        payment_status: "Pending",
      })
      .select("id, total_amount, status, payment_status")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to create your order.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // 7. Attach order ID to every order item
    // ---------------------------------------------

    const itemsToInsert = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);

      // Remove the order if its items couldn't be created
      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to save your order items.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // 8. Return the created order
    // ---------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Order created successfully.",
      order: {
        id: order.id,
        totalAmount: Number(order.total_amount),
        status: order.status,
        paymentStatus: order.payment_status,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your order.",
      },
      { status: 500 }
    );
  }
}