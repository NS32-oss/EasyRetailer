"use client"

import { useEffect, useState } from "react"
import { Notification } from "../components/toastNotification/Notification"
import { useSidebar } from "../context/SidebarContext"
import Loader from "../components/common/Loader"

interface ReturnProduct {
  product_id: string
  brand: string
  size: string
  type: string
  original_quantity: number
  return_quantity: number
  unit_price: number
  discount: number
  selling_price: number
  refund_amount: number
  _id: string
  isReturned?: boolean
}

interface Sale {
  _id: string
  products: SaleProduct[]
  total_price: number
  final_discount: number
  payment_method: string
  customer_mobile: string
  bill_generated: boolean
  returnStatus?: "none" | "partial" | "full"
  createdAt: string
}

interface SaleProduct {
  product_id: string
  quantity: number
  unit_price: number
  discount: number
  selling_price: number
  cost_price: number
  brand: string
  size: string
  type: string
  _id: string
}

interface ReturnRequest {
  sale_id: string
  products: ReturnProduct[]
  total_refund: number
  reason: string
  return_date: string
  status: "pending" | "approved" | "rejected" | "processed"
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL

export default function Return() {
  const { isMobileOpen } = useSidebar()
  const [sales, setSales] = useState<Sale[]>([])
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [returnProducts, setReturnProducts] = useState<ReturnProduct[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [returnReason, setReturnReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)
  const [validationError, setValidationError] = useState<string>("")

  useEffect(() => {
    fetchSales()
  }, [])

  // Close return drawer when sidebar opens on mobile
  useEffect(() => {
    if (isMobileOpen && selectedSale) {
      setSelectedSale(null)
      setReturnProducts([])
      setReturnReason("")
    }
  }, [isMobileOpen])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/v1/sales`)
      const data = await response.json()

      if (data.status === 200) {
        // Sort by most recent first
        const sortedSales = data.data.sales.sort(
          (a: Sale, b: Sale) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        setSales(sortedSales)
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
      setNotification({ message: "Failed to fetch sales", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaleSelect = async (sale: Sale) => {
    setSelectedSale(sale)
    // Initialize return products with 0 quantity
    const initialReturnProducts: ReturnProduct[] = sale.products.map((product) => ({
      product_id: product.product_id,
      brand: product.brand,
      size: product.size,
      type: product.type,
      original_quantity: product.quantity,
      return_quantity: 0,
      unit_price: product.unit_price,
      discount: product.discount,
      selling_price: product.selling_price,
      refund_amount: 0,
      _id: product._id,
      isReturned: false, // Track if this item was already returned
    }))
    setReturnProducts(initialReturnProducts)
    setReturnReason("")
    
    // Fetch return history to mark already-returned items
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/returns?sale_id=${sale._id}`)
      const data = await response.json()
      if (data.status === 200 && data.data?.returns) {
        const returns = data.data.returns
        const returnedItemIds = new Set<string>()
        
        // Collect all saleProductIds that have been returned
        for (const ret of returns) {
          if (ret.status === "approved" || ret.status === "processed") {
            for (const item of (ret.items || [])) {
              returnedItemIds.add(item.saleProductId?.toString() || "")
            }
          }
        }
        
        // Update return products to mark already-returned items
        setReturnProducts((prev) =>
          prev.map((product) => ({
            ...product,
            isReturned: returnedItemIds.has(product._id),
            original_quantity: sale.products.find((p) => p._id === product._id)?.quantity || 0,
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching return history:", error)
    }
  }

  const handleReturnQuantityChange = (productId: string, quantity: number) => {
    setValidationError("")
    setReturnProducts((prev) =>
      prev.map((product) => {
        if (product.product_id === productId && !product.isReturned) {
          const returnQty = Math.min(Math.max(0, quantity), product.original_quantity)
          // Calculate refund proportionally based on selling price per unit
          // selling_price is the final price after discount, so we use it directly
          const pricePerUnit = product.selling_price / product.original_quantity
          const refundAmount = pricePerUnit * returnQty

          return {
            ...product,
            return_quantity: returnQty,
            refund_amount: Math.round(refundAmount * 100) / 100,
          }
        }
        return product
      }),
    )
  }

  const getTotalRefund = () => {
    return returnProducts.reduce((sum, product) => sum + product.refund_amount, 0)
  }

  const getReturnItemCount = () => {
    return returnProducts.filter((p) => p.return_quantity > 0).length
  }

  const handleProcessReturn = () => {
    const itemsToReturn = returnProducts.filter((p) => p.return_quantity > 0)

    if (itemsToReturn.length === 0) {
      setValidationError("Select at least one item to return")
      setNotification({ message: "Select at least one item to return", type: "error" })
      return
    }

    if (!returnReason.trim()) {
      setValidationError("Reason is required")
      setNotification({ message: "Reason is required", type: "error" })
      return
    }

    setValidationError("")

    setShowConfirmModal(true)
  }

  const confirmReturn = async () => {
    if (!selectedSale) return

    try {
      const itemsToReturn = returnProducts.filter((p) => p.return_quantity > 0)

      const returnData: ReturnRequest = {
        sale_id: selectedSale._id,
        products: itemsToReturn.map((item) => ({
          ...item,
          saleProductId: item._id, // backend expects sale line id
          return_quantity: item.return_quantity,
        })),
        total_refund: getTotalRefund(),
        reason: returnReason,
        return_date: new Date().toISOString(),
        status: "pending",
      }

      // TODO: Replace with actual API endpoint when backend is ready
      const response = await fetch(`${API_BASE_URL}/api/v1/returns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(returnData),
      })

      const data = await response.json()

      if (data.status === 201 || data.status === 200) {
        setNotification({
          message: `Return processed successfully! Refund amount: ₹${getTotalRefund().toFixed(2)}`,
          type: "success",
        })

        // Reset form
        setSelectedSale(null)
        setReturnProducts([])
        setReturnReason("")
        setShowConfirmModal(false)
        
        // Refresh sales list to update badges and hide fully returned sales
        await fetchSales()
      } else {
        throw new Error(data.message || "Failed to process return")
      }
    } catch (error) {
      console.error("Error processing return:", error)
      // If API endpoint doesn't exist yet, show a simulated success
      setNotification({
        message: `Return request created successfully! Refund amount: ₹${getTotalRefund().toFixed(2)}. (Simulated - API endpoint pending)`,
        type: "info",
      })

      // Reset form after simulation
      setTimeout(() => {
        setSelectedSale(null)
        setReturnProducts([])
        setReturnReason("")
        setShowConfirmModal(false)
      }, 2000)
    }
  }

  const filteredSales = sales
    .filter((sale) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        sale._id.toLowerCase().includes(searchLower) ||
        (sale.customer_mobile || "").includes(searchQuery) ||
        sale.products.some((p) => (p.brand || "").toLowerCase().includes(searchLower))
      )
    })
    .filter((sale) => {
      const status = sale.returnStatus || "none"
      return status !== "full" // hide only fully returned sales, keep partial and none visible
    })

  return (
    <>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirm Return</h3>
            <div className="mb-4 space-y-2">
              <p className="text-gray-600 dark:text-gray-300">Are you sure you want to process this return?</p>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Items:</span> {getReturnItemCount()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Refund Amount:</span> ₹{getTotalRefund().toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Reason:</span> {returnReason}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-sm font-medium active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium active:scale-95 transition-transform"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Sale Selection - Hidden on mobile when form is open */}
        <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${selectedSale ? "hidden lg:block" : "block"}`}>
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 lg:text-lg mb-4">
              Select Sale to Return
            </h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Sale ID, Mobile, or Brand..."
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
                <p className="ml-4 text-gray-600 dark:text-gray-400 text-sm">Loading sales...</p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No sales found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSales.map((sale) => (
                  <button
                    key={sale._id}
                    onClick={() => handleSaleSelect(sale)}
                    disabled={(sale.returnStatus || "none") === "full"}
                    className={`w-full text-left p-4 rounded-xl border transition-all active:scale-98 ${
                      selectedSale?._id === sale._id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
                          ID: {sale._id.slice(-12)}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium whitespace-nowrap ml-2">
                        ₹{sale.total_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        {sale.products.length} items
                        {sale.returnStatus && sale.returnStatus !== "none" && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              sale.returnStatus === "full"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                            }`}
                          >
                            {sale.returnStatus === "full" ? "Returned" : "Partial"}
                          </span>
                        )}
                      </span>
                      <span>{sale.customer_mobile}</span>
                    </div>
                    {sale.returnStatus === "full" && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">Fully returned</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Return Form - Modal drawer on mobile, side panel on desktop */}
        {selectedSale ? (
          // Mobile drawer view
          <div className="fixed inset-0 z-30 flex flex-col bg-white dark:bg-gray-900 lg:static lg:z-auto lg:overflow-hidden lg:rounded-2xl lg:border lg:border-gray-200 lg:bg-white dark:lg:border-gray-800 dark:lg:bg-white/[0.03]">
            {/* Mobile header with back button */}
            <div className="lg:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedSale(null)
                  setReturnProducts([])
                  setReturnReason("")
                }}
                className="text-blue-600 dark:text-blue-400 font-medium text-sm"
              >
                ← Back to Sales
              </button>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Return Items</h3>
              <div className="w-16" /> {/* spacer for centering */}
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 lg:text-lg">Return Items</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto lg:overflow-y-visible">
              {selectedSale.returnStatus === "full" && (
                <div className="p-4 lg:p-6 mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl mx-4 lg:mx-0 lg:mb-0 lg:rounded-none">
                  This sale was fully returned. No further returns can be created.
                </div>
              )}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Products List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {returnProducts.map((product) => (
                    <div
                      key={product.product_id}
                      className={`p-4 rounded-xl border transition-opacity ${
                        product.isReturned
                          ? "bg-gray-100 dark:bg-gray-800/20 border-gray-300 dark:border-gray-700 opacity-60"
                          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${product.isReturned ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                            {product.brand}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {product.type} • Size {product.size}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                            Qty: {product.original_quantity}
                          </span>
                          {product.isReturned && (
                            <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium">
                              Returned
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Return Quantity</label>
                          <input
                            type="number"
                            min="0"
                            max={product.original_quantity}
                            value={product.return_quantity}
                            onChange={(e) =>
                              handleReturnQuantityChange(product.product_id, Number.parseInt(e.target.value) || 0)
                            }
                            disabled={product.isReturned}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                              product.isReturned
                                ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Refund Amount</label>
                          <div className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-gray-900 dark:text-white">
                            ₹{product.refund_amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Return Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => {
                      setReturnReason(e.target.value)
                      setValidationError("")
                    }}
                    placeholder="Enter reason for return..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
                  />
                  {validationError && !returnReason.trim() && (
                    <p className="mt-1 text-xs text-red-600">{validationError}</p>
                  )}
                </div>

                {/* Summary */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Items to Return</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{getReturnItemCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Refund</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{getTotalRefund().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedSale(null)
                      setReturnProducts([])
                      setReturnReason("")
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-sm font-medium active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessReturn}
                    disabled={
                      selectedSale.returnStatus === "full" ||
                      !returnProducts.some((p) => p.return_quantity > 0) ||
                      !returnReason.trim()
                    }
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Process Return
                  </button>
                </div>
                {validationError && (
                  <p className="text-xs text-red-600 mt-1 text-right">{validationError}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Empty state on desktop
          <div className="hidden lg:flex overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] items-center justify-center p-6">
            <div className="text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Select a sale from the left panel to start processing a return
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
