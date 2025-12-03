-- Database Migration: Enhanced Onboarding and Personalized Quit Plans
-- Run this in your Supabase SQL editor

-- =====================================================
-- 1. Expand habit types in habits table
-- =====================================================

-- Add type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habits' AND column_name = 'type'
  ) THEN
    ALTER TABLE habits ADD COLUMN type TEXT DEFAULT 'custom';
  END IF;
END $$;

-- Drop existing constraint if it exists
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_type_check;

-- Add new constraint with expanded types
ALTER TABLE habits 
ADD CONSTRAINT habits_type_check 
CHECK (type IN (
  'smoking', 
  'alcohol', 
  'gambling', 
  'gaming', 
  'gaming_addiction',
  'pornography',
  'pornography_addiction',
  'drugs',
  'substance_abuse',
  'social_media',
  'social_media_overuse',
  'junk_food',
  'procrastination',
  'anger_issues',
  'toxic_relationships',
  'overspending',
  'custom'
));

-- =====================================================
-- 2. Enhance habits table with new fields
-- =====================================================

-- Add quit_date if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habits' AND column_name = 'quit_date'
  ) THEN
    ALTER TABLE habits ADD COLUMN quit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS hardcore_mode BOOLEAN DEFAULT false;

ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS plan_id UUID;

ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 10);

ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS accountability_enabled BOOLEAN DEFAULT false;

-- =====================================================
-- 3. Create questionnaire_responses table
-- =====================================================

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  question_category TEXT NOT NULL CHECK (question_category IN ('basic', 'impact', 'motivation', 'severity', 'behavior_specific')),
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response_text TEXT,
  response_number INTEGER,
  response_array TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, question_category, question_key)
);

-- =====================================================
-- 4. Create quit_plans table
-- =====================================================

CREATE TABLE IF NOT EXISTS quit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_description TEXT,
  high_risk_times TEXT[],
  high_risk_places TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. Create daily_routines table
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES quit_plans(id) ON DELETE CASCADE,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'midday', 'evening')),
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('reflection', 'check_in', 'exercise', 'journaling', 'breathing', 'activity')),
  scheduled_time TIME,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. Create challenges table
-- =====================================================

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES quit_plans(id) ON DELETE CASCADE,
  challenge_name TEXT NOT NULL,
  challenge_description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('detox', 'trigger_resistance', 'device_limit', 'money_saving', 'custom')),
  duration_days INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  is_completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. Create hardcore_mode_settings table
-- =====================================================

CREATE TABLE IF NOT EXISTS hardcore_mode_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  zero_tolerance_enabled BOOLEAN DEFAULT true,
  mandatory_checkin_enabled BOOLEAN DEFAULT true,
  checkin_deadline TIME,
  feature_lock_enabled BOOLEAN DEFAULT true,
  locked_features TEXT[],
  random_tasks_enabled BOOLEAN DEFAULT false,
  accountability_partner_enabled BOOLEAN DEFAULT false,
  accountability_partner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints conditionally
DO $$ 
BEGIN
  -- Add foreign key to habits if habits table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'hardcore_mode_settings_habit_id_fkey' 
       AND table_name = 'hardcore_mode_settings'
     ) THEN
    BEGIN
      ALTER TABLE hardcore_mode_settings 
      ADD CONSTRAINT hardcore_mode_settings_habit_id_fkey 
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add foreign key constraint to habits table';
    END;
  END IF;

  -- Add foreign key to auth.users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'hardcore_mode_settings_user_id_fkey' 
    AND table_name = 'hardcore_mode_settings'
  ) THEN
    BEGIN
      ALTER TABLE hardcore_mode_settings 
      ADD CONSTRAINT hardcore_mode_settings_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add foreign key constraint to auth.users';
    END;
  END IF;
END $$;

-- =====================================================
-- 8. Create accountability_partners table
-- =====================================================

