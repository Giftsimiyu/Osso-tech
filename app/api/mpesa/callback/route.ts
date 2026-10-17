import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "../../../../backend/lib/supabase/admin";

const supabase = createAdminClient();

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

function hasValidCallbackToken(request: NextRequest) {
  const expectedToken = process.env.MPESA_CALLBACK_TOKEN;
  const receivedToken = request.nextUrl.searchParams.get("token");
  if (!expectedToken || !receivedToken) return false;

  const expected = Buffer.from(expectedToken);
  const received = Buffer.from(receivedToken);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

async function sendPaymentReceipt(orderId: string, mpesaReceipt?: string) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, customer_name, email, total_amount, created_at, receipt_email_status",
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Receipt order lookup error:", orderError);
    return;
  }

  if (order.receipt_email_status === "sent") return;

  if (!order.email) {
    const { error } = await supabase
      .from("orders")
      .update({ receipt_email_status: "skipped" })
      .eq("id", orderId);
    if (error) console.error("Receipt status update error:", error);
    console.error(`No email address is available for order ${orderId}.`);
    return;
  }

  const now = new Date();
  const staleSendingCutoff = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  let claimed = false;

  for (const status of ["pending", "failed"]) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        receipt_email_status: "sending",
        updated_at: now.toISOString(),
      })
      .eq("id", orderId)
      .eq("receipt_email_status", status)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Receipt send claim error:", error);
      return;
    }
    if (data) {
      claimed = true;
      break;
    }
  }

  if (!claimed) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        receipt_email_status: "sending",
        updated_at: now.toISOString(),
      })
      .eq("id", orderId)
      .eq("receipt_email_status", "sending")
      .lt("updated_at", staleSendingCutoff)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Stale receipt claim error:", error);
      return;
    }
    claimed = Boolean(data);
  }

  if (!claimed) return;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RECEIPT_FROM_EMAIL;

  if (!apiKey || !from) {
    console.error(
      "Receipt email is not configured. Set RESEND_API_KEY and RECEIPT_FROM_EMAIL."
    );
    const { error } = await supabase
      .from("orders")
      .update({ receipt_email_status: "failed" })
      .eq("id", orderId);
    if (error) console.error("Receipt status update error:", error);
    return;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, variant_name, quantity, price")
    .eq("order_id", orderId);

  if (itemsError || !items) {
    console.error("Receipt item lookup error:", itemsError);
    const { error } = await supabase
      .from("orders")
      .update({ receipt_email_status: "failed" })
      .eq("id", orderId);
    if (error) console.error("Receipt status update error:", error);
    return;
  }

  const currency = new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  });
  const rows = items
    .map((item) => {
      const productName = escapeHtml(String(item.product_name));
      const variantName = escapeHtml(String(item.variant_name ?? ""));
      const description = variantName
        ? `${productName} (${variantName})`
        : productName;
      const quantity = Number(item.quantity);
      const lineTotal = Number(item.price) * quantity;
      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #E2E8F0;color:#17151D;font-size:14px;line-height:1.5">${description}</td>
          <td align="center" style="padding:12px 8px;border-bottom:1px solid #E2E8F0;color:#64748B;font-size:14px">${quantity}</td>
          <td align="right" style="padding:12px 8px;border-bottom:1px solid #E2E8F0;color:#17151D;font-size:14px;font-weight:600;white-space:nowrap">KSh ${currency.format(lineTotal)}</td>
        </tr>`;
    })
    .join("");
  const receiptNumber = mpesaReceipt
    ? escapeHtml(mpesaReceipt)
    : "Confirmed by M-Pesa";
  const orderNumber = `OSSO-${order.id.slice(0, 8).toUpperCase()}`;
  const orderDate = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "long",
    timeZone: "Africa/Nairobi",
  }).format(new Date(order.created_at));
  const amount = currency.format(Number(order.total_amount));
  const customerName = escapeHtml(String(order.customer_name));
  const storeUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const storeLink = storeUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px"><tr><td align="center" bgcolor="#6F3DD0" style="border-radius:999px"><a href="${escapeHtml(storeUrl)}" style="display:inline-block;padding:14px 24px;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;border-radius:999px">Continue shopping</a></td></tr></table>`
    : "";
  const plainTextItems = items
    .map((item) => {
      const variant = item.variant_name ? ` (${item.variant_name})` : "";
      return `- ${item.product_name}${variant} x${item.quantity}: KSh ${currency.format(Number(item.price) * Number(item.quantity))}`;
    })
    .join("\n");
  const plainText = [
    `Payment confirmed for order ${orderNumber}`,
    `Order date: ${orderDate}`,
    `Hello ${order.customer_name},`,
    "Thank you for your order. Your M-Pesa payment has been received.",
    "",
    "Order summary:",
    plainTextItems,
    "",
    `Total paid: KSh ${amount}`,
    `M-Pesa receipt: ${mpesaReceipt ?? "Confirmed by M-Pesa"}`,
    "",
    "Your order is now being prepared.",
    "Osso Tech — Good tech, chosen well.",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        from,
        to: [order.email],
        subject: `Your Osso Tech payment receipt · ${orderNumber}`,
        text: plainText,
        html: `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <meta name="x-apple-disable-message-reformatting">
              <title>Your Osso Tech receipt</title>
            </head>
            <body style="margin:0;padding:0;background-color:#FAF9F7;font-family:Arial,Helvetica,sans-serif;color:#17151D">
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">Your M-Pesa payment is confirmed. Here is your Osso Tech order receipt.</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FAF9F7">
                <tr>
                  <td align="center" style="padding:32px 12px">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:100%">
                      <tr>
                        <td style="padding:0 0 18px">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="font-size:20px;font-weight:700;letter-spacing:-0.4px;color:#17151D">Osso <span style="color:#6F3DD0">Tech</span></td>
                              <td align="right" style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#64748B">TECH, CHOSEN WELL</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:36px;background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px">
                          <span style="display:inline-block;padding:7px 12px;background-color:#E1F2EC;border-radius:999px;color:#18794E;font-size:12px;font-weight:700">PAYMENT CONFIRMED</span>
                          <h1 style="margin:20px 0 10px;font-size:28px;line-height:1.25;letter-spacing:-0.6px;color:#17151D">Thanks for your order, ${customerName}</h1>
                          <p style="margin:0;color:#64748B;font-size:15px;line-height:1.7">Your M-Pesa payment has been received. We’re preparing your order and will keep you updated as it progresses.</p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;background-color:#F8F9FF;border:1px solid #E4EBFB;border-radius:14px">
                            <tr>
                              <td style="padding:16px 18px">
                                <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#64748B">ORDER NUMBER</div>
                                <div style="margin-top:6px;font-size:15px;font-weight:700;color:#17151D">${orderNumber}</div>
                              </td>
                              <td align="right" style="padding:16px 18px">
                                <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#64748B">ORDER DATE</div>
                                <div style="margin-top:6px;font-size:15px;font-weight:700;color:#17151D">${orderDate}</div>
                              </td>
                            </tr>
                          </table>
                          <h2 style="margin:28px 0 12px;font-size:17px;color:#17151D">Order summary</h2>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse">
                            <thead>
                              <tr>
                                <th align="left" style="padding:11px 8px;border-bottom:2px solid #E2E8F0;color:#64748B;font-size:11px;letter-spacing:0.7px;text-transform:uppercase">Item</th>
                                <th align="center" style="padding:11px 8px;border-bottom:2px solid #E2E8F0;color:#64748B;font-size:11px;letter-spacing:0.7px;text-transform:uppercase">Qty</th>
                                <th align="right" style="padding:11px 8px;border-bottom:2px solid #E2E8F0;color:#64748B;font-size:11px;letter-spacing:0.7px;text-transform:uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                          </table>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px">
                            <tr>
                              <td style="padding:16px 8px;font-size:15px;font-weight:700;color:#17151D">Total paid</td>
                              <td align="right" style="padding:16px 8px;font-size:21px;font-weight:700;color:#6F3DD0;white-space:nowrap">KSh ${amount}</td>
                            </tr>
                          </table>
                          <div style="margin-top:10px;padding:15px 16px;background-color:#FAF9F7;border-radius:12px">
                            <div style="font-size:11px;font-weight:700;letter-spacing:0.8px;color:#64748B">M-PESA RECEIPT</div>
                            <div style="margin-top:6px;font-size:15px;font-weight:700;letter-spacing:0.5px;color:#17151D">${receiptNumber}</div>
                          </div>
                          <div style="margin-top:22px;padding:16px;border-left:4px solid #6F3DD0;background-color:#F8F5FF;border-radius:8px">
                            <p style="margin:0;color:#4B3A70;font-size:13px;line-height:1.7">Keep this email as your payment receipt. If you need help with your order, reply to this email and our team will be happy to assist.</p>
                          </div>
                          ${storeLink}
                          <p style="margin:28px 0 0;color:#64748B;font-size:13px;line-height:1.7">Thank you for choosing Osso Tech.<br><strong style="color:#17151D">Good tech, chosen well.</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:20px 12px 0;color:#94A3B8;font-size:11px;line-height:1.6">This receipt confirms payment for your Osso Tech order.<br>&copy; ${new Date(order.created_at).getFullYear()} Osso Tech</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      console.error("Resend receipt request failed:", response.status);
      const { error } = await supabase
        .from("orders")
        .update({ receipt_email_status: "failed" })
        .eq("id", orderId);
      if (error) console.error("Receipt status update error:", error);
      return;
    }

    const { error: sentUpdateError } = await supabase
      .from("orders")
      .update({
        receipt_email_status: "sent",
        receipt_sent_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (sentUpdateError) {
      console.error("Failed to save receipt delivery status:", sentUpdateError);
      return;
    }

    console.log(`Payment receipt sent for order ${orderId}.`);
  } catch (error) {
    console.error("Receipt email request error:", error);
    const { error: statusError } = await supabase
      .from("orders")
      .update({ receipt_email_status: "failed" })
      .eq("id", orderId);
    if (statusError) console.error("Receipt status update error:", statusError);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasValidCallbackToken(request)) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Unauthorized callback" },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid callback payload" },
        { status: 400 },
      );
    }
    const bodyValues =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : null;
    const callbackBody =
      bodyValues?.Body &&
      typeof bodyValues.Body === "object" &&
      !Array.isArray(bodyValues.Body)
        ? (bodyValues.Body as Record<string, unknown>)
        : null;
    const callback = callbackBody?.stkCallback;

    if (!callback || typeof callback !== "object" || Array.isArray(callback)) {
      return NextResponse.json(
        {
          ResultCode: 1,
          ResultDesc: "Invalid callback payload",
        },
        { status: 400 }
      );
    }

    const callbackValues = callback as Record<string, unknown>;
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callbackValues;
    const resultCode =
      typeof ResultCode === "number" || typeof ResultCode === "string"
        ? Number(ResultCode)
        : Number.NaN;

    if (
      typeof MerchantRequestID !== "string" ||
      !MerchantRequestID ||
      typeof CheckoutRequestID !== "string" ||
      !CheckoutRequestID ||
      !Number.isSafeInteger(resultCode)
    ) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid callback identifiers" },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Find the order using CheckoutRequestID
    // --------------------------------------------------

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, phone, total_amount, payment_status, status, merchant_request_id, checkout_request_id"
      )
      .eq("checkout_request_id", CheckoutRequestID)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);

      return NextResponse.json({
        ResultCode: 1,
        ResultDesc: "Unknown payment request",
      });
    }

    if (
      order.checkout_request_id !== CheckoutRequestID ||
      order.merchant_request_id !== MerchantRequestID
    ) {
      console.error(`M-Pesa request identifier mismatch for order ${order.id}.`);
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Payment request mismatch" },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Prevent duplicate processing
    // --------------------------------------------------

    if (
      ["paid", "completed"].includes(String(order.payment_status).toLowerCase())
    ) {
      await sendPaymentReceipt(order.id);
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Order already processed",
      });
    }

    // --------------------------------------------------
    // Payment failed / cancelled
    // --------------------------------------------------

    if (resultCode !== 0) {
      const { error: failedUpdateError } = await supabase
        .from("orders")
        .update({
          payment_status: "Failed",
          status: "Cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .neq("payment_status", "Paid")
        .neq("payment_status", "Completed");

      if (failedUpdateError) {
        console.error("M-Pesa failure status update error:", failedUpdateError);
        return NextResponse.json(
          { ResultCode: 1, ResultDesc: "Unable to save payment result" },
          { status: 500 },
        );
      }

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

    const metadataValues =
      CallbackMetadata &&
      typeof CallbackMetadata === "object" &&
      !Array.isArray(CallbackMetadata)
        ? (CallbackMetadata as Record<string, unknown>)
        : null;
    const metadataItems = Array.isArray(metadataValues?.Item)
      ? metadataValues.Item
      : [];

    const getMetadataValue = (name: string) => {
      const item = metadataItems.find(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          !Array.isArray(entry) &&
          (entry as Record<string, unknown>).Name === name,
      );
      return item && typeof item === "object"
        ? (item as Record<string, unknown>).Value
        : undefined;
    };

    const amount = Number(getMetadataValue("Amount"));
    const mpesaReceipt = getMetadataValue("MpesaReceiptNumber");
    const transactionDate = getMetadataValue("TransactionDate");
    const phoneNumber = getMetadataValue("PhoneNumber");

    // --------------------------------------------------
    // Verify the amount
    // --------------------------------------------------

    if (
      !Number.isFinite(amount) ||
      amount !== Number(order.total_amount) ||
      typeof mpesaReceipt !== "string" ||
      !/^[A-Z0-9]{8,20}$/i.test(mpesaReceipt) ||
      !/^\d{14}$/.test(String(transactionDate ?? "")) ||
      !/^\d{12}$/.test(String(phoneNumber ?? "")) ||
      normalizePhone(String(phoneNumber)) !== normalizePhone(order.phone)
    ) {
      console.error(
        `M-Pesa payment details failed validation for order ${order.id}.`,
      );
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Payment details failed validation" },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Mark payment as completed
    // --------------------------------------------------

    const { error: completionError } = await supabase.rpc(
      "complete_mpesa_order",
      {
        p_order_id: order.id,
        p_amount: amount,
        p_mpesa_receipt: mpesaReceipt,
      },
    );

    if (completionError) {
      console.error("Failed to complete paid order:", completionError);
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Unable to process callback" },
        { status: 500 },
      );
    }

    await sendPaymentReceipt(
      order.id,
      mpesaReceipt ? String(mpesaReceipt) : undefined,
    );

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