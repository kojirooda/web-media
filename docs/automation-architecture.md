# Claude Code 自動化アーキテクチャ
> 人間の介入を最小化するための自動化システム設計

---

## システム全体像

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Actions                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Daily    │  │ Weekly   │  │ On-demand│             │
│  │ 06:00    │  │ Mon 09:00│  │ Webhook  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       └──────────────┴──────────────┘                   │
│                      │                                   │
│              ┌────────▼────────┐                        │
│              │  Claude Code    │                        │
│              │  (claude-sonnet)│                        │
│              └────────┬────────┘                        │
└───────────────────────┼─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌─────▼─────┐   ┌────▼────┐
   │ Content │    │   SaaS    │   │ Report  │
   │ Pipeline│    │ Operations│   │  Daily  │
   └─────────┘    └───────────┘   └─────────┘
```

---

## 1. 日次自動化パイプライン（毎朝 06:00）

### content-daily.yml
```yaml
# .github/workflows/content-daily.yml
name: Daily Content Pipeline
on:
  schedule:
    - cron: '0 21 * * *'  # JST 06:00
  workflow_dispatch:

jobs:
  generate-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Claude Code content pipeline
        run: |
          claude --print "
          今日の記事生成タスクを実行してください:
          1. docs/content-queue.md からキューを確認
          2. 優先度1位の記事を完全生成
          3. SEOチェック実行
          4. content/drafts/ に保存
          5. 自動コミット・プッシュ
          " --allowedTools=Read,Write,Bash,Edit
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## 2. SaaS 運用自動化

### 技術スタック
```
フロントエンド: Next.js 15 (App Router)
バックエンド:   Next.js API Routes + Supabase Edge Functions
DB:            Supabase (PostgreSQL)
認証:           Supabase Auth
決済:           Stripe (Subscriptions)
メール:         Resend
デプロイ:       Vercel
AI:            Anthropic Claude API (claude-sonnet-4-6)
監視:           Vercel Analytics + Sentry
```

### 自動化される運用フロー
```
新規ユーザー登録
    └→ Stripe チェックアウト
        └→ Webhook → Supabase にユーザー作成
            └→ Resend でウェルカムメール自動送信
                └→ Notion に新規顧客エントリ自動作成
                    └→ 日次レポートに反映
```

### チャーン予防自動化
```
毎日チェック:
- 14日間ログインなし → 自動リエンゲージメントメール
- トライアル終了3日前 → 転換促進メール
- 支払い失敗 → 自動リトライ + 通知メール
```

---

## 3. コンテンツ自動化パイプライン

### 記事生成フロー
```
content-queue.md (週次更新)
    │
    ▼
keyword-research.js (Claude Code)
    │ → Googleトレンド分析
    │ → 競合記事分析
    ▼
outline-generator.js
    │ → H1/H2/H3構成生成
    │ → 内部リンク候補特定
    ▼
article-writer.js (Claude API)
    │ → brand-voice.md 参照
    │ → 3000-5000字の記事生成
    │ → meta description生成
    ▼
seo-checker.js
    │ → キーワード密度確認
    │ → 見出し構造確認
    │ → Article schema生成
    ▼
publisher.js
    └ → GitHub Pages に自動デプロイ
```

### SNS自動投稿フロー
```
記事公開 → Twitter/X 自動投稿 (3ツイートスレッド)
         → LinkedIn 投稿
         → note.com クロスポスト（検討）
```

---

## 4. 日次レポート自動生成

### daily-report.md テンプレート（Claude Codeが毎朝生成）
```markdown
# 日次レポート: {日付}

## 昨日のハイライト
- 新規SaaS登録: N件
- 売上: ¥XXX,XXX
- 公開記事: N本
- PV: N

## 要対応事項（本日中）
- [ ] 問い合わせ: N件（内容要確認）
- [ ] 支払い失敗: N件

## KPI トラッキング
| 指標 | 目標 | 実績 | 達成率 |
...

## 今日の自動実行タスク
- 記事生成: 「{タイトル}」
- SNS投稿: N件予定
```

---

## 5. コンサル業務自動化

### 提案書生成フロー（Claude Code）
```
顧客情報入力 (Notion フォーム)
    │
    ▼
Claude Code が:
    1. 業界・課題を分析
    2. 提案書テンプレート選択
    3. カスタム提案書生成 (PDF)
    4. 見積書生成
    5. Notionに保存 + メール添付準備
```

### 月次報告書自動化
```
各コンサル顧客向け:
- KPI データ自動収集
- 成果サマリー自動生成
- 翌月提案自動生成
- PDF レポート自動送信
```

---

## 6. Claude Code コマンド体系

### 新規追加コマンド

```bash
# /plan-week - 週間コンテンツ計画生成
# 毎週日曜夜に自動実行 + 手動実行可

# /write - 記事執筆パイプライン（既存）

# /saas-report - SaaS KPIレポート生成
# /daily-report - 日次レポート生成
# /proposal [顧客名] - コンサル提案書生成
# /content-queue - コンテンツキュー管理
# /seo-audit [URL] - SEO監査実行
```

---

## 7. エスカレーション設計

### 自動対応範囲（人間不要）
- FAQ 質問 → 自動返答
- パスワードリセット → 自動処理
- トライアル延長依頼 → 自動承認（月1回まで）
- 請求書再送 → 自動処理

### エスカレーション（人間判断が必要）
- クレーム・返金依頼 → Slackに通知
- 解約意思表示 → 引き止めスクリプト実行 → 承認待ち
- エンタープライズ相談 → 要対応フラグ
- バグ報告（重大） → 即時Slack通知

---

## 8. セキュリティ設計

- API キー: GitHub Secrets / Vercel Environment Variables
- DB アクセス: Supabase RLS (Row Level Security)
- 支払い情報: Stripe が保持（自社DBに保持しない）
- ユーザーデータ: 日本国内リージョン（Supabase Tokyo）
- バックアップ: Supabase 自動日次バックアップ
