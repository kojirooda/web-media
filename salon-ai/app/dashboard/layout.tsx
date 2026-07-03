import { BottomNav } from "@/components/bottom-nav";
import { PhoneHeader } from "@/components/phone-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-start justify-center py-6">
      {/* スマホ筐体 */}
      <div className="relative flex min-h-[844px] w-[390px] flex-col overflow-hidden rounded-[44px] bg-salonbg shadow-[0_30px_80px_rgba(0,0,0,0.35),0_0_0_10px_#111]">
        <PhoneHeader />
        <main className="no-scrollbar flex-1 overflow-y-auto pb-[72px]">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
