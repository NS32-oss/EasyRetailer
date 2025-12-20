import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProductAddedSummary {
  brand: string;
  type: string;
  subtype: string;
  sizes: Array<{
    size: string;
    quantity: number;
  }>;
  cost_price: number;
  unit_price: number;
  barcode?: string;
}

interface ProductAddSummaryModalProps {
  isOpen: boolean;
  products: ProductAddedSummary[];
  onClose: () => void;
}

const ProductAddSummaryModal: React.FC<ProductAddSummaryModalProps> = ({
  isOpen,
  products,
  onClose,
}) => {
  if (!isOpen || !products || products.length === 0) return null;

  const totalQuantity = products.reduce((sum, p: any) => {
    const sizes = Array.isArray(p?.sizes) ? p.sizes : [];
    return sum + sizes.reduce((s: number, sz: any) => s + (Number(sz?.quantity) || 0), 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-green-600 dark:text-green-400">
              ✨ Products Added Successfully!
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {products.length} product(s) added with {totalQuantity} total unit(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-3">
          {products.map((product: any, index: number) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow"
            >
              {/* Brand & Type Header */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {product?.brand || "Unknown Brand"}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(product?.type || "")}
                      {product?.subtype ? ` • ${product.subtype}` : ""}
                    </p>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                    {Array.isArray(product?.sizes)
                      ? product.sizes.reduce((sum: number, sz: any) => sum + (Number(sz?.quantity) || 0), 0)
                      : 0} units
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                    Cost Price
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    ₹{Number(product?.cost_price || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                    Unit Price
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    ₹{Number(product?.unit_price || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Sizes and Barcode */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                    Sizes Added
                  </p>
                  {product?.barcode && (
                    <span className="text-[10px] font-mono font-semibold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {product.barcode}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(product?.sizes) ? product.sizes : []).map((size: any, idx: number) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {size?.size || "?"}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {Number(size?.quantity || 0)} {Number(size?.quantity || 0) === 1 ? "unit" : "units"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAddSummaryModal;
