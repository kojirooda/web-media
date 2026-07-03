import { NextResponse } from "next/server";
import { summarizeKarte } from "@/lib/claude";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const summary = await summarizeKarte({
      customerName: body.customerName ?? "お客様",
      history: body.history ?? [],
      preferences: body.preferences,
      ngNotes: body.ngNotes,
    });
    return NextResponse.json({ summary });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
