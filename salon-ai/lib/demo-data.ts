// Phase 1 デモデータ。Phase 2 でSupabaseからの取得に置き換える。
// 日付は基準日 2026-03-17（火）を想定した固定表示用。

import type {
  Customer,
  Reservation,
  SocialPost,
  DmItem,
  DashboardSummary,
  KarteEntry,
} from "./types";

export const salonName = "hair salon ○○";
export const today = "2026年3月17日（火）";

export const summary: DashboardSummary = {
  todayReservations: 4,
  unhandledDm: 2,
  postsThisWeek: { approved: 5, total: 7 },
  followUpsScheduled: 5,
};

export const todayReservations: Reservation[] = [
  { id: "r1", customerName: "田中 恵", staffName: "佐藤", menu: "カット + カラー", durationMin: 60, startsAt: "2026-03-17T10:00", status: "confirmed", source: "manual" },
  { id: "r2", customerName: "伊藤 玲子", staffName: "中村", menu: "カット", durationMin: 45, startsAt: "2026-03-17T11:30", status: "confirmed", source: "manual" },
  { id: "r3", customerName: "山本 さくら", staffName: "佐藤", menu: "縮毛矯正", durationMin: 90, startsAt: "2026-03-17T13:00", status: "confirmed", source: "manual" },
  { id: "r4", customerName: "鈴木 美咲", menu: "カット（初回）", durationMin: 45, startsAt: "2026-03-17T15:30", status: "confirmed", source: "line_ai" },
];

export const tomorrowReservations: Reservation[] = [
  { id: "r5", customerName: "佐々木 和子", staffName: "佐藤", menu: "パーマ", durationMin: 60, startsAt: "2026-03-18T11:00", status: "confirmed", source: "line_ai" },
  { id: "r6", customerName: "加藤 麻衣", menu: "カット + トリートメント", durationMin: 60, startsAt: "2026-03-18T14:00", status: "pending", source: "line_ai" },
];

export const weekReservationCounts = [
  { label: "月", count: 3, today: false },
  { label: "火", count: 4, today: true },
  { label: "水", count: 2, today: false },
  { label: "木", count: 3, today: false },
  { label: "金", count: 2, today: false },
  { label: "土", count: 4, today: false },
];

export const aiReplyLog = [
  "09:12 — 鈴木様の予約をAIが自動受付",
  "08:45 — 予約リマインドを3名に自動送信",
  "08:00 — 前日確認メッセージを2名に送信",
];

export const dmInbox: DmItem[] = [
  {
    id: "d1",
    sender: "西村 優子",
    channel: "instagram",
    message: "カラーをしたいのですが、以前他のサロンでかぶれた経験があります。パッチテストはできますか？",
    category: "escalate",
    handled: false,
  },
  {
    id: "d2",
    sender: "中島 あかね",
    channel: "instagram",
    message: "来年5月に結婚式があります。ブライダルヘアのご相談はできますか？料金も教えていただきたいです",
    category: "escalate",
    handled: false,
  },
];

export const socialPosts: SocialPost[] = [
  {
    id: "p1",
    platform: "instagram",
    day: "水 3/18",
    emoji: "✂️",
    status: "draft",
    caption:
      "くせ毛でお悩みだったお客様。縮毛矯正＋毛先カールで、やわらかいストレートに仕上げました。梅雨の季節も毎朝のスタイリングがぐっと楽になります ☁\n\n▷ご予約はプロフィールのLINEから\n#縮毛矯正 #くせ毛 #美容室〇〇",
  },
  {
    id: "p2",
    platform: "instagram",
    day: "木 3/19",
    emoji: "🌸",
    status: "draft",
    caption:
      "春のおすすめカラー特集。ブリーチなしで透明感を出せるアッシュブラウンが今季人気です。ダメージが気になる方にもおすすめ 🍀\n\n▷ご予約はプロフィールのLINEから\n#春カラー #アッシュブラウン #美容室〇〇",
  },
  { id: "p3", platform: "instagram", day: "月 3/16", status: "posted", engagement: { likes: 42, comments: 3, reach: 312 } },
  { id: "p4", platform: "instagram", day: "火 3/17", status: "posted", engagement: { likes: 67, comments: 8, reach: 489 } },
];

const tanaka: Customer = {
  id: "c1",
  name: "田中 恵",
  visitCount: 12,
  firstVisitAt: "2023-11-01",
  preferences: "ナチュラル・細めのハイライト・透明感重視",
  ngNotes: "強い香りのトリートメント",
};

const suzuki: Customer = {
  id: "c2",
  name: "鈴木 美咲",
  visitCount: 0,
  isNew: true,
  preferences: "肩上のボブ、軽め仕上げ希望",
};

export const karteEntries: KarteEntry[] = [
  {
    customer: tanaka,
    todayReservation: todayReservations[0],
    history: [
      { menu: "ハイライト", details: "細め・ナチュラル。まとまりが出たと満足", visitedAt: "2025-12-15" },
      { menu: "カット + カラー", details: "アッシュ系、色持ち良好", visitedAt: "2025-10-02" },
    ],
    aiSuggestion:
      "グロスカラーで今回は色味を足すと喜ばれやすいタイミングです。前回「まとまりが出た」と満足されていたため、ダメージケアとセット提案が効果的です。",
  },
  {
    customer: suzuki,
    todayReservation: todayReservations[3],
    history: [],
    aiSuggestion:
      "Instagramのビフォーアフター投稿からの流入のため、施術後の写真共有の許可を取ると素材が得られます。次回来店につながるよう、カウンセリングを丁寧に。",
  },
];

export const monthlyReport = {
  period: "2026年 3月",
  metrics: {
    reservations: { value: 78, diff: "+12件", up: true },
    repeatRate: { value: 38, diff: "先月 22% → 改善", up: true },
    aiIntake: { value: 31, diff: "件 / 今月", up: true },
    followers: { value: 1284, diff: "+142", up: true },
  },
  weeklyReservations: [
    { label: "第1週", count: 18, pct: 60 },
    { label: "第2週", count: 22, pct: 73 },
    { label: "第3週", count: 24, pct: 80 },
    { label: "第4週（途中）", count: 14, pct: 47, faint: true },
  ],
  savedHours: [
    { label: "予約対応", hours: 18, pct: 80 },
    { label: "Instagram 運用", hours: 10, pct: 56 },
    { label: "リピートフォロー", hours: 4, pct: 22 },
  ],
  totalSavedHours: 32,
};
