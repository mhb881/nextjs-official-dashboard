// Loading animation
const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl border border-gray-200/80 bg-gray-50/80 p-5 shadow-xs`}
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 rounded-md bg-gray-200" />
        <div className="h-8 w-8 rounded-lg bg-gray-200" />
      </div>
      <div className="mt-4 h-8 w-28 rounded-md bg-gray-200" />
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 shadow-xs">
        <div className="mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-lg border border-gray-100 bg-white p-4 sm:grid-cols-13 md:gap-4" />
        <div className="flex items-center pt-6 pb-2">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 shadow-xs">
        <div className="rounded-lg border border-gray-100 bg-white p-2">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pt-4 pb-1">
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="w-full text-sm [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Customer Name and Image */}
      <td className="py-3.5 pr-3 pl-6 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-gray-100"></div>
          <div className="h-5 w-24 rounded bg-gray-100"></div>
        </div>
      </td>
      {/* Email */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        <div className="h-5 w-32 rounded bg-gray-100"></div>
      </td>
      {/* Amount */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        <div className="h-5 w-20 rounded bg-gray-100"></div>
      </td>
      {/* Date */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        <div className="h-5 w-20 rounded bg-gray-100"></div>
      </td>
      {/* Status */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        <div className="h-6 w-[76px] rounded-full bg-gray-100"></div>
      </td>
      {/* Actions */}
      <td className="py-3.5 pr-3 pl-6 whitespace-nowrap">
        <div className="flex justify-end gap-2">
          <div className="h-[34px] w-[34px] rounded-lg bg-gray-100"></div>
          <div className="h-[34px] w-[34px] rounded-lg bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function InvoicesMobileSkeleton() {
  return (
    <div className="mb-3 w-full rounded-xl border border-gray-200/70 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <div className="mb-2 flex items-center">
            <div className="mr-2 h-7 w-7 rounded-full bg-gray-100"></div>
            <div className="h-5 w-24 rounded bg-gray-100"></div>
          </div>
          <div className="h-4 w-32 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-16 rounded-full bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-3">
        <div>
          <div className="h-6 w-20 rounded bg-gray-100"></div>
          <div className="mt-1 h-4 w-16 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-[34px] w-[34px] rounded-lg bg-gray-100"></div>
          <div className="h-[34px] w-[34px] rounded-lg bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className={`${shimmer} relative mt-6 flow-root overflow-hidden`}>
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-2 shadow-xs md:pt-0">
          <div className="md:hidden">
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-4 sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-4">
                  Email
                </th>
                <th scope="col" className="px-3 py-4">
                  Amount
                </th>
                <th scope="col" className="px-3 py-4">
                  Date
                </th>
                <th scope="col" className="px-3 py-4">
                  Status
                </th>
                <th scope="col" className="relative py-3 pr-3 pl-6">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
