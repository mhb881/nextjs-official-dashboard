import { ArrowUpIcon } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { lusitana } from "~/ui/fonts";
import { fetchLatestInvoices } from "~/lib/data";

export default async function LatestInvoices({}) {
  const latestInvoices = await fetchLatestInvoices();

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Invoices
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 shadow-xs">
        <div className="rounded-lg border border-gray-100 bg-white p-2 shadow-xs">
          {latestInvoices.map((invoice, i) => {
            return (
              <div
                key={invoice.id}
                className={clsx(
                  "group/item flex flex-row items-center justify-between rounded-lg p-3 transition-colors duration-200 hover:bg-blue-50/50",
                  {
                    "border-t border-gray-100": i !== 0,
                  },
                )}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={invoice.image_url}
                    alt={`${invoice.name}'s profile picture`}
                    className="rounded-full ring-2 ring-gray-100 transition-all duration-200 group-hover/item:ring-blue-200"
                    width={36}
                    height={36}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800 transition-colors duration-200 group-hover/item:text-blue-600 md:text-base">
                      {invoice.name}
                    </p>
                    <p className="hidden text-xs text-gray-500 sm:block">
                      {invoice.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate rounded-lg px-3 py-1 text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover/item:text-blue-600 md:text-base`}
                >
                  {invoice.amount}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pt-4 pb-1 text-gray-500">
          <ArrowUpIcon className="h-4 w-4" />
          <h3 className="ml-2 text-xs sm:text-sm">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
