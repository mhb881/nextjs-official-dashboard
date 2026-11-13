import Link from "next/link";
import NavLinks from "./nav-links";
import AcmeLogo from "~/ui/acme-logo";
import { Power } from "lucide-react";
import { logout } from "~/lib/actions";

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-3">
      {/* Brand Header: rounded-xl, bg-blue-500, transitions matching page.tsx banner */}
      <Link
        className="group mb-3 flex h-20 items-end justify-start rounded-xl bg-blue-500 p-4 transition-all duration-200 hover:bg-blue-600 hover:shadow-md md:h-40 md:p-6"
        href="/"
      >
        <div className="w-32 text-white transition-transform duration-200 group-hover:scale-[1.02] md:w-40">
          <AcmeLogo />
        </div>
      </Link>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-y-2 md:space-x-0">
        <NavLinks />

        {/* Gray spacer container matching page.tsx card aesthetic */}
        <div className="hidden h-auto w-full grow rounded-xl border-2 border-dashed border-gray-200 bg-gray-100 transition-all duration-200 md:block">
          <p className="hidden h-full items-center justify-center text-center text-gray-400 md:flex">
            弹性空白占位区
          </p>
        </div>

        {/* Sign out button */}
        <form action={logout}>
          <button
            type="submit"
            className="group flex h-[48px] w-full grow cursor-pointer items-center justify-center gap-3 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:shadow-xs active:scale-[0.98] md:flex-none md:justify-start md:px-4"
          >
            <Power className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 group-hover:scale-110 group-hover:text-red-600" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
