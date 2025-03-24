"use client";

import { useEffect, useState } from "react";

// Define the TypeScript interface for the table rows
interface Sale {
  id: string; // Unique identifier for each sale
  date: string; // Date of the sale
  subtotal: string; // Subtotal before discount (as a string with currency symbol)
  discount: string; // Discount applied to the sale (as a percentage)
  netAmount: string; // Final price after discount (as a string with currency symbol)
  paymentMethod: string; // Payment method used for the sale
}

interface RecentOrdersProps {
  limit?: number; // Optional limit for the number of recent orders to display
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function RecentOrders({ limit }: RecentOrdersProps) {
  const [tableData, setTableData] = useState<Sale[]>([]);

  useEffect(() => {
    // Fetch data from the API
    fetch(`${API_BASE_URL}/api/v1/sales`)
      .then((response) => response.json())
      .then((responseData) => {
        const salesData = responseData.data.sales;

        // Process the sales data to extract the required fields
        const processedData = salesData.map((sale: any) => {
          const subtotal = sale.total_price;
          const discount = sale.final_discount;
          const netAmount = subtotal - discount;
          const discountPercentage = ((discount / subtotal) * 100).toFixed(2);

          return {
            id: sale._id,
            date: new Date(sale.createdAt).toLocaleDateString(),
            subtotal: `₹${subtotal.toFixed(2)}`,
            discount: `${discountPercentage}%`,
            netAmount: `₹${netAmount.toFixed(2)}`,
            paymentMethod: sale.payment_method,
          };
        });

        // Apply the limit if provided
        const limitedData = limit
          ? processedData.slice(0, limit)
          : processedData;

        // Update state
        setTableData(limitedData);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
      });
  }, [limit]);

  // Function to handle row click and redirect to sales history
  const handleRowClick = (saleId: string) => {
    window.location.href = `/sales-cart-history/${saleId}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
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
                  Transaction ID
                </th>
                <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                  Date
                </th>
                <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                  Subtotal
                </th>
                <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                  Discount
                </th>
                <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                  Net Amount
                </th>
                <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                  Payment Method
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableData.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(sale.id)}
                >
                  <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400 truncate max-w-[120px]">
                    {sale.id}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                    {sale.date}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                    {sale.subtotal}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                    {sale.discount}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                    {sale.netAmount}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm dark:text-gray-400">
                    {sale.paymentMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
