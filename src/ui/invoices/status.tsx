import { Check, Clock } from "lucide-react";
import clsx from "clsx";

export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        {
          "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20": status === "pending",
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20": status === "paid",
        },
      )}
    >
      {status === "pending" ? (
        <>
          Pending
          <Clock className="h-3.5 w-3.5 text-amber-600" />
        </>
      ) : null}
      {status === "paid" ? (
        <>
          Paid
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        </>
      ) : null}
    </span>
  );
}
