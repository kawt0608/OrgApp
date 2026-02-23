-- ---------------------------------------------------------------------------------
-- 【Supabase SQL (Multi-User Accounts 対応版)】
-- 新規環境構築用、もしくは既存テーブルの再作成用です。
-- (※既存にデータがある場合はDROP CASCADEで全て消去されるので注意してください)
-- ---------------------------------------------------------------------------------

DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ユーザープロファイルテーブル (Supabase Auth の users テーブルと連携)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 記事情報テーブル
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL, -- マークダウン形式で保存
  image_url text, -- カバー画像URL
  is_published boolean DEFAULT false,
  likes_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- いいね履歴テーブル
CREATE TABLE post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- RLS (Row Level Security) の設定
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- profiles テーブルのポリシー
-- ------------------------------------------
-- 誰でもプロフィールの閲覧は可能
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

-- ユーザー本人のみ自分のプロフィールを作成可能 (サインアップ時のトリガー等を考慮)
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- ユーザー本人のみ自分のプロフィールを更新可能
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- ------------------------------------------
-- posts テーブルのポリシー
-- ------------------------------------------
-- 誰でも公開済みの記事を閲覧可能、または自分の記事は未公開でも全て見れる
CREATE POLICY "Public profiles are viewable by everyone."
  ON posts FOR SELECT
  USING ( is_published = true OR auth.uid() = author_id );

-- 認証済みユーザーは「自分をauthor_idとして」投稿作成可能
CREATE POLICY "Authenticated users can insert their own posts"
  ON posts FOR INSERT
  WITH CHECK ( auth.uid() = author_id );

-- 認証済みユーザーは「自分の記事のみ」更新可能
CREATE POLICY "Authenticated users can update their own posts"
  ON posts FOR UPDATE
  USING ( auth.uid() = author_id );

-- 認証済みユーザーは「自分の記事のみ」削除可能
CREATE POLICY "Authenticated users can delete their own posts"
  ON posts FOR DELETE
  USING ( auth.uid() = author_id );

-- ------------------------------------------
-- post_likes テーブルのポリシー
-- ------------------------------------------
-- 誰でもいいねを作成（インサート）可能
CREATE POLICY "Anyone can insert likes"
  ON post_likes FOR INSERT
  WITH CHECK ( true );

-- いいねの閲覧は誰でも可能
CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  USING ( true );


-- ==========================================
-- Storage (画像保存用バケット) の設定
-- ==========================================
-- ※Storage機能（storage.objects等）のテーブルはSupabase側で自動用意される前提です
-- post-images バケットの作成
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage の RLS設定
-- 誰でも画像を参照可能
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post-images' );

-- 認証済みユーザーのみ画像をアップロード可能
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- 認証済みユーザーは自身の画像を削除・更新可能
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-images' 
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images' 
  AND auth.uid() = owner
);
