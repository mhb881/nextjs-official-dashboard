import { Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { deleteInvoice } from "~/lib/actions";

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="group flex h-10 items-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-blue-600 hover:shadow focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-95"
    >
      <span className="hidden md:block">Create Invoice</span>
      <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-2xs active:scale-95"
    >
      <span className="sr-only">Edit</span>
      <Pencil className="w-4" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);
  return (
    <form
      action={async () => {
        await deleteInvoiceWithId();
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-2xs active:scale-95"
      >
        <span className="sr-only">Delete</span>
        <Trash className="w-4" />
      </button>
    </form>
  );
}
