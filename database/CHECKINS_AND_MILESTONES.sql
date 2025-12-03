-- Database Migration: Daily Check-ins, Milestones, and Pattern Analysis
-- Run this in your Supabase SQL editor
--
-- PREREQUISITES:
-- This migration assumes the following tables already exist:
--   - profiles (or user_profiles) 
--   - habits
-- If these don't exist, run DATABASE_SCHEMA.sql first

-- =====================================================
-- 0. Ensure prerequisites exist
-- =====================================================

-- Check if habits table exists, create if not
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if profiles table exists, create basic one if not
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 1. Create or enhance habit_checkins table
-- =====================================================

-- Create habit_checkins table if it doesn't exist
CREATE TABLE IF NOT EXISTS habit_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('success', 'relapse', 'struggle')),
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  craving_intensity INTEGER CHECK (craving_intensity >= 0 AND craving_intensity <= 10),
  reflection_note TEXT,
  notes TEXT,
  triggers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, user_id, date)
);

-- Add foreign key constraints if they don't exist and parent tables exist
DO $$ 
BEGIN
  -- Add foreign key to habits if habits table exists and constraint doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits') 
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'habit_checkins_habit_id_fkey' 
       AND table_name = 'habit_checkins'
     ) THEN
    BEGIN
      ALTER TABLE habit_checkins 
      ADD CONSTRAINT habit_checkins_habit_id_fkey 
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if constraint addition fails
      RAISE NOTICE 'Could not add foreign key constraint to habits table';
    END;
  END IF;

  -- Add foreign key to profiles if profiles table exists and constraint doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'habit_checkins_user_id_fkey' 
       AND table_name = 'habit_checkins'
     ) THEN
    BEGIN
      ALTER TABLE habit_checkins 
      ADD CONSTRAINT habit_checkins_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if constraint addition fails
      RAISE NOTICE 'Could not add foreign key constraint to profiles table';
    END;
  END IF;
END $$;

-- Add craving_intensity column if table already exists but column doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habit_checkins' AND column_name = 'craving_intensity'
  ) THEN
    ALTER TABLE habit_checkins 
    ADD COLUMN craving_intensity INTEGER CHECK (craving_intensity >= 0 AND craving_intensity <= 10);
  END IF;
END $$;

-- Add reflection_note column if table already exists but column doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habit_checkins' AND column_name = 'reflection_note'
  ) THEN
    ALTER TABLE habit_checkins 
    ADD COLUMN reflection_note TEXT;
  END IF;
END $$;

-- Ensure mood is properly constrained (1-5 scale)
DO $$
BEGIN
  -- Drop existing CHECK constraint for mood if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'CHECK'
      AND table_name = 'habit_checkins'
      AND constraint_name = 'habit_checkins_mood_check'
  ) THEN
    ALTER TABLE habit_checkins DROP CONSTRAINT habit_checkins_mood_check;
  END IF;

  -- Add new CHECK constraint for mood if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'CHECK'
      AND table_name = 'habit_checkins'
      AND constraint_name = 'habit_checkins_mood_check'
  ) THEN
    ALTER TABLE habit_checkins
    ADD CONSTRAINT habit_checkins_mood_check
    CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5));
  END IF;
END
$$;

-- =====================================================
-- 2. Create rewards and badges tables
-- =====================================================

-- User rewards table (extends existing rewards if it exists)
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'coin', 'unlockable')),
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table for tracking badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak', 'days_clean', 'checkins', 'milestone')),
  requirement_value INTEGER NOT NULL,
  coins_reward INTEGER DEFAULT 0 CHECK (coins_reward >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id, habit_id)
);

-- Unlocked content table
CREATE TABLE IF NOT EXISTS unlocked_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('theme', 'game', 'feature', 'badge')),
  content_key TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_key)
);

-- User coins/points tracking
CREATE TABLE IF NOT EXISTS user_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_coins INTEGER DEFAULT 0 CHECK (total_coins >= 0),
  earned_coins INTEGER DEFAULT 0 CHECK (earned_coins >= 0),
  spent_coins INTEGER DEFAULT 0 CHECK (spent_coins >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. Create trigger logs for pattern analysis
-- =====================================================

-- Trigger logs table for detailed trigger tracking
CREATE TABLE IF NOT EXISTS trigger_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('craving', 'slip_up', 'struggle')),
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  trigger_category TEXT CHECK (trigger_category IN ('time', 'place', 'mood', 'social', 'stress', 'boredom', 'other')),
  trigger_description TEXT,
  location TEXT,
  mood_context INTEGER CHECK (mood_context >= 1 AND mood_context <= 5),
  time_of_day TIME,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  overcame BOOLEAN DEFAULT false,
  coping_strategy_used TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern insights table for storing analyzed patterns
