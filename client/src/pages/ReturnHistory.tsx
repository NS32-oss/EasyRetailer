"use client"

import { useEffect, useState } from "react"
import { Notification } from "../components/toastNotification/Notification"
import Loader from "../components/common/Loader"

interface ReturnItem {
  saleProductId: string
  product: string
  requestedQty: number
  approvedQty: number
  unitPrice: number
  refundAmount: number
  profitImpact: number
  reason: string
}

interface ReturnRecord {
  _id: string
  sale: string
  items: ReturnItem[]
  totalRefund: number
  totalProfitImpact: number
  reason: string
  status: "pending" | "approved" | "rejected" | "processed"
  createdAt: string
  updatedAt: string
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL

export default function ReturnHistory() {
  const [returns, setReturns] = useState<ReturnRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "processed" | "rejected">("all")
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null)

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/v1/returns`)
      const data = await response.json()

      if (data.status === 200) {
        const sortedReturns = (data.data?.returns || []).sort(
          (a: ReturnRecord, b: ReturnRecord) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setReturns(sortedReturns)
      } else {
        setError("Failed to fetch returns")
      }
    } catch (error) {
      console.error("Error fetching returns:", error)
      setError("An error occurred while fetching returns")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "approved":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      case "processed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const filteredReturns = returns
    .filter((ret) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        ret._id.toLowerCase().includes(searchLower) ||
        ret.sale.toLowerCase().includes(searchLower) ||
        ret.reason.toLowerCase().includes(searchLower)
      )
    })
    .filter((ret) => (filterStatus === "all" ? true : ret.status === filterStatus))

  return (
    <>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Return History</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Return ID, Sale ID, or Reason..."
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader message="Loading return history..." />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500 dark:text-gray-400">No return records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReturns.map((ret) => (
                <div
                  key={ret._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                  {/* Return Card Header */}
                  <button
                    onClick={() => setExpandedReturn(expandedReturn === ret._id ? null : ret._id)}
                    className="w-full p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {ret._id.slice(-8)}
                        </span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(ret.status)}`}>
                          {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Sale: {ret.sale.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {ret.items.length} item{ret.items.length !== 1 ? "s" : ""} • Reason: {ret.reason}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(ret.createdAt).toLocaleDateString()} at {new Date(ret.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                        ₹{ret.totalRefund.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Refund</p>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedReturn === ret._id && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/20">
                      {/* Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items Returned</h4>
                        <div className="space-y-2">
                          {ret.items.map((item, idx) => (
                            <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Item {idx + 1}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Product ID: {item.product.slice(-8)}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  Qty: {item.approvedQty}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Unit Price</p>
                                  <p className="font-medium text-gray-900 dark:text-white">₹{item.unitPrice.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Refund Amount</p>
                                  <p className="font-medium text-green-600 dark:text-green-400">₹{item.refundAmount.toFixed(2)}</p>
                                </div>
                              </div>
                              {item.reason && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  Reason: {item.reason}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Refund:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">₹{ret.totalRefund.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Profit Impact:</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">-₹{ret.totalProfitImpact.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
