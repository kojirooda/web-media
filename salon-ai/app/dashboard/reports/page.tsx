import { monthlyReport } from "@/lib/demo-data";

export default function ReportsPage() {
  const { period, metrics, weeklyReservations, savedHours, totalSavedHours } =
    monthlyReport;

  return (
    <div>
      {/* 期間セレクタ */}
      <div className="flex items-center justify-center gap-5 border-b border-line bg-white px-4 py-3.5">
        <span className="cursor-pointer text-2xl leading-none text-muted">‹</span>
        <span className="text-base font-bold text-navy">{period}</span>
        <span className="cursor-pointer text-2xl leading-none text-muted">›</span>
      </div>

      <div className="pb-4">
        {/* メトリクス */}
        <div className="mx-4 mt-2.5 flex gap-2.5">
          <MetricCard title="月間予約数" value={String(metrics.reservations.value)} diff={metrics.reservations.diff} up />
          <MetricCard title="リピート率" value={`${metrics.repeatRate.value}%`} diff={metrics.repeatRate.diff} up />
        </div>
        <div className="mx-4 mt-2.5 flex gap-2.5">
          <MetricCard title="AI自動受付" value={String(metrics.aiIntake.value)} diff={metrics.aiIntake.diff} />
          <MetricCard title="フォロワー数" value={metrics.followers.value.toLocaleString()} diff={metrics.followers.diff} up />
        </div>

        {/* 週別予約数 */}
        <div className="mx-4 mt-2.5 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="mb-3.5 text-xs font-semibold text-muted">週別予約数（今月）</div>
          {weeklyReservations.map((w) => (
            <Bar key={w.label} label={w.label} value={`${w.count}件`} pct={w.pct} faint={w.faint} />
          ))}
        </div>

        {/* 削減時間 */}
        <div className="mx-4 mt-2.5 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="mb-3.5 text-xs font-semibold text-muted">
            AI自動化による削減時間（今月）
          </div>
          {savedHours.map((s) => (
            <Bar key={s.label} label={s.label} value={`-${s.hours}h`} pct={s.pct} navy />
          ))}
          <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-muted">合計削減時間（今月）</span>
            <span className="text-[22px] font-extrabold text-navy">{totalSavedHours}h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  diff,
  up,
}: {
  title: string;
  value: string;
  diff: string;
  up?: boolean;
}) {
  return (
    <div className="flex-1 rounded-2xl bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="mb-1.5 text-[11px] text-muted">{title}</div>
      <div className="mb-1 text-[26px] font-extrabold text-navy">{value}</div>
      <div className={`text-[11px] font-semibold ${up ? "text-success" : "text-muted"}`}>
        {up ? "↑ " : ""}
        {diff}
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  pct,
  navy,
  faint,
}: {
  label: string;
  value: string;
  pct: number;
  navy?: boolean;
  faint?: boolean;
}) {
  const fill = faint ? "bg-[#c9a96e66]" : navy ? "bg-navy" : "bg-gold";
  return (
    <div className="mb-2.5">
      <div className="mb-1.5 flex justify-between text-[11px]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-md bg-salonbg">
        <div className={`h-full rounded-md ${fill}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
