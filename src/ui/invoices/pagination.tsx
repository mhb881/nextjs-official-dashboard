"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { generatePagination } from "~/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

export default function Pagination({ totalPages }: { totalPages: number }) {
  // NOTE: Uncomment this code in Chapter 10

  const pathName = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathName}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <>
      {/*  NOTE: Uncomment this code in Chapter 10 */}

      <div className="inline-flex">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <div className="flex -space-x-px">
          {allPages.map((page, index) => {
            let position: "first" | "last" | "single" | "middle" | undefined;

            if (index === 0) position = "first";
            if (index === allPages.length - 1) position = "last";
            if (allPages.length === 1) position = "single";
            if (page === "...") position = "middle";

            return (
              <PaginationNumber
                key={`${page}-${index}`}
                href={createPageURL(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
}) {
  const className = clsx(
    "flex h-10 w-10 items-center justify-center text-sm border border-gray-200 transition-all duration-200",
    {
      "rounded-l-lg": position === "first" || position === "single",
      "rounded-r-lg": position === "last" || position === "single",
      "z-10 bg-blue-500 border-blue-500 text-white font-semibold shadow-xs": isActive,
      "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95": !isActive && position !== "middle",
      "text-gray-300 pointer-events-none": position === "middle",
    },
  );

  return isActive || position === "middle" ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
}) {
  const className = clsx(
    "flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-all duration-200",
    {
      "pointer-events-none text-gray-300 border-gray-100": isDisabled,
      "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95": !isDisabled,
      "mr-2 md:mr-3": direction === "left",
      "ml-2 md:ml-3": direction === "right",
    },
  );

  const icon =
    direction === "left" ? (
      <ArrowLeftIcon className="w-4" />
    ) : (
      <ArrowRightIcon className="w-4" />
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}
