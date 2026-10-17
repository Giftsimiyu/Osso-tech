import OrderConfirmation from "./order-confirmation";

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const { orderId } = await searchParams;
  const safeOrderId = Array.isArray(orderId) ? orderId[0] : orderId;

  return <OrderConfirmation orderId={safeOrderId ?? ""} />;
}
