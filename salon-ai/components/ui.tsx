// 画面共通の小さなUI部品

import type { Reservation } from "@/lib/types";

export function ApptCard({ r }: { r: Reservation }) {
  const time = r.startsAt.slice(11, 16);
  const isAi = r.source === "line_ai";
  const badge =
    r.status === "pending"
      ? { text: "未確定", cls: "bg-[#fff3e8] text-warning" }
      : isAi
        ? { text: "AI受付", cls: "bg-[#e8f0ff] text-[#5b7fe0]" }
        : { text: "確定", cls: "bg-[#e8f5ee] text-[#3a9e70]" };

  return (
    <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="text-center">
        <div className="min-w-[42px] text-sm font-extrabold text-navy">{time}</div>
        <div className="text-[10px] text-muted">{r.durationMin}分</div>
      </div>
      <div className="h-9 w-px bg-line" />
      <div className="flex-1">
        <div className="mb-0.5 text-sm font-semibold">
          {r.customerName} 様{r.source === "line_ai" && r.id === "r4" ? " 🆕" : ""}
        </div>
        <div className="text-[11px] text-muted">
          {r.menu}
          {r.staffName ? ` · 担当: ${r.staffName}` : ""}
        </div>
      </div>
      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}>
        {badge.text}
      </span>
    </div>
  );
}

export function SectionHeader({
  title,
  link,
}: {
  title: string;
  link?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between px-4">
      <span className="text-sm font-bold text-navy">{title}</span>
      {link}
    </div>
  );
}
