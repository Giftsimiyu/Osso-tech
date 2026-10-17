"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  delivery_address: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  mpesa_receipt: string | null;
  merchant_request_id: string | null;
  checkout_request_id: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateOrderStatus(
    orderId: string,
    newStatus: string
  ) {
    try {
      setUpdatingOrder(orderId);

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update order."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((current) =>
          current
            ? {
                ...current,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update order."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchTerm = search.toLowerCase();

    return (
      order.customer_name
        ?.toLowerCase()
        .includes(searchTerm) ||
      order.phone
        ?.toLowerCase()
        .includes(searchTerm) ||
      order.id
        ?.toLowerCase()
        .includes(searchTerm) ||
      order.mpesa_receipt
        ?.toLowerCase()
        .includes(searchTerm)
    );
  });

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function getPaymentClass(paymentStatus: string) {
    switch (paymentStatus) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Failed":
        return "bg-red-100 text-red-700";

      case "Refunded":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Shipped":
        return "bg-blue-100 text-blue-700";

      case "Processing":
        return "bg-orange-100 text-orange-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Osso Tech
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Orders
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer orders and payment status.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Orders"}
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by customer, phone, order ID or M-Pesa receipt..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-sm text-gray-500">
              Loading orders...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredOrders.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "Customer orders will appear here."}
            </p>
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && filteredOrders.length > 0 && (
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {order.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {order.phone}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatAmount(order.total_amount)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentClass(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          disabled={
                            updatingOrder === order.id
                          }
                          onChange={(event) =>
                            updateOrderStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {orderStatuses.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                          className="text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MOBILE ORDERS */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4 md:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-gray-500">
                      #{order.id.slice(0, 8)}
                    </p>

                    <h2 className="mt-1 font-semibold text-gray-900">
                      {order.customer_name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {order.phone}
                    </p>
                  </div>

                  <p className="font-semibold text-gray-900">
                    {formatAmount(order.total_amount)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentClass(
                      order.payment_status
                    )}`}
                  >
                    {order.payment_status}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-4">
                  <select
                    value={order.status}
                    disabled={
                      updatingOrder === order.id
                    }
                    onChange={(event) =>
                      updateOrderStatus(
                        order.id,
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {orderStatuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                  className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
              <div>
                <p className="font-mono text-xs text-gray-500">
                  #{selectedOrder.id}
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Order Details
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 p-6">

              {/* CUSTOMER */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </h3>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">
                    {selectedOrder.customer_name}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {selectedOrder.phone}
                  </p>

                  {selectedOrder.email && (
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedOrder.email}
                    </p>
                  )}

                  {selectedOrder.delivery_address && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Delivery Address
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrder.delivery_address}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ORDER ITEMS */}
<section>
  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
    Items Ordered
  </h3>

  <div className="overflow-hidden rounded-lg border border-gray-200">
    {selectedOrder.items.length === 0 ? (
      <div className="p-4 text-sm text-gray-500">
        No order items found.
      </div>
    ) : (
      <div className="divide-y divide-gray-200">
        {selectedOrder.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900">
                {item.product_name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Quantity: {item.quantity}
              </p>

              <p className="text-sm text-gray-500">
                Unit price: {formatAmount(item.price)}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-semibold text-gray-900">
                {formatAmount(item.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
    <span className="font-medium text-gray-600">
      Order Total
    </span>

    <span className="font-bold text-gray-900">
      {formatAmount(selectedOrder.total_amount)}
    </span>
  </div>
</section>

              {/* PAYMENT */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Payment
                </h3>

                <div className="grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Amount
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {formatAmount(
                        selectedOrder.total_amount
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Payment Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentClass(
                        selectedOrder.payment_status
                      )}`}
                    >
                      {selectedOrder.payment_status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      M-Pesa Receipt
                    </p>

                    <p className="mt-1 font-mono text-sm text-gray-900">
                      {selectedOrder.mpesa_receipt ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Order Status
                    </p>

                    <select
                      value={selectedOrder.status}
                      disabled={
                        updatingOrder ===
                        selectedOrder.id
                      }
                      onChange={(event) =>
                        updateOrderStatus(
                          selectedOrder.id,
                          event.target.value
                        )
                      }
                      className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      {orderStatuses.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* DARaja INFORMATION */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  M-Pesa Transaction
                </h3>

                <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Merchant Request ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-gray-700">
                      {selectedOrder.merchant_request_id ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Checkout Request ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-gray-700">
                      {selectedOrder.checkout_request_id ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </section>

              {/* DATES */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Order Timeline
                </h3>

                <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Created
                    </span>

                    <span className="text-right text-gray-900">
                      {formatDate(
                        selectedOrder.created_at
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Last Updated
                    </span>

                    <span className="text-right text-gray-900">
                      {formatDate(
                        selectedOrder.updated_at
                      )}
                    </span>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}