"use client";

import { useState } from "react";
import {
  todayReservations,
  tomorrowReservations,
  weekReservationCounts,
  aiReplyLog,
  dmInbox,
} from "@/lib/demo-data";
import { ApptCard } from "@/components/ui";

type Tab = "today" | "tomorrow" | "week" | "dm";

export default function ReservationsPage() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div>
      {/* タブ */}
      <div className="flex border-b border-line bg-white px-3">
        <TabBtn active={tab === "today"} onClick={() => setTab("today")}>
          今日
        </TabBtn>
        <TabBtn active={tab === "tomorrow"} onClick={() => setTab("tomorrow")}>
          明日
        </TabBtn>
        <TabBtn active={tab === "week"} onClick={() => setTab("week")}>
          今週
        </TabBtn>
        <TabBtn active={tab === "dm"} onClick={() => setTab("dm")}>
          DM <span className="font-extrabold text-danger">{dmInbox.length}</span>
        </TabBtn>
      </div>

      {tab === "today" && (
        <div className="py-3">
          {todayReservations.map((r) => (
            <ApptCard key={r.id} r={r} />
          ))}
          <div className="px-4 pt-1">
            <div className="rounded-xl bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="mb-2 text-[11px] font-semibold text-muted">
                📋 AI自動返信ログ（本日）
              </div>
              <div className="text-[11px] leading-loose text-[#666]">
                {aiReplyLog.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "tomorrow" && (
        <div className="py-3">
          {tomorrowReservations.map((r) => (
            <ApptCard key={r.id} r={r} />
          ))}
        </div>
      )}

      {tab === "week" && (
        <div className="py-3">
          <div className="py-2 text-center text-[13px] text-muted">
            今週の予約合計
            <span className="block text-[28px] font-extrabold leading-tight text-navy">
              18件
            </span>
          </div>
          <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex border-b border-line">
              {weekReservationCounts.map((d) => (
                <div
                  key={d.label}
                  className={`flex-1 py-2.5 text-center text-xs font-semibold ${
                    d.today ? "bg-[#c9a96e11] text-gold" : "text-navy"
                  }`}
                >
                  {d.label}
                </div>
              ))}
            </div>
            <div className="flex">
              {weekReservationCounts.map((d) => (
                <div
                  key={d.label}
                  className={`flex-1 py-2.5 text-center ${d.today ? "bg-[#c9a96e11]" : ""}`}
                >
                  <div className={`text-xl font-extrabold ${d.today ? "text-gold" : "text-navy"}`}>
                    {d.count}
                  </div>
                  <div className="text-[10px] text-muted">件</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "dm" && (
        <div className="py-3">
          {dmInbox.map((dm) => (
            <div
              key={dm.id}
              className="mx-4 mb-2 rounded-2xl border border-[#ffd8d8] bg-[#fff8f8] p-3.5"
            >
              <div className="mb-1.5 text-[10px] font-extrabold text-danger">
                ⚠ AIが転送 · {dm.channel === "instagram" ? "Instagram" : "LINE"}
              </div>
              <div className="mb-1 text-sm font-bold">{dm.sender} 様 より</div>
              <div className="mb-3 text-xs leading-relaxed text-[#555]">
                「{dm.message}」
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl bg-navy py-2.5 text-xs font-bold text-white">
                  返信する
                </button>
                <button className="rounded-xl border-[1.5px] border-line bg-white px-4 py-2.5 text-xs font-semibold text-navy">
                  後で対応
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex-1 border-b-2 py-3 text-center text-xs ${
        active
          ? "border-gold font-bold text-navy"
          : "border-transparent text-muted"
      }`}
    >
      {children}
    </button>
  );
}
