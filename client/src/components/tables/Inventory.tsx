import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

// Define the TypeScript interface for the table rows
interface Product {
  id: string; // Unique identifier for each product
  brand: string; // Brand of the product
  size: string; // Size of the product
  type: string; // Type of the product
  subtype: string; // Subtype of the product
  quantity: number; // Quantity of the product
  costPrice: string; // Cost price of the product (as a string with currency symbol)
  unitPrice: string; // Unit price of the product (as a string with currency symbol)
  barcode: string; // Barcode of the product
}

interface InventoryProps {
  limit?: number; // Optional limit for the number of products to display
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function Inventory({ limit }: InventoryProps) {
  const [tableData, setTableData] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch data from the API
    fetch(`${API_BASE_URL}/api/v1/product`)
      .then((response) => response.json())
      .then((responseData) => {
        const productsData = responseData.data.products;

        // Process the products data to extract the required fields
        const processedData = productsData.map((product: any) => {
          return {
            id: product._id,
            brand: product.brand,
            size: product.size,
            type: product.type,
            subtype: product.subtype,
            quantity: product.quantity,
            costPrice: `₹${product.cost_price.toFixed(2)}`,
            unitPrice: `₹${product.unit_price.toFixed(2)}`,
            barcode: product.barcode,
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
        console.error("Error fetching products data:", error);
      });
  }, [limit]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Inventory
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Add Inventory
          </button>
          
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table className="table-auto w-full">
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Product ID
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Brand
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Size
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Subtype
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Quantity
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Cost Price
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Unit Price
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Barcode
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableData.map((product) => (
                <TableRow key={product.id} className="">
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 truncate max-w-[120px]">
                    {product.id}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.brand}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.size}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.subtype}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.costPrice}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.unitPrice}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.barcode}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
