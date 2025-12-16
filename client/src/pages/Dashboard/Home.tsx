import EcommerceMetrics from "../../components/dashboard/EcommerceMetrics"
import MonthlySalesChart from "../../components/dashboard/MonthlySalesChart"
import MonthlyRevenueChart from "../../components/dashboard/MonthlyRevenueChart"
import StatisticsChart from "../../components/dashboard/StatisticsChart"
import RecentOrders from "../../components/dashboard/RecentOrders"
import DemographicCard from "../../components/dashboard/DemographicCard"
import PageMeta from "../../components/common/PageMeta"

export default function Home() {
  return (
    <>
      <PageMeta
        title="Retail Management Dashboard | EasyRetailer"
        description="Dashboard for managing inventory, sales, and employee metrics in EasyRetailer, a retail management system."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* // Mobile-first: Always show key metrics at top */}
        <div className="col-span-1">
          <EcommerceMetrics />
        </div>

        {/* // Mobile-first: Stack charts vertically, show on desktop side-by-side */}
        <div className="col-span-1 lg:col-span-1">
          <MonthlyRevenueChart />
        </div>

        <div className="col-span-1 lg:col-span-1">
          <MonthlySalesChart />
        </div>

        {/* // Mobile-first: Hide StatisticsChart on mobile, show on md+ screens */}
        <div className="hidden md:block col-span-1">
          <StatisticsChart />
        </div>

        {/* // Mobile-first: Hide DemographicCard on mobile, show on lg+ screens */}
        <div className="hidden lg:block col-span-1 lg:col-span-5">
          <DemographicCard />
        </div>

        {/* // Mobile-first: Always show recent orders, adjust column span */}
        <div className="col-span-1 lg:col-span-7">
          <RecentOrders limit={5} />
        </div>
      </div>
    </>
  )
}
