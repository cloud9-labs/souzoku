# 相続アプリ 公開手順

## 概要

- Next.js 16 (App Router) + Supabase + Vercel 構成
- Supabase: データベース＋認証＋ストレージ（無料プラン可）
- Vercel: ホスティング（無料プラン可）

---

## Step 1: Supabase セットアップ

### 1-1. プロジェクト作成

- https://supabase.com にアクセス
- GitHub/Googleアカウントでサインイン
- 「New Project」をクリック
- 設定：
  - Organization: 任意
  - Project name: souzoku-app
  - Database Password: 強固なパスワードを設定（メモしておく）
  - Region: Northeast Asia (Tokyo) を推奨
- 「Create new project」をクリック（2〜3分待つ）

### 1-2. データベーステーブル作成

- 左メニュー「SQL Editor」を開く
- 「New query」をクリック
- `/supabase/migrations/001_initial_schema.sql` の内容をコピー＆ペースト
- 「Run」をクリック（緑のチェックが出ればOK）
- 続けて `/supabase/migrations/002_file_uploads.sql` の内容も同様に実行

### 1-3. Storageバケット作成

- 左メニュー「Storage」を開く
- 「New bucket」をクリック
- 設定：
  - Name: `document-files`
  - Public bucket: OFF（プライベート）
- 「Create bucket」をクリック
- バケット作成後、「Policies」タブで以下のポリシーを追加：
  - Policy name: `authenticated_upload`
  - Allowed operation: INSERT, SELECT, DELETE
  - Target roles: authenticated
  - Policy definition: `bucket_id = 'document-files' AND auth.uid()::text = (storage.foldername(name))[1]`

### 1-4. テストユーザー作成

- 左メニュー「Authentication」→「Users」を開く
- 「Add user」→「Create new user」をクリック
- Email: `test@souzoku-demo.com`
- Password: `Demo1234!`
- 「Create user」をクリック
- 本番運用時は強固なパスワードに変更してください

### 1-5. APIキー取得

- 左メニュー「Project Settings」→「API」を開く
- 以下をメモ：
  - **Project URL**: `https://xxxxxxxxxx.supabase.co`
  - **anon public**: `eyJhbGci...`（長い文字列）

---

## Step 2: GitHub への Push

```bash
# プロジェクトディレクトリで実行
cd /Users/A5O1/書類/AI/souzoku-app

# 現在の変更をコミット
git add -A
git commit -m "feat: ファイルアップロード機能・印刷機能を追加"

# GitHubへpush
git push origin main
```

---

## Step 3: Vercel デプロイ

### 3-1. プロジェクトのインポート

- https://vercel.com にアクセス
- GitHubアカウントでサインイン
- 「Add New...」→「Project」をクリック
- 「Import Git Repository」から `cloud9-labs/souzoku` を選択
- 「Import」をクリック

### 3-2. 環境変数の設定

「Environment Variables」セクションで以下を追加：

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Step 1-5 でメモしたProject URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Step 1-5 でメモしたanon public key |
| `ENCRYPTION_KEY` | 下記コマンドで生成した64文字のhex文字列 |

**ENCRYPTION_KEY の生成方法**（ターミナルで実行）：
```bash
openssl rand -hex 32
```
出力された64文字の文字列をコピーして貼り付けてください。これにより顧客の電話番号・メールアドレス・住所・相続人情報がAES-256-GCMで暗号化されます。

`DEV_BYPASS_AUTH` は設定しない（本番環境では認証を使用）。

### 3-3. デプロイ

- 「Deploy」をクリック
- 2〜3分でデプロイ完了
- 発行されたURL（例：`souzoku-app.vercel.app`）をクライアントに共有

---

## Step 4: 動作確認

1. 発行されたURLにアクセス
2. `/login` ページでテストユーザーでサインイン
   - Email: `test@souzoku-demo.com`
   - Password: `Demo1234!`
3. 新規案件を登録して動作確認
4. 書類チェックリストが表示されることを確認
5. ファイルアップロードが動作することを確認

---

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 必須 | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 必須 | Supabase anonymous key |
| `DEV_BYPASS_AUTH` | ローカルのみ | `true` でSupabase認証をバイパス（開発用） |

---

## ローカル開発環境の設定

`.env.local` ファイルを作成（`.gitignore` に含まれているため安全）：

```env
# Supabase接続情報（任意・ローカルでもSupabaseを使う場合）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# 開発用バイパス（Supabase未設定時に使用）
DEV_BYPASS_AUTH=true
```

Supabase未設定でローカル開発する場合は `DEV_BYPASS_AUTH=true` のみで起動可能。

---

## 再デプロイ（コード更新時）

Vercelは `main` ブランチへのpushを自動検知して再デプロイします。

```bash
git add -A
git commit -m "fix: 修正内容の説明"
git push origin main
# Vercelが自動でビルド＆デプロイ（約2分）
```

---

## トラブルシューティング

### ログインできない

Supabase Authentication の「Users」でユーザーが「Confirmed」になっているか確認してください。

### 書類が保存されない

- Vercelの環境変数が正しく設定されているか確認
- Supabase の「SQL Editor」で `SELECT * FROM cases LIMIT 5;` を実行してデータが入っているか確認

### ファイルアップロードがエラーになる

- Supabase Storage の `document-files` バケットが作成されているか確認
- バケットのポリシーが正しく設定されているか確認

---

*最終更新: 2026-03-08*
