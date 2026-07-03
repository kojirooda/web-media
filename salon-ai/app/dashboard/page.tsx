import Link from "next/link";
import { summary, todayReservations } from "@/lib/demo-data";
import { ApptCard, SectionHeader } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="pt-3.5">
      {/* アラートバナー */}
      <div className="mx-4 mb-2 flex items-center gap-2 rounded-r-xl border-l-[3px] border-gold bg-gradient-to-r from-[#c9a96e22] to-[#c9a96e0a] px-3 py-2.5">
        <span className="text-lg">📸</span>
        <span className="flex-1 text-xs font-medium text-[#7a6540]">
          今週のSNS投稿承認が
          {summary.postsThisWeek.total - summary.postsThisWeek.approved}件あります
        </span>
        <Link
          href="/dashboard/sns"
          className="whitespace-nowrap rounded-full bg-gold px-2.5 py-1.5 text-[11px] font-bold text-white"
        >
          確認する
        </Link>
      </div>

      {/* KPI */}
      <div className="flex gap-2.5 px-4 pb-3.5 pt-1.5">
        <KpiCard label="今日の予約" value={String(summary.todayReservations)} sub="件" />
        <KpiCard label="未対応DM" value={String(summary.unhandledDm)} sub="要対応" tone="danger" />
        <KpiCard
          label="今週投稿"
          value={`${summary.postsThisWeek.approved}/${summary.postsThisWeek.total}`}
          sub="承認待ち"
          tone="gold"
        />
      </div>

      {/* 今日の予約 */}
      <div className="mb-4">
        <SectionHeader
          title="今日の予約"
          link={
            <Link href="/dashboard/reservations" className="text-xs text-gold">
              すべて見る →
            </Link>
          }
        />
        {todayReservations.map((r) => (
          <ApptCard key={r.id} r={r} />
        ))}
      </div>

      {/* 要対応アクション */}
      <div className="mb-4">
        <SectionHeader title="要対応アクション" />
        <ActionCard
          href="/dashboard/reservations"
          icon="📩"
          tone="orange"
          title={`未対応DM が ${summary.unhandledDm}件あります`}
          desc="複雑な質問のためAIが転送しました"
        />
        <ActionCard
          href="/dashboard/sns"
          icon="📸"
          tone="blue"
          title="SNS投稿の承認（水・木）"
          desc="投稿案が準備できています"
        />
        <ActionCard
          href="/dashboard"
          icon="💌"
          tone="green"
          title={`リピートフォロー 自動送信 ${summary.followUpsScheduled}件`}
          desc="本日 12:00 に自動送信されます"
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "gold" | "danger";
}) {
  const color =
    tone === "gold" ? "text-gold" : tone === "danger" ? "text-danger" : "text-navy";
  return (
    <div className="flex-1 rounded-2xl bg-white px-2 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="mb-1 text-[10px] text-muted">{label}</div>
      <div className={`text-[26px] font-extrabold leading-none ${color}`}>{value}</div>
      <div className="mt-0.5 text-[9px] text-muted">{sub}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  tone,
  title,
  desc,
}: {
  href: string;
  icon: string;
  tone: "blue" | "green" | "orange";
  title: string;
  desc: string;
}) {
  const bg =
    tone === "blue" ? "bg-[#eef2ff]" : tone === "green" ? "bg-[#edf8f3]" : "bg-[#fff5ec]";
  return (
    <Link
      href={href}
      className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
    >
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg ${bg}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="mb-0.5 text-[13px] font-semibold">{title}</div>
        <div className="text-[11px] text-muted">{desc}</div>
      </div>
      <span className="text-lg text-muted">›</span>
    </Link>
  );
}
