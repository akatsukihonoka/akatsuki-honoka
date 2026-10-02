# 5. API一覧

## 5.1 共通仕様

- 実装: 画面からの更新系は主に **Server Actions**、非同期・外部連携・ポーリングは **Route Handlers (`/api/*`)**。下表は両者を論理APIとして列挙する。
- 認証: Supabase セッション（Cookie）。`/api/webhooks/*` は署名検証、`/api/cron/*` は `CRON_SECRET` ヘッダ検証。
- 認可: DBのRLS＋サーバー側でのロール確認（二重）。`/ops/*` は `ops.admins` ＋ MFA（AAL2）必須。
- 入力検証: 全エンドポイントで zod スキーマ。文字数上限（例: テーマ500字、ブランド各項目2,000字、本文50,000字）。
- 冪等性: 生成・課金関連は `Idempotency-Key`（クライアント生成UUID）を必須とし、同一キーは同一結果を返す。
- レート制限: ユーザー単位・ワークスペース単位（Postgres のカウンタで実装。値は初期値で運用中に調整）。
- エラー形式: `{ error: { code: string, message: string, request_id: string } }`。
- 全更新系は `ops.audit_logs` に記録。

## 5.2 顧客向けAPI

| # | メソッド / パス | 概要 | ロール | レート制限（初期値） |
|---|---|---|---|---|
| 1 | `POST /api/workspaces` | ワークスペース作成（作成者=owner） | 認証済み | 5/日/ユーザー |
| 2 | `GET /api/workspaces/:id` | 詳細 | member | |
| 3 | `PATCH /api/workspaces/:id` | 名称・業種変更 | owner | |
| 4 | `POST /api/workspaces/:id/invitations` | 招待 | owner | 20/日 |
| 5 | `POST /api/invitations/accept` | 招待受諾（token） | 認証済み | 10/時 |
| 6 | `PATCH /api/workspaces/:id/members/:userId` | ロール変更 | owner | |
| 7 | `DELETE /api/workspaces/:id/members/:userId` | メンバー除外 | owner | |
| 8 | `GET /api/brand` | 現行ブランド設定 | member | |
| 9 | `POST /api/brand/versions` | ブランド設定の新版保存 | owner, editor | 30/時 |
| 10 | `GET /api/brand/versions` | 版履歴 | member | |
| 11 | `POST /api/generate/ideas` | コンテンツ案生成ジョブ投入 → `202 {job_id}` | owner, editor | 20/時/WS |
| 12 | `POST /api/generate/body` | 本文生成ジョブ投入（idea_id or brief） | owner, editor | 20/時/WS、利用枠 |
| 13 | `POST /api/contents/:id/rewrite` | 選択範囲の書き直し（S） | owner, editor | 30/時/WS |
| 14 | `GET /api/jobs/:id` | ジョブ状態（queued/running/succeeded/failed） | member | 120/分 |
| 15 | `GET /api/contents` | 一覧（status, channel, from, to, q, cursor） | member | |
| 16 | `POST /api/contents` | 手動作成 | owner, editor | |
| 17 | `GET /api/contents/:id` | 詳細（最新版、品質結果、主張） | member | |
| 18 | `PATCH /api/contents/:id` | タイトル・予定日・チャネル変更 | owner, editor | |
| 19 | `POST /api/contents/:id/versions` | 本文保存＝新版作成（承認済みなら draft に戻る） | owner, editor | 120/時 |
| 20 | `GET /api/contents/:id/versions` | 版一覧 | member | |
| 21 | `GET /api/contents/:id/versions/:v/diff?base=` | 差分 | member | |
| 22 | `POST /api/contents/:id/versions/:v/restore` | 版を復元（新版として作成） | owner, editor | |
| 23 | `POST /api/contents/:id/check` | 手動作成分の品質検査実行 | owner, editor | 利用枠（0.2単位） |
| 24 | `POST /api/contents/:id/claims/:claimId/confirm` | 主張の確認チェック | owner, editor | |
| 25 | `POST /api/contents/:id/overrides` | critical指摘の上書き（理由必須） | owner | |
| 26 | `POST /api/contents/:id/approve` | 承認（`version_id` 必須。RPC `approve_content`） | owner, editor | |
| 27 | `POST /api/contents/:id/publish-mark` | 公開済みマーク（URL任意） | owner, editor | |
| 28 | `GET /api/contents/:id/export?format=md\|txt` | エクスポート（approved のみ） | member | |
| 29 | `DELETE /api/contents/:id` | 論理削除 | owner, editor | |
| 30 | `GET /api/calendar?from=&to=` | カレンダー表示用 | member | |
| 31 | `POST /api/contents/:id/metrics` | 成果手動入力（S） | owner, editor | |
| 32 | `GET /api/reports/monthly?month=` | 月次レポート | member | |
| 33 | `GET /api/usage` | 当月利用枠・消費 | member | |
| 34 | `POST /api/billing/checkout` | Stripe Checkout セッション作成 | owner | 10/時 |
| 35 | `POST /api/billing/portal` | Stripe カスタマーポータル | owner | 10/時 |
| 36 | `GET /api/help/articles?q=` | FAQ検索 | 公開 | 60/分/IP |
| 37 | `POST /api/support/tickets` | 問い合わせ作成 → AI分類ジョブ | member | 10/日/ユーザー |
| 38 | `GET /api/support/tickets` / `:id` | 自分のチケット | member | |
| 39 | `POST /api/support/tickets/:id/messages` | 追記・「人間に相談」 | member | |
| 40 | `POST /api/account/export` | データエクスポート作成（JSON/MD zip） | 本人（WS分は owner） | 2/日 |
| 41 | `POST /api/account/delete-request` | 削除申請（再認証必須） | 本人 / owner | 1/日 |
| 42 | `GET /api/notifications` / `PATCH :id` | 通知 | 本人 | |

