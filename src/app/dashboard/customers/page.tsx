// app/dashboard/customers/page.tsx

import { lusitana } from "~/ui/fonts";

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Customers
      </h1>
    </main>
  );
}
