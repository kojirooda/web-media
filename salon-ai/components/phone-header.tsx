"use client";

import { usePathname } from "next/navigation";
import { salonName, today } from "@/lib/demo-data";

const titles: Record<string, string> = {
  "/dashboard": "ダッシュボード",
  "/dashboard/reservations": "予約管理",
  "/dashboard/sns": "SNS管理",
  "/dashboard/karte": "顧客カルテ",
  "/dashboard/reports": "レポート",
};

export function PhoneHeader() {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    (pathname.startsWith("/dashboard/reservations")
      ? "予約管理"
      : "ダッシュボード");

  return (
    <>
      {/* ステータスバー */}
      <div className="flex items-center justify-between bg-navy px-6 pb-1.5 pt-3.5">
        <span className="text-[15px] font-semibold text-white">9:41</span>
        <span className="text-xs tracking-widest text-white">●●● WiFi ▮▮▮</span>
      </div>
      {/* ヘッダー */}
      <div className="bg-navy px-5 pb-4 pt-1.5 text-white">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wide text-gold">
            {salonName}
          </span>
          <span className="text-[11px] text-muted">{today}</span>
        </div>
        <div className="text-xl font-bold tracking-tight">{title}</div>
      </div>
    </>
  );
}
