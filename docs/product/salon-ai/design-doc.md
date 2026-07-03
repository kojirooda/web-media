# サロンAI（仮称）技術設計書
> 美容室向けAI予約・顧客管理SaaS / 本番実装のための設計
> バージョン: v0.1（2026-03-17）

---

## 0. この文書の位置づけ

- `docs/consulting/mockup-beauty-salon-dashboard.html`（画面モック）を本番システムに落とし込むための設計書
- LINEファーストのMVPを最短で稼働させ、Instagramは審査状況に応じて段階導入する方針
- この設計書に沿えば、Claude Code主導でそのまま実装に着手できる

---

## 1. プロダクトスコープ

### 1.1 提供価値（誰の何を解決するか）
- **ユーザー**: 美容室オーナー・スタッフ（1〜5名規模を主対象）
- **課題**: 施術中の予約対応中断・リピート率の低さ・SNS運用負荷・カウンセリング品質のばらつき
- **解決**: LINEを窓口にAIが予約受付・フォロー・投稿文生成・カルテ管理を代行

### 1.2 MVPに含む機能（Phase 1-2）
| # | 機能 | 優先度 |
|---|---|---|
| F1 | LINE予約自動受付（空き確認・仮予約・確定） | 必須 |
| F2 | 予約リマインド自動送信（前日・当日） | 必須 |
| F3 | 来店後リピートフォロー自動送信（30日/60日） | 必須 |
| F4 | オーナー用ダッシュボード（予約一覧・KPI） | 必須 |
| F5 | AIカルテ（施術履歴要約・NG・提案） | 必須 |
| F6 | SNS投稿文AI生成（ダッシュボードで承認） | 必須 |
| F7 | DM分類・複雑案件のオーナー転送 | 高 |
| F8 | 月次レポート自動生成 | 中 |

### 1.3 MVPに含まない（Phase 3以降）
- Instagram Graph APIによる完全自動投稿（Meta審査待ち → 当面は手動投稿支援）
- Instagram DM自動返信（ToSリスク・審査難度が高い）
- 複数店舗横断管理
- POS・会計連携

---

## 2. 技術スタック

| 領域 | 採用技術 | 理由 |
|---|---|---|
| フロント | Next.js 15 (App Router) + TypeScript | Vercel最適・フルスタック |
| UI | Tailwind CSS + shadcn/ui | モックのデザインを再現しやすい |
| バックエンド | Next.js Route Handlers + Supabase Edge Functions | サーバーレスで運用負荷最小 |
| DB | Supabase (PostgreSQL) 東京リージョン | Auth/RLS/Realtime一体 |
| 認証 | Supabase Auth（オーナー・スタッフ） | 標準機能で完結 |
| 決済 | Stripe Subscriptions（サロン→自社の月額） | 日本円サブスク対応 |
| メッセージ | LINE Messaging API | 日本の来店客接点の標準 |
| メール | Resend | オーナー通知・レポート送付 |
| AI | Anthropic Claude API (claude-sonnet-4-6) | 予約解析・生成の中核 |
| ホスティング | Vercel | Next.js最適・自動デプロイ |
| 監視 | Vercel Analytics + Sentry | エラー追跡 |

---

## 3. システム構成図

```
┌──────────────┐        ┌─────────────────────────────┐
│ 来店客        │        │        Vercel (Next.js)      │
│ (LINEアプリ)  │◄──────►│  ┌──────────────────────┐   │
└──────────────┘        │  │ /api/line/webhook     │   │
                        │  │  └ 署名検証            │   │
┌──────────────┐        │  │  └ Claude で意図解析   │   │
│ オーナー      │◄──────►│  │  └ 予約エンジン呼出   │   │
│ (ダッシュボード)│  Auth  │  └──────────────────────┘   │
└──────────────┘        │  ┌──────────────────────┐   │
                        │  │ /api/generate/*       │   │
┌──────────────┐        │  │  └ 投稿文・カルテ生成  │   │
│ Stripe        │◄──────►│  │ /api/stripe/webhook   │   │
└──────────────┘        │  └──────────────────────┘   │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Supabase (PostgreSQL)      │
                        │   + Auth + RLS + Cron        │
                        │   pg_cron: リマインド/フォロー│
                        └──────────────────────────────┘
```

---

## 4. データベース設計

