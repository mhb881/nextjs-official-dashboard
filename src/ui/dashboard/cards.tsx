import {
  BanknoteIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from "lucide-react";
import { fetchCardData } from "~/lib/data";
import { lusitana } from "~/ui/fonts";

const iconMap = {
  collected: BanknoteIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();
  return (
    <>
      {/* NOTE: Uncomment this code in Chapter 9 */}

      <Card title="Collected" value={totalPaidInvoices} type="collected" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card
        title="Total Customers"
        value={numberOfCustomers}
        type="customers"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: "invoices" | "customers" | "pending" | "collected";
}) {
  const Icon = iconMap[type];

  return (
    <div className="group relative rounded-xl border border-gray-200/80 bg-gray-50/80 p-5 shadow-xs transition-all duration-200 hover:border-blue-200 hover:shadow-md active:scale-[0.99]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 sm:text-sm">{title}</span>
        {Icon ? (
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 ring-1 ring-blue-500/10 transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        ) : null}
      </div>
      <p
        className={`${lusitana.className} mt-3 truncate text-2xl font-bold tracking-tight text-gray-900 md:text-3xl`}
      >
        {value}
      </p>
    </div>
  );
}
