import { Suspense } from "react";
import LoginForm from "~/ui/login-form";
import AcmeLogo from "~/ui/acme-logo";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-blue-50/40 p-4 sm:p-5 md:p-6">
      {/* 柔和背景环境光 */}
      <div className="pointer-events-none absolute -top-32 -left-32 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[420px] flex-col space-y-4">
        {/* 返回首页链接 */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to home</span>
          </Link>
          <span className="text-xs font-medium text-gray-400">
            Secure Portal
          </span>
        </div>

        {/* 顶部 Acme 品牌 Banner */}
        <div className="relative flex h-24 w-full items-end justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-4 shadow-lg shadow-blue-500/15 sm:h-28 sm:p-5">
          <div className="pointer-events-none absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
          <span className="rounded-lg border border-white/15 bg-white/15 px-2.5 py-1 text-xs font-medium text-blue-50 backdrop-blur-md">
            v2.0
          </span>
        </div>

        {/* 表单主体 */}
        <Suspense
          fallback={
            <div className="flex h-80 w-full animate-pulse items-center justify-center rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl">
              <span className="text-sm font-medium text-gray-400">
                Loading login form...
              </span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