```sql
-- ============ サロン（テナント）============
create table salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  line_channel_id text,
  line_channel_secret text,          -- 暗号化して保存
  line_channel_access_token text,    -- 暗号化して保存
  stripe_customer_id text unique,
  stripe_subscription_id text,
  plan text default 'trial',         -- trial | standard | business
  subscription_status text default 'trialing',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  business_hours jsonb,              -- 営業時間・定休日
  created_at timestamptz default now()
);

-- ============ スタッフ（Supabase Auth連携）============
create table staff (
  id uuid primary key references auth.users,
  salon_id uuid references salons(id) not null,
  name text not null,
  role text default 'stylist',       -- owner | stylist
  created_at timestamptz default now()
);

-- ============ 顧客 ============
create table customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) not null,
  line_user_id text,                 -- LINEの友だちID
  name text,
  phone text,
  first_visit_at timestamptz,
  visit_count int default 0,
  preferences text,                  -- お好み（AIが更新）
  ng_notes text,                     -- NG事項
  tags text[],
  created_at timestamptz default now(),
  unique(salon_id, line_user_id)
);

-- ============ 予約 ============
create table reservations (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) not null,
  customer_id uuid references customers(id),
  staff_id uuid references staff(id),
  menu text not null,                -- カット / カラー等
  duration_min int not null,
  starts_at timestamptz not null,
  status text default 'pending',     -- pending | confirmed | cancelled | done
  source text default 'line_ai',     -- line_ai | manual | web
  reminder_sent_at timestamptz,
  created_at timestamptz default now()
);
create index on reservations (salon_id, starts_at);

-- ============ 施術履歴（カルテ）============
create table treatment_records (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) not null,
  customer_id uuid references customers(id) not null,
  reservation_id uuid references reservations(id),
  menu text,
  details text,                      -- 施術メモ
  ai_summary text,                   -- Claudeが要約
  visited_at timestamptz,
  created_at timestamptz default now()
);

-- ============ リピートフォロー ============
create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) not null,
  customer_id uuid references customers(id) not null,
  type text,                         -- day30 | day60
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text default 'scheduled',   -- scheduled | sent | cancelled
  message text
);

-- ============ SNS投稿 ============
create table social_posts (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) not null,
  platform text default 'instagram',
  caption text,                      -- Claude生成
  image_url text,
  status text default 'draft',       -- draft | approved | posted
  scheduled_for date,
  posted_at timestamptz,
  engagement jsonb,                  -- likes/comments/reach
  created_at timestamptz default now()
);

-- ============ DMインボックス（転送案件）============
create table dm_inbox (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) not null,
  customer_id uuid references customers(id),
  channel text,                      -- line | instagram
  message text,
  ai_category text,                  -- reservation | faq | complaint | escalate
  handled boolean default false,
  created_at timestamptz default now()
);
```

**RLS方針**: 全テーブルに `salon_id = auth.jwt() ->> 'salon_id'` のポリシーを設定し、テナント間のデータ分離を保証する。

---

## 5. API設計（主要エンドポイント）

| メソッド | パス | 役割 |
|---|---|---|
| POST | `/api/line/webhook` | LINE受信。署名検証→意図解析→予約/FAQ/転送に分岐 |
| POST | `/api/stripe/webhook` | 課金イベント処理（登録・失敗・解約） |
| GET | `/api/reservations` | 予約一覧（日/週フィルタ） |
| POST | `/api/reservations` | 手動予約作成 |
| PATCH | `/api/reservations/:id` | 確定・キャンセル |
| POST | `/api/generate/post` | SNS投稿文をClaudeで生成 |
| POST | `/api/generate/karte` | カルテ要約・提案をClaudeで生成 |
| GET | `/api/dashboard/summary` | ホーム画面のKPI集計 |
| GET | `/api/reports/monthly` | 月次レポートデータ |

### 5.1 LINE Webhook の処理フロー

```
受信メッセージ
  │
  ├─ 署名検証（x-line-signature）
  │
  ├─ Claude で意図分類
  │    「予約したい」→ 予約フロー
  │    「営業時間は？」→ FAQ自動返信
  │    「クレーム/複雑」→ dm_inbox に登録しオーナー転送
  │
  ├─ 予約フローの場合
  │    1. 希望日時・メニューを抽出（Claude構造化出力）
  │    2. reservations で空き確認
  │    3. 候補提示 or 仮予約
  │    4. 確定 → 確定メッセージ返信 + オーナー通知
  │
  └─ Reply API で応答
```

