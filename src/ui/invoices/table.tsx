import Image from "next/image";
import { UpdateInvoice, DeleteInvoice } from "~/ui/invoices/buttons";
import InvoiceStatus from "~/ui/invoices/status";
import { formatDateToLocal, formatCurrency } from "~/lib/utils";
import { fetchFilteredInvoices } from "~/lib/data";

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const invoices = await fetchFilteredInvoices(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-2 shadow-xs md:pt-0">
          <div className="md:hidden">
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-3 w-full rounded-xl border border-gray-200/70 bg-white p-4 shadow-xs transition-all duration-200 hover:border-blue-100 hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={invoice.image_url}
                        className="mr-2 rounded-full ring-1 ring-gray-100"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      />
                      <p className="font-medium text-gray-900">{invoice.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
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
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full text-sm transition-colors duration-200 hover:bg-blue-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="py-3.5 pr-3 pl-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Image
                        src={invoice.image_url}
                        className="rounded-full ring-1 ring-gray-100"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      />
                      <p className="font-medium text-gray-900">{invoice.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-gray-600">
                    {invoice.email}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap font-semibold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-gray-600">
                    {formatDateToLocal(invoice.date)}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className="py-3.5 pr-3 pl-6 whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
