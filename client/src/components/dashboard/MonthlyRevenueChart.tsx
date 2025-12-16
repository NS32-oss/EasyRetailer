"use client"

import { useState, useEffect } from "react"
import Chart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import ChartTab from "../common/ChartTab"

const API_BASE_URL = import.meta.env.VITE_APP_API_URL

export default function MonthlyRevenueChart() {
  const [seriesData, setSeriesData] = useState<number[]>([])
  const [timeRange, setTimeRange] = useState<"Daily" | "Monthly" | "Yearly">("Daily")

  const fetchRevenueData = async (range: "Daily" | "Monthly" | "Yearly") => {
    try {
      const now = new Date()
      let startDate = ""
      let endDate = ""

      if (range === "Daily") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA")
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toLocaleDateString("en-CA")
      } else if (range === "Monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1).toLocaleDateString("en-CA")
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("en-CA")
      } else if (range === "Yearly") {
        startDate = new Date(now.getFullYear() - 10, 0, 1).toLocaleDateString("en-CA")
        endDate = new Date(now.getFullYear(), 11, 31).toLocaleDateString("en-CA")
      }

      const url = new URL(`${API_BASE_URL}/api/v1/statistics`)
      url.searchParams.append("startDate", startDate)
      url.searchParams.append("endDate", endDate)
      url.searchParams.append("groupBy", range)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch revenue data")
      }

      const jsonData = await response.json()
      if (jsonData.data && jsonData.data.length > 0) {
        const revenueData = jsonData.data.map((item: any) => item.totalRevenue)
        setSeriesData(revenueData)
      } else {
        setSeriesData([])
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    }
  }

  useEffect(() => {
    fetchRevenueData(timeRange)
  }, [timeRange])

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories:
        timeRange === "Daily"
          ? Array.from({ length: new Date().getDate() }, (_, i) => i + 1)
          : timeRange === "Monthly"
            ? Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - 11 + i)
                return date.toLocaleString("default", { month: "short" })
              })
            : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 9 + i),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  }

  const series = [
    {
      name: "Revenue",
      data: seriesData.length > 0 ? seriesData : Array(options.xaxis?.categories?.length || 0).fill(0),
    },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white px-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:pt-5 md:px-6 md:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{timeRange} Revenue</h3>
        <ChartTab onSelect={setTimeRange} />
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-4 min-w-[320px] sm:min-w-[500px] pl-2 md:-ml-5 md:min-w-[650px] xl:min-w-full">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  )
}
