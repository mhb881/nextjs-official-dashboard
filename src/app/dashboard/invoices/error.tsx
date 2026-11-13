"use client";

import { useEffect } from "react";
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 打印实际捕获的错误详情到控制台
    console.error("Invoices Route Error Boundary:", error);
  }, [error]);

  return (
    <main className="flex h-[450px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-8 ring-red-50">
        <AlertCircleIcon className="h-6 w-6" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-gray-900 sm:text-xl">
        Something went wrong!
      </h2>

      <p className="mt-1.5 max-w-sm text-xs text-gray-500 sm:text-sm">
        {error.message || "Failed to load invoices. Please check your database connection."}
      </p>

      <button
        type="button"
        className="mt-6 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-blue-600 hover:shadow active:scale-95"
        onClick={() => reset()}
      >
        <RotateCcwIcon className="h-4 w-4" />
        <span>Try again</span>
      </button>
    </main>
  );
}
