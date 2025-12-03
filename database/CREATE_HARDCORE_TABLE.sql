-- Quick fix: Create hardcore_mode_settings table if it doesn't exist
-- Run this if you get "table not found" error

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

-- Add foreign key constraints if parent tables exist
DO $$ 
BEGIN
  -- Add foreign key to habits if it doesn't exist and habits table exists
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

  -- Add foreign key to auth.users if it doesn't exist
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_hardcore_mode_settings_habit_id ON hardcore_mode_settings(habit_id);
CREATE INDEX IF NOT EXISTS idx_hardcore_mode_settings_user_id ON hardcore_mode_settings(user_id);

-- Enable RLS
ALTER TABLE hardcore_mode_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can manage their own hardcore mode settings" ON hardcore_mode_settings;
CREATE POLICY "Users can manage their own hardcore mode settings"
  ON hardcore_mode_settings FOR ALL
  USING (auth.uid() = user_id);


