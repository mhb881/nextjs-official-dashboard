"use client";

import { Files, Home, UserGroup } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/dashboard", icon: Home },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: Files,
  },
  { name: "Customers", href: "/dashboard/customers", icon: UserGroup },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "group flex h-[48px] grow items-center justify-center gap-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 md:flex-none md:justify-start md:px-4",
              isActive
                ? "bg-blue-50 font-semibold text-blue-600 shadow-xs"
                : "bg-gray-50 text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 hover:shadow-xs",
            )}
          >
            <LinkIcon
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 group-hover:text-blue-600",
              )}
            />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
