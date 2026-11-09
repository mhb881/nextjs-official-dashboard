import { generateYAxis } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { lusitana } from "~/ui/fonts";
import { fetchRevenue } from "~/lib/data";

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

// 改为异步组件，移除 props
export default async function RevenueChart({}) {
  // NOTE: Uncomment this code in Chapter 7
  const revenue = await fetchRevenue(); // 在组件内部直接拉取数据
  const chartHeight = 350;

  const { yAxisLabels, topLabel } = generateYAxis(revenue);

  if (!revenue || revenue.length === 0) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Recent Revenue
        </h2>
        <div className="flex h-[380px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
          <CalendarIcon className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">No revenue data available.</p>
          <p className="mt-1 text-xs text-gray-400">
            Revenue trends will appear here once invoices are paid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>
      <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 shadow-xs">
        <div className="mt-0 grid grid-cols-12 items-end gap-2 rounded-lg border border-gray-100 bg-white p-4 shadow-xs sm:grid-cols-13 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {revenue.map((month) => (
            <div key={month.month} className="group/bar relative flex flex-col items-center gap-2">
              <span className="pointer-events-none absolute -top-8 z-10 rounded-md bg-gray-900 px-2 py-0.5 text-xs text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/bar:opacity-100">
                ${(month.revenue / 1000).toFixed(1)}k
              </span>
              <div
                className="w-full rounded-t-md bg-blue-400/80 transition-all duration-200 hover:bg-blue-600 hover:shadow-xs"
                style={{
                  height: `${(chartHeight / topLabel) * month.revenue}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 transition-colors duration-200 group-hover/bar:font-medium group-hover/bar:text-blue-600 sm:rotate-0">
                {month.month}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pt-6 pb-2 text-gray-500">
          <CalendarIcon className="h-5 w-5" />
          <h3 className="ml-2 text-sm">Last 12 months</h3>
        </div>
      </div>
    </div>
  );
}
