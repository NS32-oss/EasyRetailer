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
  _id: string;
  brand?: string;
  size?: string;
  type?: string;
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

export default function SalesCartHistory() {
  const { saleId } = useParams<{ saleId: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [showBillModal, setShowBillModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/sales/${saleId}`
        );
        const data = await response.json();

        if (data.status === 200) {
          setSale(data.data);
          setCustomerMobile(data.data.customer_mobile);
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

  // Function to generate bill
  const generateBill = async () => {
    if (!sale) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/sales/${saleId}/generate-bill`,
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
          message: "Bill generated and sent successfully",
          type: "success",
        });

        // Update the sale object to reflect bill generation
        setSale((prev) => (prev ? { ...prev, bill_generated: true } : null));
        setShowBillModal(false);
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
              Enter the customer's mobile number to send the bill:
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
                Generate & Send Bill
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Sale Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Transaction ID: {sale._id}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Date: {formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!sale.bill_generated && (
              <button
                onClick={() => setShowBillModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Generate Bill
              </button>
            )}
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
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
                      {product.brand || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      {product.size || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                      {product.type || "N/A"}
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

        {/* Summary Section */}
        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex justify-between sm:w-64">
              <span className="text-gray-600 dark:text-gray-400">
                Total Discount:
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                ₹{sale.final_discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between sm:w-64">
              <span className="text-gray-600 dark:text-gray-400">
                Final Amount:
              </span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">
                ₹{sale.total_price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between sm:w-64">
              <span className="text-gray-600 dark:text-gray-400">
                Payment Method:
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {sale.payment_method}
              </span>
            </div>
            <div className="flex justify-between sm:w-64">
              <span className="text-gray-600 dark:text-gray-400">
                Bill Status:
              </span>
              <span
                className={`font-medium ${
                  sale.bill_generated ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {sale.bill_generated ? "Generated" : "Not Generated"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
