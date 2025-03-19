import  React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Calendar, DollarSign, TrendingUp, Download } from "lucide-react"

// Mock data - would be fetched from API in real app
const mockData = {
  dailySales: [
    { date: "2023-03-01", sales: 1200, profit: 420 },
    { date: "2023-03-02", sales: 1800, profit: 630 },
    { date: "2023-03-03", sales: 1400, profit: 490 },
    { date: "2023-03-04", sales: 2200, profit: 770 },
    { date: "2023-03-05", sales: 2600, profit: 910 },
    { date: "2023-03-06", sales: 1900, profit: 665 },
    { date: "2023-03-07", sales: 1400, profit: 490 },
    { date: "2023-03-08", sales: 1600, profit: 560 },
    { date: "2023-03-09", sales: 1800, profit: 630 },
    { date: "2023-03-10", sales: 2100, profit: 735 },
    { date: "2023-03-11", sales: 2400, profit: 840 },
    { date: "2023-03-12", sales: 2200, profit: 770 },
    { date: "2023-03-13", sales: 1900, profit: 665 },
    { date: "2023-03-14", sales: 1700, profit: 595 },
  ],
  productPerformance: [
    { name: "Jeans", value: 35 },
    { name: "T-Shirts", value: 25 },
    { name: "Jackets", value: 20 },
    { name: "Shirts", value: 15 },
    { name: "Others", value: 5 },
  ],
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("2023-03-01")
  const [endDate, setEndDate] = useState("2023-03-14")
  const [data, setData] = useState(mockData)

  // Filter data based on date range
  const filteredDailySales = data.dailySales.filter((item) => {
    return item.date >= startDate && item.date <= endDate
  })

  // Calculate totals
  const totalSales = filteredDailySales.reduce((sum, item) => sum + item.sales, 0)
  const totalProfit = filteredDailySales.reduce((sum, item) => sum + item.profit, 0)

  const handleGenerateReport = () => {
    // In a real app, you would fetch data from API based on date range
    console.log("Generating report for:", { startDate, endDate })

    // For demo, we'll just use the mock data
    setData(mockData)
  }

  const handleExportReport = () => {
    // In a real app, you would generate a CSV or PDF
    console.log("Exporting report for:", { startDate, endDate })

    // Mock export functionality
    alert("Report exported successfully!")
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports Dashboard</h1>
        <p className="text-muted-foreground">Analyze your business performance</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select a date range to generate reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-8"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  className="pl-8"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={handleGenerateReport}>Generate Report</Button>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              For period {startDate} to {endDate}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              For period {startDate} to {endDate}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales Trend</TabsTrigger>
          <TabsTrigger value="profit">Profit Trend</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales</CardTitle>
              <CardDescription>Sales trend over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredDailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#3b82f6" name="Sales ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Profit</CardTitle>
              <CardDescription>Profit trend over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredDailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit ($)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Category Performance</CardTitle>
              <CardDescription>Sales distribution by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.productPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.productPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

