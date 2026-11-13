import SideNav from "~/ui/dashboard/sidenav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-slate-50/50 md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-4 sm:p-6 md:overflow-y-auto md:p-8">
        {children}
      </div>
    </div>
  );
}
