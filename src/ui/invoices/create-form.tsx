"use client";

import { CustomerField } from "~/lib/types";
import Link from "next/link";
import {
  CheckIcon,
  ClockIcon,
  CircleDollarSignIcon,
  UserCircleIcon,
  ArrowRightIcon,
  AlertCircleIcon,
} from "lucide-react";
import { createInvoice, InvoiceState } from "~/lib/actions";
import { useActionState, useEffect } from "react";

export default function Form({ customers }: { customers: CustomerField[] }) {
  const initialState: InvoiceState = {
    ok: false,
    errors: {},
    message: null,
  };
  const [state, formAction, isPending] = useActionState(
    createInvoice,
    initialState,
  );

  return (
    <form action={formAction}>
      <div className="space-y-5 rounded-xl border border-gray-200/80 bg-gray-50/80 p-5 shadow-xs md:p-6">
        {/* 全局错误提示 */}
        {state.message && (
          <div
            aria-live="polite"
            aria-atomic="true"
            className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 shadow-2xs sm:text-sm"
          >
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-500" />
            <p className="font-medium">{state.message}</p>
          </div>
        )}

        {/* Customer Name */}
        <div>
          <label
            htmlFor="customer"
            className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
          >
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 pr-8 pl-10 text-sm shadow-xs transition-all duration-200 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              defaultValue=""
              aria-describedby="customer-error"
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-200 peer-focus:text-blue-600" />
          </div>

          {/* 客户下拉错误映射 */}
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.customerId?.map((error: string) => (
              <div
                key={error}
                className="mt-2 flex items-center gap-1.5 rounded-md border border-red-200/60 bg-red-50/80 px-2.5 py-1 text-xs font-medium text-red-600"
              >
                <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Amount */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
          >
            Choose an amount
          </label>
          <div className="relative">
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="Enter USD amount"
              aria-describedby="amount-error"
              className="peer block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 font-mono text-sm shadow-xs transition-all duration-200 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <CircleDollarSignIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-200 peer-focus:text-blue-600" />
          </div>

          {/* 金额字段错误映射 */}
          <div id="amount-error" aria-live="polite" aria-atomic="true">
            {state.errors?.amount?.map((error: string) => (
              <div
                key={error}
                className="mt-2 flex items-center gap-1.5 rounded-md border border-red-200/60 bg-red-50/80 px-2.5 py-1 text-xs font-medium text-red-600"
              >
                <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset aria-describedby="status-error">
          <legend className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm">
            Set the invoice status
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Pending 选项卡片 */}
            <label
              htmlFor="pending"
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-xs transition-all duration-200 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-xs active:scale-[0.99] has-checked:border-amber-300 has-checked:bg-amber-50/60 has-checked:ring-1 has-checked:ring-amber-400/30"
            >
              <div className="flex items-center gap-3">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500/30"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-amber-900 group-has-checked:font-semibold group-has-checked:text-amber-950">
                  Pending
                </span>
              </div>
              <div className="rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors duration-200 group-hover:bg-amber-100 group-hover:text-amber-700 group-has-checked:bg-amber-100 group-has-checked:text-amber-700">
                <ClockIcon className="h-4 w-4" />
              </div>
            </label>

            {/* Paid 选项卡片 */}
            <label
              htmlFor="paid"
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-xs transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-xs active:scale-[0.99] has-checked:border-emerald-300 has-checked:bg-emerald-50/60 has-checked:ring-1 has-checked:ring-emerald-400/30"
            >
              <div className="flex items-center gap-3">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500/30"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-900 group-has-checked:font-semibold group-has-checked:text-emerald-950">
                  Paid
                </span>
              </div>
              <div className="rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors duration-200 group-hover:bg-emerald-100 group-hover:text-emerald-700 group-has-checked:bg-emerald-100 group-has-checked:text-emerald-700">
                <CheckIcon className="h-4 w-4" />
              </div>
            </label>
          </div>

          {/* 状态字段错误映射 */}
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status?.map((error: string) => (
              <div
                key={error}
                className="mt-2 flex items-center gap-1.5 rounded-md border border-red-200/60 bg-red-50/80 px-2.5 py-1 text-xs font-medium text-red-600"
              >
                <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* 底部按钮栏 */}
      <div className={`mt-6 flex justify-end gap-3`}>
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-2xs transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 active:scale-95"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="group flex h-10 items-center gap-2 rounded-lg bg-blue-500 px-5 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-blue-600 hover:shadow active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create invoice</span>
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
