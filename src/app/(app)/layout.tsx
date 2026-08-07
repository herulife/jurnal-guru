import Sidebar from "@/components/Sidebar";
import UpgradeBanner from "@/components/UpgradeBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:ml-64 transition-all duration-300 min-h-screen">
        {children}
      </main>
      <UpgradeBanner />
    </div>
  );
}
