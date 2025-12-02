-- =====================================================
-- RECREATE DATABASE - Transform Personality App
-- =====================================================
-- WARNING: This script will DELETE ALL DATA and recreate the database
-- Run this in your Supabase SQL editor to completely reset the database
-- =====================================================

-- Drop all existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop all existing policies (must drop before tables)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;

DROP POLICY IF EXISTS "Anyone can view support posts" ON support_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON support_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON support_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON support_posts;

DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;

DROP POLICY IF EXISTS "Users can manage their own checkins" ON checkins;

-- Drop all tables in reverse dependency order (child tables first)
DROP TABLE IF EXISTS coping_strategies CASCADE;
DROP TABLE IF EXISTS triggers CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS support_posts CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS habit_checkins CASCADE;
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- RECREATE ALL TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  age INTEGER CHECK (age >= 13 AND age <= 120),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('smoking', 'pornography', 'alcohol', 'drugs', 'gambling', 'social_media', 'gaming', 'custom')),
  custom_name TEXT,
  description TEXT,
  quit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit check-ins table
CREATE TABLE habit_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('success', 'relapse', 'struggle')),
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  notes TEXT,
  triggers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, user_id, date)
);

-- Milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  days_count INTEGER NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('1_day', '3_days', '1_week', '2_weeks', '1_month', '3_months', '6_months', '1_year')),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  celebrated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support posts table (community feed)
CREATE TABLE support_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  category TEXT CHECK (category IN ('motivation', 'struggle', 'victory', 'question', 'support')),
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES support_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily stats table
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_clean INTEGER NOT NULL,
  money_saved DECIMAL(10, 2),
  time_saved INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Triggers table
CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coping strategies table
CREATE TABLE coping_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legacy checkins table (for backward compatibility)
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_is_active ON habits(is_active);
CREATE INDEX idx_habit_checkins_user_id ON habit_checkins(user_id);
CREATE INDEX idx_habit_checkins_habit_id ON habit_checkins(habit_id);
CREATE INDEX idx_support_posts_user_id ON support_posts(user_id);
CREATE INDEX idx_support_posts_created_at ON support_posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_habit_id ON milestones(habit_id);
CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_habit_id ON daily_stats(habit_id);
CREATE INDEX idx_triggers_user_id ON triggers(user_id);
CREATE INDEX idx_triggers_habit_id ON triggers(habit_id);
CREATE INDEX idx_coping_strategies_user_id ON coping_strategies(user_id);
CREATE INDEX idx_coping_strategies_habit_id ON coping_strategies(habit_id);
CREATE INDEX idx_checkins_user_id ON checkins(user_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coping_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_checkins
CREATE POLICY "Users can view their own habit checkins"
  ON habit_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit checkins"
  ON habit_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit checkins"
  ON habit_checkins FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for milestones
CREATE POLICY "Users can view their own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for support_posts (public read, own write)
CREATE POLICY "Anyone can view support posts"
  ON support_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own posts"
  ON support_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON support_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON support_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_stats
CREATE POLICY "Users can view their own daily stats"
  ON daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
  ON daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for triggers
CREATE POLICY "Users can view their own triggers"
  ON triggers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own triggers"
  ON triggers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own triggers"
  ON triggers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own triggers"
  ON triggers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for coping_strategies
CREATE POLICY "Users can view their own coping strategies"
  ON coping_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coping strategies"
  ON coping_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coping strategies"
  ON coping_strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coping strategies"
  ON coping_strategies FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for checkins
CREATE POLICY "Users can manage their own checkins"
  ON checkins FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Database recreation completed successfully!
-- All tables, indexes, policies, functions, and triggers have been recreated.
-- =====================================================

