import { ArrowRight, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AcmeLogo from "~/ui/acme-logo";
import { lusitana } from "~/ui/fonts";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen flex-col p-4 sm:p-6 lg:p-8">
      {/* Top Banner with responsive height & Acme Logo */}
      <div className="flex h-20 shrink-0 items-end rounded-xl bg-blue-500 p-4 transition-all duration-200 sm:h-28 md:h-40 md:p-6 lg:h-48">
        <AcmeLogo />
      </div>

      {/* Main Content: Column on mobile/tablet, Row on md+ */}
      <div className="mt-4 flex grow flex-col gap-4 transition-all duration-200 md:flex-row lg:gap-6">
        {/* Left Intro Card: Solved md breakpoint cramping */}
        <div className="flex flex-col justify-center gap-6 rounded-xl bg-gray-50 px-6 py-8 transition-all duration-200 sm:px-10 sm:py-12 md:w-5/12 md:px-8 lg:w-2/5 lg:px-12 xl:px-16">
          <p
            className={`${lusitana.className} text-lg leading-relaxed text-gray-800 sm:text-xl md:text-2xl md:leading-normal lg:text-3xl`}
          >
            <strong className="text-gray-900">Welcome to Acme.</strong> This is
            the example for the{" "}
            <a
              href="https://nextjs.org/learn/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-500 underline-offset-4 hover:underline"
            >
              Next.js Learn Course
            </a>
            , brought to you by Vercel.
          </p>

          <Link
            href="/login"
            className="group flex items-center gap-4 self-start rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow active:scale-95 sm:px-6 sm:py-3 sm:text-base"
          >
            <span>Log in</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 sm:h-5 sm:w-5" />
          </Link>
        </div>

        {/* Right Hero Image Card: Responsive dual image switching */}
        <div className="flex items-center justify-center rounded-xl bg-gray-50/50 p-6 md:w-7/12 md:px-10 md:py-12 lg:w-3/5 lg:p-12">
          {/* Desktop Hero Image */}
          <Image
            src="/hero-desktop.png"
            width={1000}
            height={760}
            className="hidden rounded-lg shadow-sm transition-opacity duration-200 md:block"
            alt="Screenshots of the dashboard project showing desktop version"
            priority
          />
          {/* Mobile Hero Image */}
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block max-w-sm rounded-lg transition-opacity duration-200 md:hidden"
            alt="Screenshot of the dashboard project showing mobile version"
            priority
          />
        </div>
      </div>
    </main>
  );
}
