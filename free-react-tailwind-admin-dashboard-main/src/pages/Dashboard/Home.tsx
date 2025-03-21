import EcommerceMetrics from "../../components/dashboard/EcommerceMetrics"
import MonthlySalesChart from "../../components/dashboard/MonthlySalesChart";
import MonthlyRevenueChart from "../../components/dashboard/MonthlyRevenueChart";
// import StatisticsChart from "../../components/dashboard/StatisticsChart";
// import MonthlyTarget from "../../components/dashboard/MonthlyTarget";
import RecentOrders from "../../components/dashboard/RecentOrders";
// import DemographicCard from "../../components/dashboard/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
       title="Retail Management Dashboard | EasyRetailer"
        description="Dashboard for managing inventory, sales, and employee metrics in EasyRetailer, a retail management system."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlyRevenueChart />
          
        </div>

        <div className="col-span-12 xl:col-span-5">
        <MonthlySalesChart />
        </div>

        <div className="col-span-12">
          <RecentOrders />
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div> */}

        {/* <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
