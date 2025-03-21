import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
// import { Dropdown } from "../ui/dropdown/Dropdown";
// import { DropdownItem } from "../ui/dropdown/DropdownItem";
// import { MoreDotIcon } from "../../icons";
import ChartTab from "../common/ChartTab";
// import { useToast } from "@/components/ui/use-toast";

export default function MonthlyRevenueChart() {
  // const { toast } = useToast();
  const [seriesData, setSeriesData] = useState<number[]>([]);

  const fetchMonthlyRevenue = async () => {
    try {
      // Calculate dynamic startDate and endDate for the current month
      const now = new Date();
      // First day of the current month
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      // Last day of the current month
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Format dates as "YYYY-MM-DD"
      const startDate = start.toISOString().split("T")[0];
      const endDate = end.toISOString().split("T")[0];

      // Build URL with query parameters
      const url = new URL("http://localhost:8000/api/v1/statistics");
      url.searchParams.append("startDate", startDate);
      url.searchParams.append("endDate", endDate);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch monthly revenue data");
      }

      const jsonData = await response.json();
      if (jsonData.data && jsonData.data.length > 0) {
        const monthlyRevenue = jsonData.data[0].totalRevenue;
        setSeriesData([monthlyRevenue]);
      } else {
        setSeriesData([0]);
      }
    } catch (error) {
      console.error("Error fetching monthly revenue data:", error);
    }
  };

  useEffect(() => {
    fetchMonthlyRevenue();
  }, []);

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
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
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
  };

  const series = [
    {
      name: "Revenue",
      data:
        seriesData.length > 0
          ? seriesData
          : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Revenue
        </h3>
        <div className="relative inline-block">
          {/* <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button> */}
          
        </div>
        <ChartTab />
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
