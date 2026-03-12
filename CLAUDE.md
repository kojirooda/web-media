# Web Media Project
## メディア概要
- サイト名: 未定
- ターゲット: 20代〜40代の男女
- 月間目標: PV / CV / 収益KPI
- CMS: GitHub Pages（または WordPress 等）
- リポジトリ: [https://github.com/kojirooda/web-media.git]
## ブランドボイス
- 著者トーン: 40代経営者・3児の父としての実体験に基づく信頼感
- 一人称: 「私」
- NG表現: 特になし
- 記事カテゴリ別トーン:
  - 仕事・ビジネス関連: 「です・ます」調、丁寧で信頼感のある文体
  - 家事・育児関連: 読者の気持ちに寄り添う共感重視の表現、柔らかい語り口
- 詳細は docs/brand-voice.md を参照
## SEOルール
- H1: 1記事1つ / H2-H3: キーワード含む
- meta description: 120文字以内
- 構造化データ: Article schema 必須
- 内部リンク: 関連記事3本以上
## ツール連携
- 画像生成: Nano Banana MCP（Gemini Pro APIキー使用）
- デザイン: Canva MCP（Brand Kit 適用）
- プロジェクト管理: Notion MCP
- デプロイ: GitHub Actions
## カスタムコマンド
/plan-week  → 週間コンテンツ計画
/write      → 記事執筆パイプライン
/review     → QAチェック実行
/publish    → デプロイ
/audit      → SEO監査
