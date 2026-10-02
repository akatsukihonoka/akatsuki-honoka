# AICraft 設計成果物（v0.1 / 承認待ち）

- 作成日: 2026-10-02
- ステータス: **ドラフト・承認待ち**（コード実装・外部契約・デプロイ・顧客連絡は未実施）
- 置き場所: 本リポジトリ `akatsukihonoka/akatsuki-honoka` の作業ブランチ `claude/aicraft-saas-design-xm5i5a` 上の `docs/aicraft/` のみ。既存ファイル（`index.html`, `画像/`）は一切変更していない。

## 作業前の環境確認結果

| 項目 | 結果 |
|---|---|
| リポジトリ内容 | 個人ポートフォリオ静的サイト（`index.html` 1枚 + `画像/`）。SaaS関連コードなし |
| Git状態 | 作業ツリーはクリーン。作業ブランチは `main` と同一コミット（`1ead9fd`） |
| 判断 | 既存サイトと無関係なため、**SaaS本体の実装先は未確定**として扱い、本ブランチには設計文書のみ置く |

## 成果物一覧

| # | 文書 | 内容 |
|---|---|---|
| 1 | [01-product-requirements.md](01-product-requirements.md) | 製品要件定義書 |
| 2 | [02-user-flows-and-screens.md](02-user-flows-and-screens.md) | ユーザーフローと画面一覧 |
| 3 | [03-system-architecture.md](03-system-architecture.md) | システム構成図 |
| 4 | [04-database-design.md](04-database-design.md) | データベース設計（RLS含む） |
| 5 | [05-api-list.md](05-api-list.md) | API一覧 |
| 6 | [06-ai-agents-and-permissions.md](06-ai-agents-and-permissions.md) | AIエージェント構成と権限表 |
| 7 | [07-quality-assurance-plan.md](07-quality-assurance-plan.md) | 品質保証・評価計画 |
| 8 | [08-security-and-incident-response.md](08-security-and-incident-response.md) | セキュリティ・障害対応設計 |
| 9 | [09-automation-approval-boundaries.md](09-automation-approval-boundaries.md) | 自動化対象と人間の承認境界一覧 |
| 10 | [10-development-plan.md](10-development-plan.md) | 開発タスク一覧と段階的な実装計画 |
| 11 | [11-cost-operations-unverified.md](11-cost-operations-unverified.md) | 想定コスト、運営負荷、未検証事項 |
| 12 | [12-mvp-acceptance-and-test-plan.md](12-mvp-acceptance-and-test-plan.md) | MVP受け入れ基準とテスト計画 |

## 設計の基本方針（全文書共通）

1. **AIは「提案・下書き・検査・分類」まで。外部への影響・不可逆操作・金銭・権限は人間が承認する。** 承認は `approval_requests` に記録し、承認時のペイロードハッシュと実行内容が一致しない限り実行しない（[09](09-automation-approval-boundaries.md)）。
2. **MVPには外部への自動公開機能を持たせない。** 顧客は承認済みコンテンツをコピー／エクスポートして自分で公開する。
3. **AI評価は事実の正確性を保証しない。** AIは「検証が必要な主張」を抽出して顧客に提示するだけで、顧客の確認チェックなしに承認できない。
4. **技術は最小限。** Next.js + Supabase + OpenAI API + Stripe + Vercel + GitHub Actions のみ。ジョブキューは Postgres テーブルで実装し、追加サービスを入れない（監視サービスは任意・未決定）。
5. **価格・規約・API制限は全て未検証事項として扱う**（[11](11-cost-operations-unverified.md)）。本書中の金額は計算式と仮定値であり、見積もりではない。

## 承認前に決めていただきたいこと（ブロッカー）

| # | 決定事項 | 推奨案 |
|---|---|---|
| D1 | **SaaS本体のコードを置くリポジトリ** | 新規プライベートリポジトリ（例: `akatsukihonoka/aicraft`）。既存ポートフォリオと分離する |
| D2 | 製品名（仮称 AICraft のままか） | 商標調査後に確定（未検証事項 U-20） |
| D3 | LLMプロバイダ | 指示どおり OpenAI API。ただし `llm` モジュールで抽象化し差し替え可能にする |
| D4 | 対象市場・言語 | 日本国内・日本語のみ（MVP） |
| D5 | 料金プラン | [01](01-product-requirements.md) の仮案（Free Trial / Starter / Pro）。金額は原価確認後 |
| D6 | 顧客自身が削除したデータの完全削除を自動化するか | 「30日後の自動完全削除」をポリシーとして一度承認し、以後は自動実行（アカウント単位の削除は毎回人間承認） |
| D7 | 運営責任者（承認者）の人数 | MVPは1名（オーナー）。不在時のバックアップ承認者を1名指名することを推奨 |
