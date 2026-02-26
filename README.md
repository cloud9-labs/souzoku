# 相続書類管理システム

相続税申告の書類収集を、もれなく・確実に管理するWebアプリケーション。

## 機能概要

- **5ステップヒアリングウィザード** — 被相続人・相続人・財産・特例情報を入力
- **自動書類リスト生成** — TIER1（必須）/ TIER2（財産別）/ TIER3（特例・控除）で分類
- **書類チェックリスト** — ステータス管理（未依頼→依頼済→受取済→確認済）
- **申告期限タイムライン** — 逝去から10ヶ月の期限を6マイルストーンで管理
- **リマインダーメール** — 4段階エスカレーション（7/30/90/240日）

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **バックエンド**: Supabase (PostgreSQL + Auth + RLS)
- **メール**: Resend API
- **認証**: Supabase Auth + Next.js proxy (Row Level Security)

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # Supabase・Resend の認証情報を設定
npm run dev
```

### 環境変数 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### DBマイグレーション

Supabase ダッシュボードの SQL エディタで以下を実行:

```
supabase/migrations/001_initial_schema.sql
```

## TAISUN Agent セットアップ

```bash
ln -s ~/taisun_agent/.claude .claude
ln -s ~/taisun_agent/.mcp.json .mcp.json
cd ~/taisun_agent && git pull origin main && npm install && npm run build:all
```
