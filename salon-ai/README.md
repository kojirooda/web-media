# サロンAI（仮称）— Phase 1 MVP

美容室向けAI予約・顧客管理SaaS。設計書は [`../docs/product/salon-ai/design-doc.md`](../docs/product/salon-ai/design-doc.md) を参照。

このリポジトリは **Phase 1** の成果物です。外部アカウント（LINE / Stripe / Supabase）なしで動作し、
ダッシュボード5画面をデモデータで表示、Claude APIによる投稿文生成・カルテ要約・予約意図解析が動きます。

---

## できること（Phase 1）

| 機能 | 状態 |
|---|---|
| ダッシュボード5画面（ホーム / 予約 / SNS / カルテ / レポート） | ✅ デモデータで表示 |
| SNS投稿文のAI生成・再生成・承認UI | ✅ Claude API接続 |
| カルテ要約・次回提案のAI生成 | ✅ APIルート実装 |
| LINE予約メッセージの意図解析 | ✅ デモ用APIルート実装 |
| LINE実連携・予約DB・課金・自動送信 | ⏭ Phase 2 |

---

## セットアップ

```bash
cd salon-ai
npm install

# Claude APIキーを設定（投稿文・カルテ生成に必要）
cp .env.example .env.local
# .env.local を編集して ANTHROPIC_API_KEY を記入

npm run dev
# http://localhost:3000 → /dashboard にリダイレクト
```

APIキー未設定でも画面表示・操作は可能です（AI生成ボタンのみエラーメッセージを表示）。

---

## AI機能の動作確認（APIキー設定後）

```bash
# 投稿文生成
curl -X POST http://localhost:3000/api/generate/post \
  -H "Content-Type: application/json" \
  -d '{"menu":"縮毛矯正","season":"梅雨","point":"扱いやすさ"}'

# 予約意図の解析
curl -X POST http://localhost:3000/api/line/parse \
  -H "Content-Type: application/json" \
  -d '{"message":"来週の土曜午後にカットとカラーで予約できますか？"}'
```

または、SNS画面の「AI再生成」ボタンから投稿文生成を試せます。

---

## ディレクトリ構成

```
salon-ai/
├── app/
│   ├── dashboard/            # 5画面（layout = スマホ筐体 + ヘッダー + ボトムナビ）
│   │   ├── page.tsx          # ホーム
│   │   ├── reservations/     # 予約管理（今日/明日/今週/DM タブ）
│   │   ├── sns/              # SNS管理（AI生成・承認）
│   │   ├── karte/            # 顧客カルテ
│   │   └── reports/          # 月次レポート
│   └── api/
│       ├── generate/post/    # 投稿文生成
│       ├── generate/karte/   # カルテ要約
│       └── line/parse/       # 予約意図解析（Phase 2でwebhookに統合）
├── components/               # ヘッダー・ナビ・共通UI
└── lib/
    ├── types.ts              # ドメイン型（DBスキーマ対応）
    ├── demo-data.ts          # Phase 1 デモデータ
    └── claude.ts             # Claude API連携
```

---

## Phase 2 への接続ポイント

- `lib/demo-data.ts` → Supabaseクエリに置き換え
- `app/api/line/parse` → `app/api/line/webhook`（署名検証・Reply API）に発展
- 認証（Supabase Auth）・課金（Stripe）・定期実行（pg_cron）を追加

詳細は設計書 §11「次のアクション」を参照。
