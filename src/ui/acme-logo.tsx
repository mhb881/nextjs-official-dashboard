import { lusitana } from "./fonts";
import { Globe } from "lucide-react";

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center gap-2 leading-none text-white`}
    >
      <Globe className="h-8 w-8 rotate-15 transition-transform duration-200 md:h-12 md:w-12" />
      <span className="text-3xl tracking-tight md:text-5xl">Acme</span>
    </div>
  );
}
