// ドメイン型定義（設計書 §4 のDBスキーマに対応）

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "done";
export type ReservationSource = "line_ai" | "manual" | "web";

export interface Customer {
  id: string;
  name: string;
  lineUserId?: string;
  phone?: string;
  firstVisitAt?: string;
  visitCount: number;
  preferences?: string;
  ngNotes?: string;
  tags?: string[];
  isNew?: boolean;
}

export interface Reservation {
  id: string;
  customerName: string;
  staffName?: string;
  menu: string;
  durationMin: number;
  startsAt: string; // ISO
  status: ReservationStatus;
  source: ReservationSource;
}

export interface TreatmentRecord {
  menu: string;
  details: string;
  visitedAt: string;
}

export interface KarteEntry {
  customer: Customer;
  todayReservation: Reservation;
  history: TreatmentRecord[];
  aiSuggestion: string;
}

export type PostStatus = "draft" | "approved" | "posted";

export interface SocialPost {
  id: string;
  platform: "instagram";
  day: string; // 表示用ラベル（例: 水 3/18）
  caption?: string;
  emoji?: string;
  status: PostStatus;
  engagement?: { likes: number; comments: number; reach: number };
}

export type DmCategory = "reservation" | "faq" | "complaint" | "escalate";

export interface DmItem {
  id: string;
  sender: string;
  channel: "line" | "instagram";
  message: string;
  category: DmCategory;
  handled: boolean;
}

export interface DashboardSummary {
  todayReservations: number;
  unhandledDm: number;
  postsThisWeek: { approved: number; total: number };
  followUpsScheduled: number;
}
