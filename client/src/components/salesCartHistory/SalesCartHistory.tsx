"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Notification } from "../toastNotification/Notification";

interface SaleProduct {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  selling_price: number;
  cost_price: number;
  brand: string;
  size: string;
  type: string;
  _id: string;
}

interface Sale {
  _id: string;
  products: SaleProduct[];
  total_price: number;
  final_discount: number;
  payment_method: string;
  customer_mobile: string;
  bill_generated: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function SalesCartHistory() {
  const { saleId } = useParams<{ saleId: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [showBillModal, setShowBillModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/sales/${saleId}`);
        const data = await response.json();

        if (data.status === 200) {
          const saleData = data.data;
          setSale(saleData);
          setCustomerMobile(saleData.customer_mobile);
        } else {
          setError("Failed to fetch sale details");
        }
      } catch (error) {
        console.error("Error fetching sale:", error);
        setError("An error occurred while fetching sale details");
      } finally {
        setLoading(false);
      }
    };

    if (saleId) {
      fetchSale();
    }
  }, [saleId]);

  // Function to generate WhatsApp message and URL
  const generateWhatsAppUrl = () => {
    if (!sale) return "#";

    // Build the bill message
    let message = `Lotus World\n`;
    message += `🧾 *Your Bill*\n`;
    message += `----------------------\n`;

    sale.products.forEach((product, index) => {
      message += `Brand: ${product.brand}\n`;
      message += `Type: ${product.type}\n`;
      message += `Size: ${product.size}\n`;
      message += `Qty: ${product.quantity}\n`;
      message += `Unit Price: ₹${product.unit_price.toFixed(2)}\n`;
      if (product.discount > 0) {
        message += `Discount: ₹${product.discount.toFixed(2)}\n`;
      }
      message += `Amount: ₹${product.selling_price.toFixed(2)}\n`;
      if (index < sale.products.length - 1) {
        message += `---\n`;
      }
    });

    message += `----------------------\n`;
    message += `Total Discount: ₹${sale.final_discount.toFixed(2)}\n`;
    message += `Final Amount: ₹${sale.total_price.toFixed(2)}\n`;
    message += `Payment Method: ${sale.payment_method}\n`;
    message += `----------------------\n`;
    message += `Thank you for shopping with us!\n`;
    message += `Sale ID: ${sale._id}`;

    // Encode the message
    const encoded = encodeURIComponent(message);

    // Build WhatsApp URL (add country code 91 for India)
    const phone = `91${customerMobile}`;
    const url = `https://wa.me/${phone}?text=${encoded}`;

    return url;
  };

  const generateBill = async () => {
    if (!sale) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/sales/bill/${sale._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customer_mobile: customerMobile }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        setNotification({
          message: "Bill generated successfully",
          type: "success",
        });

        // Update the sale state
        setSale((prev) =>
          prev
            ? { ...prev, bill_generated: true, customer_mobile: customerMobile }
            : null
        );

        // Show success modal with WhatsApp option
        setShowSuccessModal(true);
        setShowBillModal(false);

        // Automatically open WhatsApp with the bill
        setTimeout(() => {
          const whatsappUrl = generateWhatsAppUrl();
          window.open(whatsappUrl, "_blank");
        }, 500);
      } else {
        throw new Error(data.message || "Failed to generate bill");
      }
    } catch (error) {
      console.error("Error generating bill:", error);
      setNotification({
        message: "Failed to generate bill",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || "Sale not found"}
      </div>
    );
  }

  const formattedDate = new Date(sale.createdAt).toLocaleString();

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Generate Bill
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Enter the customer's mobile number to generate and send the bill
              on WhatsApp:
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Customer Mobile Number:
              </label>
              <input
                type="tel"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBillModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={generateBill}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Generate & Send on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              🎉 Bill Generated Successfully!
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              The bill has been generated and sent on WhatsApp.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                👁️ View Bill Details
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 lg:text-lg">
              Sale Details
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                <span className="font-medium">ID:</span> {sale._id.slice(-8)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                <span className="font-medium">Date:</span> {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!sale.bill_generated && (
              <button
                onClick={() => setShowBillModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium active:scale-95 transition-transform"
              >
                <span>📄</span>
                <span>Generate Bill</span>
              </button>
            )}
            {sale.bill_generated && sale.customer_mobile && (
              <button
                onClick={() => {
                  const whatsappUrl = generateWhatsAppUrl();
                  window.open(whatsappUrl, "_blank");
                  setNotification({
                    message: "Bill sent on WhatsApp again",
                    type: "success",
                  });
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium active:scale-95 transition-transform"
              >
                <span>📱</span>
                <span>Send Again</span>
              </button>
            )}
            <button
              onClick={() => window.history.back()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium active:scale-95 transition-transform"
            >
              Back
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="flex flex-col gap-3 lg:hidden mb-6">
          {sale.products.map((product) => (
            <div
              key={product._id}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {product.brand}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {product.type} • Size {product.size}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                  Qty: {product.quantity}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Unit Price
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{product.unit_price.toFixed(2)}
                  </span>
                </div>
                {product.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Discount
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      -₹{product.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      Total Amount
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ₹{product.selling_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="table-auto w-full">
              {/* Table Header */}
              <thead className="border-gray-100 dark:border-gray-800 border-y">
                <tr>
                  <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                    Brand
                  </th>
                  <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                    Size
                  </th>
                  <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                    Type
                  </th>
                  <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                    Quantity
                  </th>
                  <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                    Unit Price
                  </th>
                  <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                    Discount
                  </th>
                  <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                    Amount
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sale.products.map((product) => (
                  <tr key={product._id}>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      {product.brand}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      {product.size}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      {product.type}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      {product.quantity}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      ₹{product.unit_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      ₹{product.discount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      ₹{product.selling_price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Payment Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total Discount
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                -₹{sale.final_discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Payment Method
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {sale.payment_method}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Bill Status
              </span>
              <span
                className={`font-medium px-2 py-0.5 rounded-md text-xs ${
                  sale.bill_generated
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                }`}
              >
                {sale.bill_generated ? "Generated" : "Not Generated"}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Final Amount
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ₹{sale.total_price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
