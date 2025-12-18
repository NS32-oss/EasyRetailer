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

      <div className="space-y-4 md:space-y-6">
        {/* Key metrics - Always visible */}
        <div>
          <EcommerceMetrics />
        </div>

        {/* Charts section - Mobile: tabs/carousel, Desktop: grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="min-h-[300px]">
            <MonthlyRevenueChart />
          </div>

          <div className="min-h-[300px]">
            <MonthlySalesChart />
          </div>
        </div>

        {/* Statistics and Demographics - Desktop only or collapsible on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="hidden md:block">
            <StatisticsChart />
          </div>

          <div className="hidden lg:block">
            <DemographicCard />
          </div>
        </div>

        {/* Recent orders - Always visible, more prominent on mobile */}
        <div>
          <RecentOrders limit={5} />
        </div>
      </div>
    </>
  )
}
