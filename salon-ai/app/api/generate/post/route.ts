import { NextResponse } from "next/server";
import { generatePost } from "@/lib/claude";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const caption = await generatePost({
      menu: body.menu ?? "カット",
      season: body.season,
      point: body.point,
    });
    return NextResponse.json({ caption });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
