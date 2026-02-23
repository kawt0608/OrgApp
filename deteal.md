# **📝 AI実装依頼用プロンプト：オリジナルブログアプリ**

## **【依頼の概要】**

Next.jsとSupabaseを利用した「オリジナルブログアプリ」の開発をお願いします。

これはプログラミング課題の最終提出物となるため、後述する【課題の必須要件】（Vercelへのデプロイ、GitHub ActionsによるSupabaseのPing処理など）を絶対に満たすように実装・設定ファイルの作成を行ってください。

ベースとなるブログ機能（CRUD）に加え、オリジナル要素として「マークダウン記法での記事作成・表示」と、未ログインユーザーでも押せる「いいね機能」を実装してください。

## **【技術スタック】**

* **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React (アイコン), react-markdown (マークダウン表示用)  
* **Backend/DB/Auth:** Supabase (Database, Authentication)  
* **CI/CD・ホスティング:** GitHub Actions, Vercel

## **【基本ルールとユーザーフロー】**

1. **一般ユーザー（未ログイン）:**  
   * トップページで公開済みの記事一覧を閲覧できる。  
   * 記事詳細ページでマークダウンで装飾された本文を読める。  
   * 記事に対して「いいね」ボタンを押すことができる（ログイン不要で押せる簡易的な仕様）。  
2. **管理者（ログイン必須）:**  
   * Supabase Authを用いてログインする（Eメール/パスワード）。  
   * 専用の管理画面（ダッシュボード）から、記事の「作成」「編集」「削除」「公開/非公開の切り替え」ができる。  
   * 記事作成はテキストエリアにマークダウン形式で入力する。

## **【1. データベース設計 (Supabase SQL)】**

以下のテーブルを作成するSQLを考慮して実装を行ってください。Row Level Security (RLS) の設定も適切に行ってください。

\-- 記事情報  
CREATE TABLE posts (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  title text NOT NULL,  
  content text NOT NULL, \-- マークダウン形式で保存  
  is\_published boolean DEFAULT false,  
  likes\_count int DEFAULT 0,  
  created\_at timestamp with time zone DEFAULT now(),  
  updated\_at timestamp with time zone DEFAULT now()  
);

\-- いいね履歴（連続押し防止などの拡張用 / 簡易実装の場合は posts テーブルの count 更新だけでも可）  
CREATE TABLE post\_likes (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  post\_id uuid REFERENCES posts(id) ON DELETE CASCADE,  
  created\_at timestamp with time zone DEFAULT now()  
);

## **【2. 実装すべき主要機能とディレクトリ構成】**

以下の構成でプロジェクトを作成してください。

### **① 認証とセッション管理**

* Supabase Authを利用したログイン機能 (/login ページ)。  
* middleware.ts を用いて、/admin 以下のルートを保護（未ログイン時は /login にリダイレクト）。

### **② ユーザー向け画面 (/ および /posts/\[id\])**

* **トップページ (/page.tsx)**: is\_published \= true の記事一覧を降順で表示。  
* **記事詳細 (/posts/\[id\]/page.tsx)**: react-markdown などを利用して本文をHTMLに変換して表示。いいねボタン（クリックでSupabaseの数値をインクリメント）を配置。

### **③ 管理者向け画面 (/admin/\*)**

* **ダッシュボード (/admin/page.tsx)**: 全記事の一覧表示と、新規作成・編集・削除ボタンの配置。  
* **記事エディタ (/admin/posts/new, /admin/posts/\[id\]/edit)**: タイトル入力欄、本文入力欄（マークダウン）、公開ステータスのトグルスイッチ。

## **【3. 課題の必須要件（インフラ・保守）】 ※超重要**

以下の要件を満たすための設定ファイルやドキュメントを必ず生成してください。

1. **VercelへのデプロイとGitHub連携:**  
   * アプリはVercelで動作することを前提としてください。環境変数（NEXT\_PUBLIC\_SUPABASE\_URL など）の設定方法をREADMEに記載してください。  
2. **Supabase停止モード回避 (GitHub Actions):**  
   * Supabaseの無料プランは7日間アクセスがないと停止します。これを防ぐため、データベースに定期的にPingを飛ばす（軽量なSELECTクエリを実行する等）GitHub Actionsのワークフローファイル（.github/workflows/supabase-ping.yml）を作成してください。  
   * 毎日または週数回実行され、ログが正常に残るようにしてください。  
3. **評価者用のテストアカウント情報:**  
   * データベースの初期データ（Seed）またはREADMEに、評価者が動作確認するためのテスト用ログイン情報（例: admin@example.com / password123）を明記し、作成手順を案内してください。

上記の内容を踏まえ、プロジェクトの初期化コマンド、各種コンポーネントのコード、および必要な設定ファイル（GitHub Actions含む）を一式生成してください。