// Inventory.tsx (updated)
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import InventoryForm from "./BasicTableOne";
import BulkInventoryForm from "./BulkInventoryForm";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Product {
  id: string;
  brand: string;
  size: string;
  type: string;
  subtype: string;
  quantity: number;
  costPrice: string;
  unitPrice: string;
  barcode: string;
}

interface InventoryProps {
  limit?: number;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function Inventory({ limit }: InventoryProps) {
  const [tableData, setTableData] = useState<Product[]>([]);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkReport, setBulkReport] = useState<any | null>(null);

  // ... existing code ...

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/product`);
      const responseData = await response.json();
      const productsData = responseData.data.products;
      const processedData = productsData
        .map((product: any) => ({
          id: product._id,
          brand: product.brand,
          size: product.size,
          type: product.type,
          subtype: product.subtype,
          quantity: product.quantity,
          costPrice: `₹${product.cost_price.toFixed(2)}`,
          unitPrice: `₹${product.unit_price.toFixed(2)}`,
          barcode: product.barcode,
        }))
        .filter((product: { quantity: number }) => product.quantity > 0);
      setTableData(limit ? processedData.slice(0, limit) : processedData);
    } catch (err) {
      console.error("Error fetching products data:", err);
    }
  }, [limit]);

  // ... existing code ...

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Inventory
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowInventoryForm(true);
              setShowBulkForm(false);
              setBulkReport(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" /> Add Individual
          </button>

          <button
            onClick={() => {
              setShowBulkForm(true);
              setShowInventoryForm(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" /> Add Bulk
          </button>
        </div>
      </div>

      {/* Individual form */}
      {showInventoryForm && (
        <div className="mt-6">
          <InventoryForm
            onSuccess={() => {
              setShowInventoryForm(false);
              fetchProducts();
            }}
          />
          <button
            onClick={() => setShowInventoryForm(false)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center gap-2"
          >
            <XMarkIcon className="h-5 w-5" /> Close Form
          </button>
        </div>
      )}

      {/* Bulk form */}
      {showBulkForm && (
        <div className="mt-6">
          <BulkInventoryForm
            onSuccess={(result) => {
              // result should contain created / updated / errors
              setBulkReport(result);
              // auto re-fetch inventory as requested
              fetchProducts();
              // keep showing report (BulkInventoryForm also shows report)
            }}
            onCancel={() => {
              setShowBulkForm(false);
              setBulkReport(null);
            }}
          />
          <button
            onClick={() => {
              setShowBulkForm(false);
              setBulkReport(null);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center gap-2"
          >
            <XMarkIcon className="h-5 w-5" /> Close Bulk Form
          </button>
          {/* Additional inline summary (optional, keeps visible outside the form) */}
          {bulkReport && (
            <div className="mt-3 p-4 bg-slate-50 rounded-lg border shadow-sm">
              <div className="font-bold mb-3 text-gray-800 dark:text-black">
                Bulk Add Summary
              </div>
              <div className="space-y-4">
                {bulkReport.created?.length > 0 && (
                  <div>
                    <div className="font-medium text-green-700 mb-2">
                      Created Products
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bulkReport.created.map((c: any) => (
                        <div
                          key={c.productId}
                          className="p-2 bg-green-100 border border-green-200 rounded-md text-sm text-green-800"
                        >
                          Size: {c.size.toUpperCase()} — Barcode: {c.barcode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkReport.updated?.length > 0 && (
                  <div>
                    <div className="font-medium text-blue-700 mb-2">
                      Updated Products
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bulkReport.updated.map((u: any) => (
                        <div
                          key={u.productId}
                          className="p-2 bg-blue-100 border border-blue-200 rounded-md text-sm text-blue-800"
                        >
                          Size: {u.size.toUpperCase()} — Barcode: {u.barcode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkReport.errors?.length > 0 && (
                  <div>
                    <div className="font-medium text-red-700 mb-2">Errors</div>
                    <div className="flex flex-wrap gap-2">
                      {bulkReport.errors.map((er: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 bg-red-100 border border-red-200 rounded-md text-sm text-red-800"
                        >
                          Size: {er.size?.toUpperCase() || "Unknown"} —{" "}
                          {er.message || JSON.stringify(er)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory table */}
      <div className="max-w-full overflow-x-auto mt-6">
        <div className="min-w-[800px]">
          <Table className="table-auto w-full">
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
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
                  Size
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
                  Selling Price
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Barcode
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableData.map((product) => (
                <TableRow key={product.id} className="">
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.brand}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.subtype}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {product.size}
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
