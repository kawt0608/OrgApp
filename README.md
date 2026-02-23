# Original Blog App (Next.js + Supabase)

これは Next.js (App Router) と Supabase を使用して作成されたオリジナルブログアプリケーションです。
一般ユーザーはマークダウンで書かれた記事を閲覧し、ログイン不要で「いいね」ボタンを押すことができます。管理者は認証を通して記事を作成・編集・公開・削除できます。

## 【評価者様向け】 テスト認証情報

管理画面や機能の動作確認用に、以下のテストアカウントを作成してください。

* ログインURL： `/login`
* Eメール： `admin@example.com`
* パスワード： `password123`

※Supabaseプロジェクトの Authentication > Add user から作成可能です。

## ローカル環境でのセットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone <repository_url>
   cd <repository_module>
   npm install
   ```

2. **Supabase の準備**
   - [Supabase](https://supabase.com/) で新規プロジェクトを作成します。
   - プロジェクトダッシュボードの SQL Editor を開き、リポジトリルートにある `init.sql` を実行してテーブルと RLS(Row Level Security) を作成します。
   - プロジェクトダッシュボードの Authentication > Add user からテスト用ユーザーを作成します (例: `admin@example.com` / `password123`)。

3. **環境変数の設定**
   ルートディレクトリに `.env.local` を作成し、自身のSupabaseプロジェクトのURLとAnon Keyを設定してください。
   ```env
   NEXT_PUBLIC_SUPABASE_URL=あなたのSupabase_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase_Anon_Key
   ```

4. **開発用サーバーの起動**
   ```bash
   npm run dev
   ```
   ブラウザで [http://localhost:3000](http://localhost:3000) を開き、動作を確認します。管理画面は `/admin`、ログインは `/login` です。

## Vercelへのデプロイについて

このアプリケーションは Vercel に最適化されています。以下の手順でデプロイしてください。

1. [Vercel](https://vercel.com/) にログインし、「Add New...」>「Project」を選択します。
2. 対象の GitHub リポジトリをインポートします。
3. **Environment Variables（環境変数）** のセクションで以下を追加します。
   - `NEXT_PUBLIC_SUPABASE_URL`: (Supabase の URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Supabase の Anon Key)
4. 「Deploy」をクリックします。

## GitHub Actions (Supabase Ping)

Supabase の無料プランは 7日間アクセスがないと停止します（停止モード）。
これを回避するため、`.github/workflows/supabase-ping.yml` に定期的（毎日）に Supabase API にアクセスする Github Actions を定義しています。

Actions を正しく動作させるためには、**GitHubリポジトリの Settings > Secrets and variables > Actions** にて、以下の Repository secrets を設定してください。
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
