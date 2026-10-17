This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Product reviews and payment receipts

Apply `supabase/migrations/20261015140000_product_reviews_and_receipts.sql`
to the Supabase project using the Supabase SQL Editor or Supabase CLI before
deploying the product-review form or payment receipt changes. Reviews can be
submitted once per product per completed M-Pesa order, using the order ID and
checkout email.

Payment receipts are sent through Resend after a successful M-Pesa callback.
Configure `RESEND_API_KEY` and `RECEIPT_FROM_EMAIL` in the server environment;
the sender address must be verified with Resend. Checkout requires an email
address so a receipt can be delivered.

## Admin order management

Apply `supabase/migrations/20261015190000_secure_order_data.sql` after the
reviews/receipts migration. It enables row-level security on order data and
removes direct `anon` and `authenticated` access. The order API uses the
server-only `SUPABASE_SERVICE_ROLE_KEY`; never prefix this secret with
`NEXT_PUBLIC_` or expose it to browser code.

The storefront intentionally does not fetch or enforce inventory quantities:
products remain purchasable regardless of the stock quantity stored in
Supabase, per the current store behavior.

Create administrator accounts in Supabase Auth (there is no public admin
signup). In the Supabase dashboard, set the trusted user's **App Metadata**
to include `"role": "admin"`. Admins can then sign in at `/admin/login` and
manage customer details, payment status visibility, and fulfilment status at
`/admin/orders`. Order status changes do not modify payment status.

## M-Pesa callback protection

Set `MPESA_CALLBACK_URL` to the public HTTPS URL for
`/api/mpesa/callback`, and set `MPESA_CALLBACK_TOKEN` to a long, random,
server-only secret. The STK request appends that token to the callback URL.
The callback rejects requests without the token and checks the stored Daraja
request IDs, expected amount, and payer phone before completing an order.
Update both environment variables when rotating the callback token.
