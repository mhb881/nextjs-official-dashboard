// app/dashboard/invoices/page.tsx

import { lusitana } from "~/ui/fonts";
export default function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Invoices
      </h1>
    </main>
  );
}