CREATE TABLE IF NOT EXISTS accountability_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_email TEXT,
  partner_name TEXT,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL CHECK (access_level IN ('view_progress', 'view_checkins', 'view_milestones', 'receive_alerts')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. Create urge_blockers table
-- =====================================================

CREATE TABLE IF NOT EXISTS urge_blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  blocker_type TEXT NOT NULL CHECK (blocker_type IN ('timer', 'sos_coping', 'grounding', 'motivation', 'breathing')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  is_favorite BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. Create behavior_insights table
-- =====================================================

CREATE TABLE IF NOT EXISTS behavior_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('risk_prediction', 'trigger_analysis', 'progress_analysis', 'relapse_warning')),
  insight_title TEXT NOT NULL,
  insight_description TEXT NOT NULL,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  predicted_date DATE,
  recommended_actions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. Create personalized_tasks table
-- =====================================================

CREATE TABLE IF NOT EXISTS personalized_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES quit_plans(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_category TEXT NOT NULL CHECK (task_category IN ('replacement_activity', 'coping_exercise', 'breathing', 'journaling', 'stress_relief')),
  estimated_minutes INTEGER,
  is_completed BOOLEAN DEFAULT false,
  completion_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. Create indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_habit_id ON questionnaire_responses(habit_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_user_id ON questionnaire_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_quit_plans_habit_id ON quit_plans(habit_id);
CREATE INDEX IF NOT EXISTS idx_quit_plans_user_id ON quit_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_routines_plan_id ON daily_routines(plan_id);
CREATE INDEX IF NOT EXISTS idx_challenges_plan_id ON challenges(plan_id);
CREATE INDEX IF NOT EXISTS idx_hardcore_mode_settings_habit_id ON hardcore_mode_settings(habit_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_user_id ON accountability_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_urge_blockers_habit_id ON urge_blockers(habit_id);
CREATE INDEX IF NOT EXISTS idx_behavior_insights_habit_id ON behavior_insights(habit_id);

-- =====================================================
-- 13. Enable Row Level Security
-- =====================================================

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardcore_mode_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE urge_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 14. Create RLS Policies
-- =====================================================

-- Questionnaire responses policies
CREATE POLICY "Users can manage their own questionnaire responses"
  ON questionnaire_responses FOR ALL
  USING (auth.uid() = user_id);

-- Quit plans policies
CREATE POLICY "Users can manage their own quit plans"
  ON quit_plans FOR ALL
  USING (auth.uid() = user_id);

-- Daily routines policies
CREATE POLICY "Users can view routines for their plans"
  ON daily_routines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quit_plans 
      WHERE quit_plans.id = daily_routines.plan_id 
      AND quit_plans.user_id = auth.uid()
    )
  );

-- Challenges policies
CREATE POLICY "Users can view challenges for their plans"
  ON challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quit_plans 
      WHERE quit_plans.id = challenges.plan_id 
      AND quit_plans.user_id = auth.uid()
    )
  );

-- Hardcore mode settings policies
CREATE POLICY "Users can manage their own hardcore mode settings"
  ON hardcore_mode_settings FOR ALL
  USING (auth.uid() = user_id);

-- Accountability partners policies
CREATE POLICY "Users can manage their own accountability partners"
  ON accountability_partners FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = partner_user_id);

-- Urge blockers policies
CREATE POLICY "Users can manage their own urge blockers"
  ON urge_blockers FOR ALL
  USING (auth.uid() = user_id);

-- Behavior insights policies
CREATE POLICY "Users can view their own behavior insights"
  ON behavior_insights FOR SELECT
  USING (auth.uid() = user_id);

-- Personalized tasks policies
CREATE POLICY "Users can view tasks for their plans"
  ON personalized_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quit_plans 
      WHERE quit_plans.id = personalized_tasks.plan_id 
      AND quit_plans.user_id = auth.uid()
    )
  );

-- =====================================================
-- 15. Update habits foreign key for plan_id
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'habits_plan_id_fkey' 
    AND table_name = 'habits'
  ) THEN
    ALTER TABLE habits 
    ADD CONSTRAINT habits_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES quit_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

