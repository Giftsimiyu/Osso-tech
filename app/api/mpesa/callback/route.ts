import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("M-Pesa callback received:", JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json(
        {
          ResultCode: 1,
          ResultDesc: "Invalid callback payload",
        },
        { status: 400 }
      );
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callback;

    // --------------------------------------------------
    // Find the order using CheckoutRequestID
    // --------------------------------------------------

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, total_amount, payment_status, status"
      )
      .eq("checkout_request_id", CheckoutRequestID)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);

      // Safaricom should still receive a valid response
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Callback received",
      });
    }

    // --------------------------------------------------
    // Prevent duplicate processing
    // --------------------------------------------------

    if (order.payment_status === "Paid") {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Order already processed",
      });
    }

    // --------------------------------------------------
    // Payment failed / cancelled
    // --------------------------------------------------

    if (Number(ResultCode) !== 0) {
      await supabase
        .from("orders")
        .update({
          payment_status: "Failed",
          status: "Cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      console.log(
        `M-Pesa payment failed for order ${order.id}: ${ResultDesc}`
      );

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Callback received",
      });
    }

    // --------------------------------------------------
    // Extract successful payment metadata
    // --------------------------------------------------

    const metadataItems = CallbackMetadata?.Item ?? [];

    const getMetadataValue = (name: string) => {
      const item = metadataItems.find(
        (item: { Name: string; Value?: unknown }) =>
          item.Name === name
      );

      return item?.Value;
    };

    const amount = Number(getMetadataValue("Amount"));
    const mpesaReceipt = getMetadataValue("MpesaReceiptNumber");
    const transactionDate = getMetadataValue("TransactionDate");
    const phoneNumber = getMetadataValue("PhoneNumber");

    // --------------------------------------------------
    // Verify the amount
    // --------------------------------------------------

    if (amount !== Number(order.total_amount)) {
      console.error(
        `Payment amount mismatch for order ${order.id}. ` +
        `Expected ${order.total_amount}, received ${amount}`
      );

      await supabase
        .from("orders")
        .update({
          payment_status: "Failed",
          status: "Cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Callback received",
      });
    }

    // --------------------------------------------------
    // Mark payment as completed
    // --------------------------------------------------

    const { error: completionError } = await supabase.rpc(
  "complete_mpesa_order",
  {
    p_order_id: order.id,
    p_amount: amount,
    p_mpesa_receipt: mpesaReceipt
      ? String(mpesaReceipt)
      : null,
  }
);

if (completionError) {
  console.error(
    "Failed to complete paid order:",
    completionError
  );

  return NextResponse.json(
    {
      ResultCode: 1,
      ResultDesc: "Unable to process callback",
    },
    { status: 500 }
  );
}

    console.log("Payment completed:", {
      orderId: order.id,
      mpesaReceipt,
      amount,
      transactionDate,
      phoneNumber,
      MerchantRequestID,
      CheckoutRequestID,
    });

    // --------------------------------------------------
    // Tell Safaricom the callback was received
    // --------------------------------------------------

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    });
  } catch (error) {
    console.error("M-Pesa callback error:", error);

    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Callback processing failed",
      },
      { status: 500 }
    );
  }
}