CREATE TABLE IF NOT EXISTS pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('time_pattern', 'place_pattern', 'mood_pattern', 'trigger_frequency')),
  pattern_description TEXT NOT NULL,
  frequency_count INTEGER DEFAULT 0,
  suggested_action TEXT,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. Create indexes for performance
-- =====================================================

-- User rewards indexes
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_unlocked_at ON user_rewards(unlocked_at DESC);

-- User badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_habit_id ON user_badges(habit_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked_at ON user_badges(unlocked_at DESC);

-- Unlocked content indexes
CREATE INDEX IF NOT EXISTS idx_unlocked_content_user_id ON unlocked_content(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_content_type ON unlocked_content(content_type);

-- Trigger logs indexes
CREATE INDEX IF NOT EXISTS idx_trigger_logs_user_id ON trigger_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_habit_id ON trigger_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_created_at ON trigger_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_trigger_category ON trigger_logs(trigger_category);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_time_of_day ON trigger_logs(time_of_day);

-- Pattern insights indexes
CREATE INDEX IF NOT EXISTS idx_pattern_insights_user_id ON pattern_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_habit_id ON pattern_insights(habit_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_insight_type ON pattern_insights(insight_type);

-- =====================================================
-- 5. Enable Row Level Security
-- =====================================================

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. Create RLS Policies
-- =====================================================

-- User rewards policies
CREATE POLICY "Users can view their own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
  ON user_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Badges policies (public read, system write)
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);

-- User badges policies
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Unlocked content policies
CREATE POLICY "Users can view their own unlocked content"
  ON unlocked_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocked content"
  ON unlocked_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User coins policies
CREATE POLICY "Users can view their own coins"
  ON user_coins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins"
  ON user_coins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins"
  ON user_coins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger logs policies
CREATE POLICY "Users can manage their own trigger logs"
  ON trigger_logs FOR ALL
  USING (auth.uid() = user_id);

-- Pattern insights policies
CREATE POLICY "Users can view their own pattern insights"
  ON pattern_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pattern insights"
  ON pattern_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pattern insights"
  ON pattern_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. Create helper functions
-- =====================================================

-- Function to calculate streak from check-ins
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID, p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Start from today and work backwards
  v_check_date := v_current_date;
  
  LOOP
    -- Check if there's a successful check-in for this date
    IF EXISTS (
      SELECT 1 FROM habit_checkins
      WHERE user_id = p_user_id
        AND habit_id = p_habit_id
        AND date = v_check_date
        AND status = 'success'
    ) THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      -- If today has no check-in, check yesterday
      IF v_check_date = v_current_date THEN
        v_check_date := v_check_date - INTERVAL '1 day';
      ELSE
        EXIT; -- Streak broken
      END IF;
    END IF;
    
    -- Safety check to prevent infinite loop
    IF v_streak > 10000 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to detect and award milestones
CREATE OR REPLACE FUNCTION check_and_award_milestones(p_user_id UUID, p_habit_id UUID, p_days_clean INTEGER)
RETURNS VOID AS $$
DECLARE
  v_milestone_type TEXT;
  v_days_count INTEGER;
BEGIN
  -- Check for milestone types based on days clean
  IF p_days_clean >= 365 THEN
    v_milestone_type := '1_year';
    v_days_count := 365;
  ELSIF p_days_clean >= 180 THEN
    v_milestone_type := '6_months';
    v_days_count := 180;
  ELSIF p_days_clean >= 90 THEN
    v_milestone_type := '3_months';
    v_days_count := 90;
  ELSIF p_days_clean >= 30 THEN
    v_milestone_type := '1_month';
    v_days_count := 30;
  ELSIF p_days_clean >= 14 THEN
    v_milestone_type := '2_weeks';
    v_days_count := 14;
  ELSIF p_days_clean >= 7 THEN
    v_milestone_type := '1_week';
    v_days_count := 7;
  ELSIF p_days_clean >= 3 THEN
    v_milestone_type := '3_days';
    v_days_count := 3;
  ELSIF p_days_clean >= 1 THEN
    v_milestone_type := '1_day';
    v_days_count := 1;
  ELSE
    RETURN; -- No milestone
  END IF;
  
  -- Insert milestone if it doesn't exist
  INSERT INTO milestones (habit_id, user_id, days_count, milestone_type)
  VALUES (p_habit_id, p_user_id, v_days_count, v_milestone_type)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

