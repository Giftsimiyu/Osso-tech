import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../backend/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function normalizePhone(phone: string) {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  }

  if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  }

  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Enter a valid order ID." },
        { status: 400 }
      );
    }
    const values =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : null;
    const requestedOrderId = values?.orderId;
    const orderId =
      typeof requestedOrderId === "string" ? requestedOrderId : "";

    if (!UUID_PATTERN.test(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid order ID is required.",
        },
        { status: 400 }
      );
    }
    const supabase = createAdminClient();

    // --------------------------------------------------
    // 1. Get the order from Supabase
    // --------------------------------------------------

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        phone,
        total_amount,
        payment_status,
        checkout_request_id
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order lookup error:", orderError);

      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (
      !Number.isSafeInteger(Number(order.total_amount)) ||
      Number(order.total_amount) <= 0
    ) {
      console.error(`Invalid M-Pesa order total for order ${orderId}.`);
      return NextResponse.json(
        { success: false, message: "The order total is invalid." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2. Make sure the order hasn't already been paid
    // --------------------------------------------------

    const paymentStatus = String(order.payment_status).toLowerCase();
    if (paymentStatus === "paid" || paymentStatus === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "This order has already been paid.",
        },
        { status: 400 }
      );
    }

    if (paymentStatus === "pay on delivery") {
      return NextResponse.json(
        {
          success: false,
          message: "This order is set to be paid on delivery.",
        },
        { status: 400 }
      );
    }

    if (
      paymentStatus === "pending" &&
      order.checkout_request_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A payment request is already active for this order.",
        },
        { status: 409 }
      );
    }

    const callbackToken = process.env.MPESA_CALLBACK_TOKEN;
    const configuredCallbackUrl = process.env.MPESA_CALLBACK_URL;
    if (!callbackToken || !configuredCallbackUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "M-Pesa callback security is not configured. Set MPESA_CALLBACK_URL and MPESA_CALLBACK_TOKEN.",
        },
        { status: 500 }
      );
    }

    let callbackUrl: URL;
    try {
      callbackUrl = new URL(configuredCallbackUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "M-Pesa callback URL is invalid." },
        { status: 500 }
      );
    }
    if (
      callbackUrl.protocol !== "https:" ||
      callbackUrl.username ||
      callbackUrl.password
    ) {
      return NextResponse.json(
        { success: false, message: "M-Pesa callback URL must use HTTPS." },
        { status: 500 }
      );
    }
    callbackUrl.searchParams.set("token", callbackToken);

    // --------------------------------------------------
    // 3. Get M-Pesa credentials
    // --------------------------------------------------

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const partyB = process.env.MPESA_PARTY_B;

    if (
      !consumerKey ||
      !consumerSecret ||
      !shortcode ||
      !passkey ||
      !partyB
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "M-Pesa environment variables are not configured.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 4. Normalize the customer's phone number
    // --------------------------------------------------

    const customerPhone = normalizePhone(order.phone);

    if (!/^254[17]\d{8}$/.test(customerPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "The order contains an invalid Kenyan M-Pesa phone number.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Generate OAuth access token
    // --------------------------------------------------

    const credentials = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const authResponse = await fetch(
  "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        signal: AbortSignal.timeout(15_000),
      }
    );

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.access_token) {
      console.error("M-Pesa authentication failed:", authData);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to authenticate with M-Pesa.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 6. Generate password
    // --------------------------------------------------

    const timestamp = getTimestamp();

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString("base64");

    // --------------------------------------------------
    // 7. Callback URL
    // --------------------------------------------------

    // --------------------------------------------------
    // 8. Send STK Push
    // --------------------------------------------------

    const stkResponse = await fetch(
  "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          BusinessShortCode: Number(shortcode),
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(Number(order.total_amount)),
          PartyA: customerPhone,
          PartyB: Number(partyB),
          PhoneNumber: customerPhone,
          CallBackURL: callbackUrl.toString(),

          // Maximum 12 characters
          AccountReference: `ORD${String(orderId).slice(0, 9)}`,

          // Maximum 13 characters
          TransactionDesc: "Gadget Store",
        }),
      }
    );

    const stkData = await stkResponse.json();

    console.log("M-Pesa STK response:", stkData);

    if (!stkResponse.ok || stkData.ResponseCode !== "0") {
      return NextResponse.json(
        {
          success: false,
          message:
            stkData.errorMessage ||
            stkData.ResponseDescription ||
            "M-Pesa STK Push failed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 9. Save Daraja request IDs against the order
    // --------------------------------------------------

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        merchant_request_id: stkData.MerchantRequestID,
        checkout_request_id: stkData.CheckoutRequestID,
        status: "Pending",
        payment_status: "Pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error(
        "Failed to save M-Pesa request IDs:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          message: "M-Pesa request was sent, but the order could not be updated.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 10. Return success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "M-Pesa payment request sent.",
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
      customerMessage: stkData.CustomerMessage,
    });
  } catch (error) {
    console.error("STK Push error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while processing the M-Pesa request.",
      },
      { status: 500 }
    );
  }
}