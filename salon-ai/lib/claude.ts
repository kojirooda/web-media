// Claude API 連携（設計書 §5.2）
// 投稿文生成・カルテ要約・予約意図解析を担う。
// ブランドボイス（docs/brand-voice.md）の文体ルールをシステムプロンプトに反映。

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY が未設定です（.env.local を確認してください）");
  }
  return new Anthropic({ apiKey });
}

function textOf(msg: Anthropic.Message): string {
  const block = msg.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

/** SNS投稿文の生成 */
export async function generatePost(input: {
  menu: string;
  season?: string;
  point?: string;
}): Promise<string> {
  const client = getClient();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: [
      {
        type: "text",
        text: `あなたは美容室のSNS担当者です。以下のブランドボイスに従い、Instagram投稿文を生成してください。

# ブランドボイス
- 一人称は「私」。文末は「です・ます」調を基本に、親しみやすく。
- 過度な煽り・感嘆符の連続は避ける。「絶対」「必ず」等の断言も避ける。
- 具体的な仕上がり・季節感を織り込む。

# 出力形式
- 本文（120〜200字程度）
- 改行後に「▷ご予約はプロフィールのLINEから」
- 改行後にハッシュタグを3〜5個`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `施術種別: ${input.menu}\n季節: ${input.season ?? "指定なし"}\nアピールしたい点: ${input.point ?? "指定なし"}`,
      },
    ],
  });
  return textOf(msg);
}

/** カルテ要約・次回提案の生成 */
export async function summarizeKarte(input: {
  customerName: string;
  history: { menu: string; details: string; visitedAt: string }[];
  preferences?: string;
  ngNotes?: string;
}): Promise<string> {
  const client = getClient();
  const historyText = input.history
    .map((h) => `- ${h.visitedAt} ${h.menu}: ${h.details}`)
    .join("\n");
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system:
      "あなたは美容室のベテランアシスタントです。過去の施術履歴から、担当スタイリスト向けに『来店前サマリー』と『次回の提案候補』を簡潔に生成してください。押しつけがましくならないよう配慮します。",
    messages: [
      {
        role: "user",
        content: `顧客名: ${input.customerName}\nお好み: ${input.preferences ?? "不明"}\nNG: ${input.ngNotes ?? "特になし"}\n施術履歴:\n${historyText || "（初回来店）"}`,
      },
    ],
  });
  return textOf(msg);
}

/** LINE予約メッセージから意図・日時・メニューを構造化抽出 */
export async function parseReservationIntent(message: string): Promise<{
  intent: "reservation" | "faq" | "complaint" | "other";
  date?: string;
  time?: string;
  menu?: string;
  raw: string;
}> {
  const client = getClient();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system:
      "あなたは美容室の予約受付AIです。顧客のメッセージを分析し、必ず次のJSONのみを返してください（前後に説明文を付けない）: {\"intent\":\"reservation|faq|complaint|other\",\"date\":\"抽出できれば\",\"time\":\"抽出できれば\",\"menu\":\"抽出できれば\"}",
    messages: [{ role: "user", content: message }],
  });
  const raw = textOf(msg);
  try {
    const parsed = JSON.parse(raw);
    return { ...parsed, raw };
  } catch {
    return { intent: "other", raw };
  }
}
