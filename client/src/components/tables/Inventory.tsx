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
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkReport, setBulkReport] = useState<any | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Get unique values for filter options
  const brands = [...new Set(tableData.map((item) => item.brand))].sort();
  const types = [...new Set(tableData.map((item) => item.type))].sort();
  const subtypes = [...new Set(tableData.map((item) => item.subtype))].sort();
  const sizes = [...new Set(tableData.map((item) => item.size))].sort();

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = tableData;

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((item) => selectedBrands.includes(item.brand));
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item) => selectedTypes.includes(item.type));
    }

    if (selectedSubtypes.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSubtypes.includes(item.subtype)
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((item) => selectedSizes.includes(item.size));
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((item) => {
        const unitPrice = parseFloat(item.unitPrice.replace("₹", ""));
        const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return unitPrice >= minPrice && unitPrice <= maxPrice;
      });
    }

    setFilteredData(limit ? filtered.slice(0, limit) : filtered);
  }, [
    tableData,
    selectedBrands,
    selectedTypes,
    selectedSubtypes,
    selectedSizes,
    priceRange,
    limit,
  ]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedTypes([]);
    setSelectedSubtypes([]);
    setSelectedSizes([]);
    setPriceRange({ min: "", max: "" });
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedTypes.length > 0 ||
    selectedSubtypes.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange.min ||
    priceRange.max;

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
            onClick={() => setShowFilterModal(true)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-theme-sm font-medium shadow ${
              hasActiveFilters
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            🔍 Filter {hasActiveFilters && `(${filteredData.length})`}
          </button>

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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                🔍 Filter Inventory
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand ({selectedBrands.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(
                              selectedBrands.filter((b) => b !== brand)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type ({selectedTypes.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {types.map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(
                              selectedTypes.filter((t) => t !== type)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subtype Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtype ({selectedSubtypes.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {subtypes.map((subtype) => (
                    <label
                      key={subtype}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubtypes.includes(subtype)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubtypes([...selectedSubtypes, subtype]);
                          } else {
                            setSelectedSubtypes(
                              selectedSubtypes.filter((s) => s !== subtype)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {subtype}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size ({selectedSizes.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {sizes.map((size) => (
                    <label
                      key={size}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, size]);
                          } else {
                            setSelectedSizes(
                              selectedSizes.filter((s) => s !== size)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {hasActiveFilters ? (
                  <span>
                    Showing {filteredData.length} of {tableData.length} products
                  </span>
                ) : (
                  <span>Showing all {tableData.length} products</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
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
              {filteredData.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {hasActiveFilters ? (
                      <div>
                        <div className="text-lg font-medium mb-2">
                          No products match your filters
                        </div>
                        <div className="text-sm">
                          Try adjusting your filter criteria or clear all
                          filters
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-medium mb-2">
                          No products in inventory
                        </div>
                        <div className="text-sm">
                          Add some products to get started
                        </div>
                      </div>
                    )}
                  </td>
                </TableRow>
              ) : (
                filteredData.map((product) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