### 5.2 AI層の設計（プロンプト方針）

| 用途 | モデル | 入力 | 出力形式 |
|---|---|---|---|
| 予約意図解析 | claude-sonnet-4-6 | LINE本文 + 営業時間 | JSON（意図・日時・メニュー） |
| 投稿文生成 | claude-sonnet-4-6 | 施術種別・季節・ブランドボイス | キャプション + ハッシュタグ |
| カルテ要約 | claude-sonnet-4-6 | 過去施術履歴 | 要約 + NG + 次回提案 |
| DM分類 | claude-sonnet-4-6 | 受信文 | カテゴリ（4分類） |

- **プロンプトキャッシュ**を活用（システムプロンプト・営業時間などの固定文脈をキャッシュしてコスト削減）
- `brand-voice.md` の文体ルールを投稿文生成のシステムプロンプトに組み込む

---

## 6. 画面遷移（モックの実装対応）

| モック画面 | ルート | データソース |
|---|---|---|
| ホーム | `/dashboard` | `/api/dashboard/summary` |
| 予約管理 | `/dashboard/reservations` | `/api/reservations` |
| SNS管理 | `/dashboard/sns` | `social_posts` |
| 顧客カルテ | `/dashboard/karte` | `customers` + `treatment_records` |
| レポート | `/dashboard/reports` | `/api/reports/monthly` |

モックのHTML/CSSはTailwindコンポーネントへ移植。デザイントークン（navy/gold）はそのまま流用。

---

## 7. 定期実行（スケジューラ）

Supabase `pg_cron` またはVercel Cronで実装:

| ジョブ | 頻度 | 処理 |
|---|---|---|
| リマインド送信 | 毎日 10:00 | 翌日予約客へLINE送信 |
| リピートフォロー | 毎日 12:00 | `follow_ups` の scheduled 分を送信 |
| 月次レポート生成 | 月初 08:00 | 前月KPI集計→Resendでオーナーへ |
| 週次投稿案生成 | 毎週月 09:00 | 翌週分の投稿文を draft 生成 |

---

## 8. 外部連携の準備状況とリスク

| 連携先 | 取得難度 | リードタイム | 備考 |
|---|---|---|---|
| Supabase | 易 | 即日 | MCP経由で作成可 |
| Vercel | 易 | 即日 | MCP経由でデプロイ可 |
| Stripe | 中 | 1〜3日 | 本人確認・審査 |
| LINE Messaging API | 中 | 1〜3日 | 公式アカウント作成→チャネル発行 |
| **Instagram Graph API** | **難** | **数週間** | **Meta App Review・ビジネス認証。否認リスクあり** |
| Instagram Messaging API | 最難 | 不確定 | DM自動返信はToSグレー・当面見送り推奨 |

**リスク対策**: Instagramは「AI生成→オーナーが手動投稿」の半自動から始め、審査通過後に自動化へ移行。これにより審査を待たずにサービス開始できる。

---

## 9. 工数見積（Claude Code主導）

| フェーズ | 内容 | 目安 |
|---|---|---|
| Phase 1 | プロジェクト雛形・DB・Auth・ダッシュボード5画面・Claude生成機能（デモデータ） | 1〜2週間 |
| Phase 2 | LINE Webhook・予約エンジン・Stripe・リマインド/フォロー・本番デプロイ | 2〜3週間 |
| Phase 3 | Instagram半自動→自動・月次レポート・改善 | 審査次第 |

※ Claude Codeが実装の大半を担うため、人間はアカウント発行・承認・テスト確認が中心。

---

## 10. セキュリティ

- LINEチャネルシークレット・アクセストークンは暗号化してDB保存（またはVercel環境変数）
- Supabase RLSでテナント分離を強制
- Stripeが決済情報を保持（自社DBに保持しない）
- Webhook署名検証を必須化（LINE・Stripe両方）
- 顧客個人情報は東京リージョンに保存

---

## 11. 次のアクション

1. この設計書のレビュー・承認
2. Phase 1着手の可否判断（外部アカウント不要で開始可能）
3. 並行して LINE公式アカウント・Stripe・独自ドメインの準備開始
4. Supabase / Vercel プロジェクト作成（コスト承認後、MCP経由で実行可）
