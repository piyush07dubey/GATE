-- GATE CSE Platform - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. DRAWINGS (Excalidraw saves)
CREATE TABLE public.drawings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled Drawing',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drawings"
  ON public.drawings FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can create their own drawings"
  ON public.drawings FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own drawings"
  ON public.drawings FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own drawings"
  ON public.drawings FOR DELETE
  USING ( auth.uid() = user_id );


-- 3. NOTES
CREATE TABLE public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes are viewable by everyone"
  ON public.notes FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING ( auth.uid() = user_id );


-- 4. SOLUTIONS
CREATE TABLE public.solutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solutions are viewable by everyone"
  ON public.solutions FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own solutions"
  ON public.solutions FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own solutions"
  ON public.solutions FOR UPDATE
  USING ( auth.uid() = user_id );


-- 5. COMMENTS
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own comments"
  ON public.comments FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING ( auth.uid() = user_id );
