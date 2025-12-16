"use client"

import { useState, useEffect } from "react"
import { ArrowUpIcon, BoxIconLine, GroupIcon } from "../../icons"
import Badge from "../ui/badge/Badge"

// Define the TypeScript interface for the product and sale data
interface Product {
  product_id: string
  quantity: number
  unit_price: number
  discount: number
  selling_price: number
  _id: string
}

interface Sale {
  _id: string
  products: Product[]
  total_price: number
  final_discount: number
  payment_method: string
  customer_mobile: string
  bill_generated: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL

export default function EcommerceMetrics() {
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalProductsSold, setTotalProductsSold] = useState(0)
  const [ordersToday, setOrdersToday] = useState(0)
  const [customersToday, setCustomersToday] = useState(0)

  useEffect(() => {
    // Fetch data from the API
    fetch(`${API_BASE_URL}/api/v1/sales`)
      .then((response) => response.json())
      .then((responseData) => {
        const salesData: Sale[] = responseData.data.sales

        // Calculate total number of customers (sales count) and total products sold
        const totalCustomers = salesData.length
        const totalProductsSold = salesData.reduce((acc, sale) => {
          return acc + sale.products.reduce((sum, product) => sum + product.quantity, 0)
        }, 0)

        // Calculate orders and customers gained today using local date strings
        const today = new Date().toLocaleDateString("en-CA")
        const salesToday = salesData.filter((sale) => {
          const saleDate = new Date(sale.createdAt).toLocaleDateString("en-CA")
          return saleDate === today
        })
        const ordersToday = salesToday.length
        const customersToday = salesToday.reduce((acc, sale) => {
          return acc + sale.products.length
        }, 0)

        // Update state
        setTotalCustomers(totalCustomers)
        setTotalProductsSold(totalProductsSold)
        setOrdersToday(ordersToday)
        setCustomersToday(customersToday)
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error)
      })
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800 md:w-12 md:h-12">
          <GroupIcon className="text-gray-800 size-5 dark:text-white/90 md:size-6" />
        </div>

        <div className="flex items-end justify-between mt-4 md:mt-5">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Customers</span>
            <h4 className="mt-1 text-xl font-bold text-gray-800 dark:text-white/90 md:mt-2 md:text-title-sm">
              {totalCustomers}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            <span className="hidden sm:inline">{customersToday} customers today</span>
            <span className="sm:hidden">+{customersToday}</span>
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800 md:w-12 md:h-12">
          <BoxIconLine className="text-gray-800 size-5 dark:text-white/90 md:size-6" />
        </div>
        <div className="flex items-end justify-between mt-4 md:mt-5">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Products Sold</span>
            <h4 className="mt-1 text-xl font-bold text-gray-800 dark:text-white/90 md:mt-2 md:text-title-sm">
              {totalProductsSold}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon />
            <span className="hidden sm:inline">{ordersToday} orders today</span>
            <span className="sm:hidden">+{ordersToday}</span>
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  )
}
