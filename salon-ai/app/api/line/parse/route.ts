import { NextResponse } from "next/server";
import { parseReservationIntent } from "@/lib/claude";

// Phase 1: LINE予約意図解析のデモ用エンドポイント。
// Phase 2 で /api/line/webhook（署名検証付き）に統合する。
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.message) {
      return NextResponse.json({ error: "message は必須です" }, { status: 400 });
    }
    const result = await parseReservationIntent(body.message);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "解析に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
