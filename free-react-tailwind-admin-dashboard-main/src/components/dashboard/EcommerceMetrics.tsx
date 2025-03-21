import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

// Define interfaces for the product and sale data
interface Product {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  selling_price: number;
  _id: string;
}

interface Sale {
  _id: string;
  products: Product[];
  total_price: number;
  final_discount: number;
  payment_method: string;
  customer_mobile: string;
  bill_generated: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function EcommerceMetrics() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProductsSold, setTotalProductsSold] = useState(0);

  useEffect(() => {
    // Fetch data from the API
    fetch("http://localhost:8000/api/v1/sales/")
      .then((response) => response.json())
      .then((responseData) => {
        const salesData: Sale[] = responseData.data.sales;

        // Calculate total number of customers and products sold
        const totalCustomers = salesData.length;
        const totalProductsSold = salesData.reduce((acc, sale) => {
          return (
            acc +
            sale.products.reduce((sum, product) => sum + product.quantity, 0)
          );
        }, 0);

        // Update state
        setTotalCustomers(totalCustomers);
        setTotalProductsSold(totalProductsSold);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalCustomers}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Products Sold
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalProductsSold}
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon />
            9.05%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