## 5.3 外部連携・内部API

| # | メソッド / パス | 概要 | 認証 |
|---|---|---|---|
| 50 | `POST /api/webhooks/stripe` | サブスク作成/更新/解約/支払失敗を `subscriptions` に反映。イベントID で重複排除 | Stripe 署名 |
| 51 | `GET /api/cron/worker` | 毎分: `ops.jobs` を最大N件処理（実行時間上限内で打ち切り） | CRON_SECRET |
| 52 | `GET /api/cron/monitor` | 5–15分毎: エラー率・コスト・キュー滞留の集計と閾値判定 | CRON_SECRET |
| 53 | `GET /api/cron/daily` | 日次: 利用集計、予算リセット、期限切れ承認の失効、日次サマリ | CRON_SECRET |
| 54 | `GET /api/cron/weekly` | 週次: 運営レポート、品質監査サンプル抽出、評価セット実行 | CRON_SECRET |
| 55 | `GET /api/health` | 外形監視用（DB疎通のみ。詳細は返さない） | 公開 |

## 5.4 運営コンソールAPI（`/api/ops/*`、ops.admins + MFA）

| # | メソッド / パス | 概要 |
|---|---|---|
| 60 | `GET /api/ops/approvals?status=pending` | 承認キュー |
| 61 | `POST /api/ops/approvals/:id/decide` | 承認/却下（`payload_sha256` 一致必須、理由必須）→ 承認なら実行器ジョブ投入 |
| 62 | `GET /api/ops/tickets` / `POST /api/ops/tickets/:id/send` | 回答案を確認して送信 |
| 63 | `GET /api/ops/agents/runs` / `:id` | エージェント実行・ツール呼び出しログ |
| 64 | `PUT /api/ops/flags/:key` | キルスイッチ切替（停止は即時・単独可、再開は理由必須） |
| 65 | `GET /api/ops/usage` / `PUT /api/ops/budgets/:id` | コスト確認・予算変更（増額は承認申請扱い） |
| 66 | `GET/POST /api/ops/incidents` | インシデント管理 |
| 67 | `GET /api/ops/quality/samples` / `POST .../:id/audit` | 品質監査 |
| 68 | `GET /api/ops/evals/runs` | 評価結果 |
| 69 | `GET/POST /api/ops/faq` | FAQ記事の下書き確認・公開（公開は人間） |
| 70 | `GET /api/ops/marketing` / `PATCH :id` | 営業・マーケ案のレビュー |
| 71 | `POST /api/ops/support-access` | 顧客データ閲覧の一時許可（理由・期限必須、監査ログ） |
