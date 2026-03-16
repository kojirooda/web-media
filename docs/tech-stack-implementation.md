# 技術スタック・実装計画
> SaaS「BizAI」構築のための具体的な技術選定と実装ステップ

---

## SaaS プロダクト「BizAI」技術構成

### 推奨スタック選定理由

```
Next.js 15        → Vercel最適、フルスタック開発効率最高
Supabase          → PostgreSQL + Auth + Realtime + Storage 一体型
                    東京リージョンあり、無料枠充実
Stripe            → 日本円対応、サブスクリプション管理が最も優秀
Resend            → メール送信API、無料枠3000通/月
Vercel            → Next.js最適デプロイ、自動プレビュー
Tailwind + shadcn → 高速UI構築
Claude API        → プロダクトのコア価値
```

---

## Phase 2 実装ステップ（Month 2-3）

### Week 1: プロジェクトセットアップ

```bash
# Claude Code が実行するセットアップコマンド
npx create-next-app@latest bizai --typescript --tailwind --app
cd bizai
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr
npm install stripe @stripe/stripe-js
npm install @anthropic-ai/sdk
npm install resend
npm install zod react-hook-form @hookform/resolvers
```

### ディレクトリ構成
```
bizai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── tools/
│   │   │   ├── sns/          # SNS投稿生成
│   │   │   ├── email/        # メルマガ生成
│   │   │   ├── meeting/      # 議事録生成
│   │   │   ├── recruitment/  # 採用文書生成
│   │   │   └── report/       # 報告書生成
│   │   └── settings/
│   ├── api/
│   │   ├── stripe/
│   │   │   └── webhook/
│   │   ├── generate/         # Claude API 呼び出し
│   │   └── auth/
│   └── landing/              # LP
├── components/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── claude/
│   └── resend/
└── supabase/
    └── migrations/
```

---

## Supabase スキーマ設計

```sql
-- users (Supabase Auth が自動管理)

-- profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  company_name text,
  plan text default 'trial', -- 'trial' | 'standard' | 'business' | 'enterprise'
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text default 'trialing',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now()
);

-- usage_logs
create table usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  tool_type text, -- 'sns' | 'email' | 'meeting' | 'recruitment' | 'report'
  tokens_used int,
  created_at timestamptz default now()
);

-- generated_contents
create table generated_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  tool_type text,
  input jsonb,
  output text,
  created_at timestamptz default now()
);
```

---

## Claude API 統合（コア機能）

```typescript
// lib/claude/generate.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generateContent(
  toolType: 'sns' | 'email' | 'meeting' | 'recruitment' | 'report',
  input: Record<string, string>,
  userPlan: string
): Promise<string> {
  const systemPrompts: Record<string, string> = {
    sns: `あなたは中小企業のSNS担当者です。
      ビジネスオーナーの視点で、信頼感のある投稿文を生成してください。
      Instagram用(500字以内)、X用(140字以内)、LINE用(200字以内)の3パターンを生成。`,

    email: `あなたは優秀なメールマーケターです。
      読者の悩みに寄り添いながら、開封率・クリック率を高めるメルマガを生成してください。`,

    meeting: `あなたは議事録作成の専門家です。
      箇条書きのメモから、決定事項・TODO・ネクストアクションを明確にした
      プロフェッショナルな議事録を生成してください。`,

    recruitment: `あなたは採用のプロです。
      応募者に響く求人票・採用ページ・募集要項を生成してください。
      過度な美化は避け、会社の実態を適切に伝えます。`,

    report: `あなたはビジネスレポートの専門家です。
      データと実績に基づいた、経営者が読みやすいレポートを生成してください。`
  };

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: systemPrompts[toolType],
    messages: [{ role: 'user', content: JSON.stringify(input) }]
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

---

## Stripe 統合（サブスクリプション管理）

```typescript
// lib/stripe/plans.ts
export const PLANS = {
  standard: {
    priceId: process.env.STRIPE_STANDARD_PRICE_ID!,
    name: 'スタンダード',
    price: 9800,
    features: ['全ツール利用可', '月200生成', 'メールサポート']
  },
  business: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    name: 'ビジネス',
    price: 19800,
    features: ['全ツール利用可', '無制限生成', '優先サポート', 'チーム3名まで']
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    name: 'エンタープライズ',
    price: 49800,
    features: ['全機能', '無制限', '専任サポート', 'カスタム統合', 'SLA保証']
  }
} as const;
```

---

## LP（ランディングページ）設計

### コピーライティング戦略
```
ヘッドライン:
「中小企業の業務文書、もうAIに任せませんか。」
「SNS・メルマガ・議事録・採用文書。毎日の作業を10分の1に。」

サブヘッドライン:
「BizAIは、日本の中小企業向けに設計されたAI業務アシスタントです。
 40代経営者が自ら使い、効果を実証した機能だけを搭載しています。」

社会的証明:
「ベータユーザー10社の声」

CTA:
「14日間無料で試す → クレジットカード不要」
```

### 想定コンバージョン率
- LP訪問 → 無料登録: 3-5%
- 無料 → 有料転換: 25-35%（業界平均20%）

---

## コスト試算（Claude API）

### M6時点での API コスト予測
```
SaaS顧客数: 52社
平均プラン: ¥19,800（ビジネスプラン）
1社あたり月間生成回数: ~100回
1回あたり平均トークン: input 500 + output 800 = 1,300 tokens

月間総トークン: 52社 × 100回 × 1,300 = 6,760,000 tokens

Claude Sonnet 4.6 料金:
  Input: $3/MTok → 52社 × 100 × 500 = 2.6MTok × $3 = $7.8
  Output: $15/MTok → 52社 × 100 × 800 = 4.16MTok × $15 = $62.4
  合計: ~$70/月 = 約¥10,500/月

メディアコンテンツ生成:
  週5記事 × 4週 × 平均5000字 ≈ ¥5,000/月

合計Claude APIコスト: 約¥15,000〜20,000/月
```
**売上1,030,000に対してAPIコスト率わずか1.5-2% → 非常に健全**

---

## GitHub Actions CI/CD パイプライン

```yaml
# .github/workflows/saas-deploy.yml
name: SaaS Deploy
on:
  push:
    branches: [main]
    paths: ['bizai/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci && npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 初月アクションアイテム（優先順位順）

### 即時実行（今週中）
1. **Stripe アカウント作成・本人確認完了**
2. **Supabase プロジェクト作成**（Tokyo リージョン）
3. **Vercel アカウント作成**
4. **ドメイン取得**（bizai.jp または類似）
5. **GitHub Secrets 設定**

### Week 1-2 実装
1. Next.js プロジェクト作成（Claude Code 実行）
2. 認証フロー実装（Supabase Auth）
3. Stripe サブスクリプション実装
4. Claude API 統合（SNS生成機能 MVP）
5. LP 作成・デプロイ

### Week 3-4
1. 残り機能実装（メルマガ、議事録等）
2. ベータユーザー招待
3. フィードバック収集
4. 日次自動化 GitHub Actions 設定
