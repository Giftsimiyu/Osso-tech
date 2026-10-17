import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../backend/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, message: "Enter valid order details." },
      400,
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse(
      { success: false, message: "Enter valid order details." },
      400,
    );
  }

  const values = body as Record<string, unknown>;
  const customerName =
    typeof values.customerName === "string" ? values.customerName.trim() : "";
  const rawPhone = typeof values.phone === "string" ? values.phone.trim() : "";
  const phone = normalizePhone(rawPhone);
  const email = typeof values.email === "string" ? values.email.trim() : "";
  const deliveryAddress =
    typeof values.deliveryAddress === "string"
      ? values.deliveryAddress.trim()
      : "";
  const paymentMethod = values.paymentMethod;

  if (
    customerName.length < 2 ||
    customerName.length > 100 ||
    !/^254[17]\d{8}$/.test(phone) ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    deliveryAddress.length < 5 ||
    deliveryAddress.length > 500
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Enter a valid name, Kenyan phone number, email address, and delivery address.",
      },
      400,
    );
  }

  if (paymentMethod !== "mpesa" && paymentMethod !== "arrival") {
    return jsonResponse(
      { success: false, message: "Choose M-Pesa or pay on delivery." },
      400,
    );
  }

  if (
    !Array.isArray(values.items) ||
    values.items.length === 0 ||
    values.items.length > 50
  ) {
    return jsonResponse(
      { success: false, message: "Your cart must contain between 1 and 50 items." },
      400,
    );
  }

  const quantities = new Map<string, number>();
  for (const rawItem of values.items) {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) {
      return jsonResponse(
        { success: false, message: "One or more cart items are invalid." },
        400,
      );
    }
    const item = rawItem as Record<string, unknown>;
    const variantId =
      typeof item.variantId === "string" ? item.variantId : "";
    const quantity = item.quantity;
    if (
      !UUID_PATTERN.test(variantId) ||
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      return jsonResponse(
        { success: false, message: "One or more cart items are invalid." },
        400,
      );
    }

    const combinedQuantity = (quantities.get(variantId) ?? 0) + quantity;
    if (!Number.isSafeInteger(combinedQuantity)) {
      return jsonResponse(
        { success: false, message: "A product quantity is too large." },
        400,
      );
    }
    quantities.set(variantId, combinedQuantity);
  }

  try {
    const supabase = createAdminClient();
    const variantIds = [...quantities.keys()];
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, sku, variant_name, price, product_id")
      .in("id", variantIds);

    if (variantsError) {
      console.error("Variant lookup error:", variantsError);
      return jsonResponse(
        { success: false, message: "Unable to verify your cart items." },
        500,
      );
    }
    if (!variants || variants.length !== variantIds.length) {
      return jsonResponse(
        {
          success: false,
          message: "One or more products in your cart are no longer available.",
        },
        400,
      );
    }

    const productIds = [...new Set(variants.map((variant) => variant.product_id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    if (productsError) {
      console.error("Product lookup error:", productsError);
      return jsonResponse(
        { success: false, message: "Unable to verify product information." },
        500,
      );
    }

    const orderItems = [];
    let totalAmount = 0;
    for (const variant of variants) {
      const product = products?.find((entry) => entry.id === variant.product_id);
      if (!product) {
        return jsonResponse(
          { success: false, message: "A product in your cart could not be found." },
          400,
        );
      }

      const price = Number(variant.price);
      const quantity = quantities.get(variant.id)!;
      const lineTotal = price * quantity;
      if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(lineTotal)) {
        console.error("Invalid product pricing in order:", variant.id);
        return jsonResponse(
          { success: false, message: "A product price could not be verified." },
          500,
        );
      }

      totalAmount += lineTotal;
      orderItems.push({
        variant_id: variant.id,
        variant_name: variant.variant_name,
        product_name: product.name,
        quantity,
        price,
      });
    }

    if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
      return jsonResponse(
        { success: false, message: "The order total is invalid." },
        400,
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        phone,
        email: email.toLowerCase(),
        delivery_address: deliveryAddress,
        total_amount: totalAmount,
        status: "Pending",
        payment_status:
          paymentMethod === "arrival" ? "Pay on delivery" : "Pending",
      })
      .select("id, total_amount, status, payment_status")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return jsonResponse(
        { success: false, message: "Unable to create your order." },
        500,
      );
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      orderItems.map((item) => ({ ...item, order_id: order.id })),
    );

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      const { error: cleanupError } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);
      if (cleanupError) {
        console.error("Incomplete order cleanup error:", cleanupError);
      }
      return jsonResponse(
        { success: false, message: "Unable to save your order items." },
        500,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: "Order created successfully.",
        order: {
          id: order.id,
          totalAmount: Number(order.total_amount),
          status: order.status,
          paymentStatus: order.payment_status,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Create order error:", error);
    return jsonResponse(
      { success: false, message: "Something went wrong while creating your order." },
      500,
    );
  }
}
