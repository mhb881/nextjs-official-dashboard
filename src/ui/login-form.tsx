"use client";

import { lusitana } from "~/ui/fonts";
import {
  AtSignIcon,
  KeyIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { authenticate, LoginState } from "~/lib/actions";
import { useActionState, useState } from "react";

const initialState: LoginState = {
  ok: false,
  errors: {},
  message: "",
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const handleFillDemo = () => {
    setEmailValue("user@email.com");
    setPasswordValue("12345");
  };

  return (
    <form action={formAction} className="space-y-4">
      <div className="relative space-y-5 overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
        <div>
          <h1
            className={`${lusitana.className} text-xl font-bold tracking-tight text-gray-900 sm:text-2xl`}
          >
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Please log in with your credentials to access your dashboard.
          </p>
        </div>

        {/* 全局错误提示条 */}
        {state.message && (
          <div
            aria-live="polite"
            aria-atomic="true"
            className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700 shadow-2xs sm:text-sm"
          >
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-500" />
            <p className="font-medium">{state.message}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Email 字段 */}
          <div>
            <label
              className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
              htmlFor="email"
            >
              Email address
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-10 text-sm shadow-xs transition-all duration-200 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                id="email"
                type="email"
                name="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="Enter your email address"
                required
              />
              <AtSignIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-200 peer-focus:text-blue-600" />
            </div>
            {state.errors?.email && (
              <div className="mt-1.5 text-xs text-red-600">
                {state.errors.email.join(", ")}
              </div>
            )}
          </div>

          {/* Password 字段 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                className="block text-xs font-semibold text-gray-700 sm:text-sm"
                htmlFor="password"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-10 pl-10 font-mono text-sm shadow-xs transition-all duration-200 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="Enter password"
                required
                minLength={5}
              />
              <KeyIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-200 peer-focus:text-blue-600" />

              {/* 明密文切换眼睛图标 */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {state.errors?.password && (
              <div className="mt-1.5 text-xs text-red-600">
                {state.errors.password.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* 用于服务端获取 callbackUrl */}
        <input type="hidden" name="redirectTo" value={callbackUrl} />

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isPending}
          className="group relative mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-4 w-4 animate-spin text-white" />
              <span>Signing in...</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <span>Sign in</span>
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          )}
        </button>

        {/* Demo 账号快速填入胶囊卡片 */}
        <div className="border-t border-gray-100 pt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-700">Demo Credentials</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Quick fill
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gray-50/80 p-2.5 font-mono text-xs text-gray-600">
            <div className="mr-2 truncate">
              <span className="text-gray-400">email:</span>{" "}
              <span className="font-semibold text-gray-900">
                user@email.com
              </span>
              <span className="mx-1.5 text-gray-300">|</span>
              <span className="text-gray-400">pwd:</span>{" "}
              <span className="font-semibold text-gray-900">12345</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 font-sans text-xs text-blue-600 shadow-2xs hover:bg-blue-50"
            >
              <SparklesIcon className="h-3 w-3" />
              <span>Fill</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
