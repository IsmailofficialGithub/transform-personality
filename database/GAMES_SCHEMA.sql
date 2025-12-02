-- =====================================================
-- GAMES DATABASE SCHEMA
-- =====================================================
-- Tables for storing game scores, progress, missions, and achievements
-- =====================================================

-- Game Types Enum (for reference)
-- 1. galaxy_runner
-- 2. zombie_escape
-- 3. mystery_puzzle_quest
-- 4. sky_islands_builder
-- 5. drift_city_racing
-- 6. ninja_shadow_strike
-- 7. pet_world_tycoon
-- 8. dungeon_explorer_rpg
-- 9. space_chess_tactics
-- 10. bubble_pop_adventure

-- Game Scores Table
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN (
    'galaxy_runner',
    'zombie_escape',
    'mystery_puzzle_quest',
    'sky_islands_builder',
    'drift_city_racing',
    'ninja_shadow_strike',
    'pet_world_tycoon',
    'dungeon_explorer_rpg',
    'space_chess_tactics',
    'bubble_pop_adventure'
  )),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  distance INTEGER DEFAULT 0 CHECK (distance >= 0), -- For runner games
  time_played INTEGER DEFAULT 0 CHECK (time_played >= 0), -- In seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, game_type)
);

-- Game Missions Table
CREATE TABLE IF NOT EXISTS game_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  mission_description TEXT,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'achievement', 'story')),
  target_value INTEGER NOT NULL,
  reward_coins INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Mission Progress Table
CREATE TABLE IF NOT EXISTS user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES game_missions(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_reward BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Game Achievements Table
CREATE TABLE IF NOT EXISTS game_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Game Inventory Table (for items, skins, power-ups, etc.)
CREATE TABLE IF NOT EXISTS game_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('skin', 'powerup', 'weapon', 'vehicle', 'character', 'boost')),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  is_equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Game Statistics Table (for detailed stats per game)
CREATE TABLE IF NOT EXISTS game_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  stat_name TEXT NOT NULL,
  stat_value INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, game_type, stat_name)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_missions_game_type ON game_missions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_missions_is_active ON game_missions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_id ON user_mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_mission_id ON user_mission_progress(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_completed ON user_mission_progress(is_completed) WHERE is_completed = false;
CREATE INDEX IF NOT EXISTS idx_game_achievements_user_id ON game_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_game_achievements_game_type ON game_achievements(game_type);
CREATE INDEX IF NOT EXISTS idx_game_inventory_user_id ON game_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_game_inventory_game_type ON game_inventory(game_type);
CREATE INDEX IF NOT EXISTS idx_game_statistics_user_id ON game_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_game_type ON game_statistics(game_type);

-- Enable RLS
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own game scores"
  ON game_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own game scores"
  ON game_scores FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active missions"
  ON game_missions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their own mission progress"
  ON user_mission_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mission progress"
  ON user_mission_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements"
  ON game_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON game_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own inventory"
  ON game_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own inventory"
  ON game_inventory FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own statistics"
  ON game_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own statistics"
  ON game_statistics FOR ALL
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_game_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_game_scores_updated_at
  BEFORE UPDATE ON game_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_game_updated_at();

CREATE TRIGGER update_user_mission_progress_updated_at
  BEFORE UPDATE ON user_mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_game_updated_at();

CREATE TRIGGER update_game_statistics_updated_at
  BEFORE UPDATE ON game_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_game_updated_at();

