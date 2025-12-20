"use client";

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
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Loader, { SkeletonLoader } from "../common/Loader";
import ProductAddSummaryModal from "../common/ProductAddSummaryModal";

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
  const [isLoading, setIsLoading] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryProducts, setSummaryProducts] = useState<any[]>([]);

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
        const unitPrice = Number.parseFloat(item.unitPrice.replace("₹", ""));
        const minPrice = priceRange.min ? Number.parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max
          ? Number.parseFloat(priceRange.max)
          : Number.POSITIVE_INFINITY;
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

  const activeAction = showInventoryForm
    ? "individual"
    : showBulkForm
    ? "bulk"
    : null;

  // Check if any filters are active
  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedTypes.length > 0 ||
    selectedSubtypes.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange.min ||
    priceRange.max;

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/product`);
      const responseData = await response.json();
      const productsData = responseData.data.products;
      const processedData = productsData
        .map((product: any) => ({
          id: product._id,
          brand: product.brand,
          size: product.size,
          type: product.type?.name || product.type,
          subtype: product.subtype?.name || product.subtype,
          quantity: product.quantity,
          costPrice: `₹${product.cost_price.toFixed(2)}`,
          unitPrice: `₹${product.unit_price.toFixed(2)}`,
          barcode: product.barcode,
        }))
        .filter((product: { quantity: number }) => product.quantity > 0);
      setTableData(limit ? processedData.slice(0, limit) : processedData);
    } catch (err) {
      console.error("Error fetching products data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div>
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 md:static md:bg-transparent md:rounded-2xl md:border md:px-6 md:mb-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white md:text-lg">
            Inventory
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Left actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowInventoryForm(true);
                setShowBulkForm(false);
                setBulkReport(null);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
        ${
          activeAction === "individual"
            ? "bg-blue-700 text-white shadow-md"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }
      `}
            >
              <PlusIcon className="h-4 w-4" />
              Add Individual
            </button>

            <button
              onClick={() => {
                setShowBulkForm(true);
                setShowInventoryForm(false);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
        ${
          activeAction === "bulk"
            ? "bg-blue-700 text-white shadow-md"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }
      `}
            >
              <PlusIcon className="h-4 w-4" />
              Add Bulk
            </button>
          </div>

          {/* Right action */}
          <button
            onClick={() => setShowFilterModal(true)}
            className={`inline-flex items-center justify-center gap-1 rounded-md
    px-2 py-2 text-xs font-medium transition
    md:rounded-lg md:px-4 md:py-2.5 md:text-sm
    ${
      hasActiveFilters
        ? "bg-green-600 text-white"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }`}
          >
            <MagnifyingGlassIcon className="h-4 w-4" />

            {/* text only on desktop */}
            <span className="hidden md:inline">Filter</span>

            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                {filteredData.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Individual form */}
      {showInventoryForm && (
        <div className="px-4 mt-4 md:px-6">
          <InventoryForm
            onSuccess={(result: any) => {
              setSummaryProducts([result]);
              setShowSummaryModal(true);
              setShowInventoryForm(false);
              fetchProducts();
            }}
          />
          <button
            onClick={() => setShowInventoryForm(false)}
            className="mt-4 w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium active:scale-95 transition-transform inline-flex items-center justify-center gap-2 md:w-auto md:rounded-lg md:py-2"
          >
            <XMarkIcon className="h-5 w-5" /> Close Form
          </button>
        </div>
      )}

      {/* Bulk form */}
      {showBulkForm && (
        <div className="px-4 mt-4 md:px-6">
          <BulkInventoryForm
            onSuccess={(result: any) => {
              setSummaryProducts([result]);
              setShowSummaryModal(true);
              fetchProducts();
              setShowBulkForm(false);
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
            className="mt-4 w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium active:scale-95 transition-transform inline-flex items-center justify-center gap-2 md:w-auto md:rounded-lg md:py-2"
          >
            <XMarkIcon className="h-5 w-5" /> Close Bulk Form
          </button>
          {bulkReport && (
            <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="font-bold mb-3 text-gray-900 dark:text-white">
                Bulk Add Summary
              </div>
              <div className="space-y-4">
                {bulkReport.created?.length > 0 && (
                  <div>
                    <div className="font-medium text-green-700 dark:text-green-400 mb-2 text-sm">
                      Created Products
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bulkReport.created.map((c: any) => (
                        <div
                          key={c.productId}
                          className="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-800 dark:text-green-300"
                        >
                          Size: {c.size.toUpperCase()} — Barcode: {c.barcode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkReport.updated?.length > 0 && (
                  <div>
                    <div className="font-medium text-blue-700 dark:text-blue-400 mb-2 text-sm">
                      Updated Products
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bulkReport.updated.map((u: any) => (
                        <div
                          key={u.productId}
                          className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300"
                        >
                          Size: {u.size.toUpperCase()} — Barcode: {u.barcode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkReport.errors?.length > 0 && (
                  <div>
                    <div className="font-medium text-red-700 dark:text-red-400 mb-2 text-sm">
                      Errors
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bulkReport.errors.map((er: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300"
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

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-2xl p-4 sm:p-6 w-full max-h-[85vh] overflow-y-auto md:max-w-4xl md:max-h-[90vh] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                🔍 Filter Inventory
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -mr-2"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile: Collapsible Filter Sections */}
            <div className="md:hidden space-y-3">
              {/* Brand Filter - Collapsible */}
              <details className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <summary className="bg-gray-50 dark:bg-gray-800 px-4 py-3 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  Brand{" "}
                  {selectedBrands.length > 0 && (
                    <span className="text-xs text-blue-600">
                      ({selectedBrands.length})
                    </span>
                  )}
                </summary>
                <div className="max-h-40 overflow-y-auto p-3 bg-white dark:bg-gray-900 space-y-2">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center space-x-3 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Type Filter - Collapsible */}
              <details className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <summary className="bg-gray-50 dark:bg-gray-800 px-4 py-3 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  Type{" "}
                  {selectedTypes.length > 0 && (
                    <span className="text-xs text-blue-600">
                      ({selectedTypes.length})
                    </span>
                  )}
                </summary>
                <div className="max-h-40 overflow-y-auto p-3 bg-white dark:bg-gray-900 space-y-2">
                  {types.map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-3 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Subtype Filter - Collapsible */}
              <details className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <summary className="bg-gray-50 dark:bg-gray-800 px-4 py-3 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  Subtype{" "}
                  {selectedSubtypes.length > 0 && (
                    <span className="text-xs text-blue-600">
                      ({selectedSubtypes.length})
                    </span>
                  )}
                </summary>
                <div className="max-h-40 overflow-y-auto p-3 bg-white dark:bg-gray-900 space-y-2">
                  {subtypes.map((subtype) => (
                    <label
                      key={subtype}
                      className="flex items-center space-x-3 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {subtype}
                      </span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Size Filter - Collapsible */}
              <details className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <summary className="bg-gray-50 dark:bg-gray-800 px-4 py-3 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  Size{" "}
                  {selectedSizes.length > 0 && (
                    <span className="text-xs text-blue-600">
                      ({selectedSizes.length})
                    </span>
                  )}
                </summary>
                <div className="max-h-40 overflow-y-auto p-3 bg-white dark:bg-gray-900 space-y-2">
                  {sizes.map((size) => (
                    <label
                      key={size}
                      className="flex items-center space-x-3 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Price Range - Collapsible */}
              <details className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <summary className="bg-gray-50 dark:bg-gray-800 px-4 py-3 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  Price Range
                </summary>
                <div className="p-3 bg-white dark:bg-gray-900 space-y-3">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </details>
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Brand
                  {selectedBrands.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                      ({selectedBrands.length} selected)
                    </span>
                  )}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center space-x-3 py-2 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
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
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Type
                  {selectedTypes.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                      ({selectedTypes.length} selected)
                    </span>
                  )}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
                  {types.map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-3 py-2 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
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
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Subtype
                  {selectedSubtypes.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                      ({selectedSubtypes.length} selected)
                    </span>
                  )}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
                  {subtypes.map((subtype) => (
                    <label
                      key={subtype}
                      className="flex items-center space-x-3 py-2 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
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
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Size
                  {selectedSizes.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                      ({selectedSizes.length} selected)
                    </span>
                  )}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
                  {sizes.map((size) => (
                    <label
                      key={size}
                      className="flex items-center space-x-3 py-2 cursor-pointer"
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
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
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Price Range (₹)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
                {hasActiveFilters ? (
                  <span className="font-medium">
                    Showing {filteredData.length} of {tableData.length} products
                  </span>
                ) : (
                  <span>Showing all {tableData.length} products</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium active:scale-95 transition-transform md:flex-initial md:py-2"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform md:flex-initial md:py-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mt-4 md:px-0">
        {/* Mobile: Card List */}
        <div className="block md:hidden space-y-3">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm active:scale-98 transition-transform"
            >
              {/* Primary Info Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                    {item.brand}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.type} {item.subtype && `• ${item.subtype}`}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                    {item.size}
                  </span>
                </div>
              </div>

              {/* Quantity and Price Row */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                    Quantity
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                    Selling Price
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {item.unitPrice}
                  </p>
                </div>
              </div>

              {/* Secondary Info */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                    Cost Price
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.costPrice}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                    Barcode
                  </p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {item.barcode}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredData.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-500 dark:text-gray-400">
                No products found
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 dark:text-blue-400 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="py-8">
              <Loader message="Loading inventory..." />
            </div>
          )}
        </div>

        {/* Desktop: Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {isLoading ? (
            <div className="p-8">
              <SkeletonLoader rows={8} />
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <div className="inline-block min-w-full">
                <Table className="w-full border-collapse">
                  <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50 dark:bg-gray-900/50">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-left w-1/8"
                      >
                        Brand
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-left w-1/8"
                      >
                        Type
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-left w-1/8"
                      >
                        Subtype
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-left w-1/12"
                      >
                        Size
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-center w-1/12"
                      >
                        Quantity
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-right w-1/8"
                      >
                        Cost Price
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-right w-1/8"
                      >
                        Selling Price
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-left w-1/6"
                      >
                        Barcode
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-gray-100 dark:border-gray-800 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="py-3 px-4 text-gray-900 dark:text-gray-100 text-left">
                          {item.brand}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-600 dark:text-gray-400 text-left">
                          {item.type}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-600 dark:text-gray-400 text-left">
                          {item.subtype}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-left">
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            {item.size}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-600 dark:text-gray-400 text-right">
                          {item.costPrice}
                        </TableCell>
                        <TableCell className="py-3 px-4 font-medium text-green-600 dark:text-green-400 text-right">
                          {item.unitPrice}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-xs font-mono text-gray-500 dark:text-gray-500 text-left">
                          {item.barcode}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredData.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No products found
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 text-blue-600 dark:text-blue-400 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Summary Modal */}
      <ProductAddSummaryModal
        isOpen={showSummaryModal}
        products={summaryProducts}
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  );
}
