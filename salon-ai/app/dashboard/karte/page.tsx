import { karteEntries } from "@/lib/demo-data";
import type { KarteEntry } from "@/lib/types";

export default function KartePage() {
  return (
    <div>
      <div className="border-b border-line bg-white px-4 py-3">
        <div className="text-[13px] text-muted">
          本日来店予定 <strong className="text-navy">{karteEntries.length}名</strong>
        </div>
      </div>
      <div className="py-2.5 pb-4">
        {karteEntries.map((e) => (
          <KarteCard key={e.customer.id} entry={e} />
        ))}
      </div>
    </div>
  );
}

function KarteCard({ entry }: { entry: KarteEntry }) {
  const { customer, todayReservation, history, aiSuggestion } = entry;
  const time = todayReservation.startsAt.slice(11, 16);
  const initial = customer.name.charAt(0);

  return (
    <div className="mx-4 my-2.5 overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 bg-navy px-4 py-3.5 text-white">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold text-base font-extrabold">
          {initial}
        </div>
        <div>
          <div className="mb-0.5 text-base font-bold">
            {customer.name} 様{customer.isNew ? " 🆕" : ""}
          </div>
          <div className="text-[11px] text-gold">
            {time} · {todayReservation.menu} · {todayReservation.durationMin}分
          </div>
        </div>
      </div>
      <div className="px-4 py-3.5">
        {customer.isNew ? (
          <KarteRow label="来店歴" value="初回" />
        ) : (
          <KarteRow label="来店回数" value={`${customer.visitCount}回`} />
        )}
        {history.length > 0 && (
          <KarteRow
            label="前回施術"
            value={`${history[0].menu}（${history[0].details}）`}
          />
        )}
        {customer.preferences && (
          <KarteRow label="お好み" value={customer.preferences} />
        )}
        {customer.ngNotes && (
          <div className="mt-1.5 rounded-lg bg-[#fff2f2] px-3 py-2 text-[11px] font-semibold text-danger">
            ⚠ NG: {customer.ngNotes}
          </div>
        )}
        <div className="mt-2.5 rounded-xl border border-[#c9a96e38] bg-gradient-to-br from-[#c9a96e14] to-[#c9a96e06] px-3 py-2.5">
          <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-gold">
            AI 提案
          </div>
          <div className="text-xs leading-relaxed text-[#7a6540]">{aiSuggestion}</div>
        </div>
      </div>
    </div>
  );
}

function KarteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex gap-2.5">
      <span className="min-w-[60px] pt-px text-[11px] text-muted">{label}</span>
      <span className="flex-1 text-xs leading-relaxed">{value}</span>
    </div>
  );
}
