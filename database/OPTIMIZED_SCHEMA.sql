-- =====================================================
-- OPTIMIZED DATABASE SCHEMA - Transform Personality App
-- =====================================================
-- This schema includes all tables with proper ordering,
-- indexes, constraints, and RLS policies for optimal performance
-- =====================================================

-- =====================================================
-- DROP EXISTING OBJECTS (if recreating)
-- =====================================================

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop policies (will be recreated)
-- Note: Policies are dropped automatically when tables are dropped

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS user_followers CASCADE;
DROP TABLE IF EXISTS success_stories CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS event_members CASCADE;
DROP TABLE IF EXISTS media_files CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS urges CASCADE;
DROP TABLE IF EXISTS habit_progress CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS gamification CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- CREATE TABLES (in dependency order)
-- =====================================================

-- User Profiles table (extends auth.users)
-- Note: This can be merged with existing 'profiles' table or kept separate
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  display_name TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  avatar_url TEXT,
  is_profile_public BOOLEAN DEFAULT false,
  show_streak BOOLEAN DEFAULT true,
  show_before_after BOOLEAN DEFAULT false,
  show_success_stories BOOLEAN DEFAULT true,
  total_days_clean INTEGER DEFAULT 0 CHECK (total_days_clean >= 0),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  total_posts INTEGER DEFAULT 0 CHECK (total_posts >= 0),
  total_likes_received INTEGER DEFAULT 0 CHECK (total_likes_received >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  badges JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Gamification table
CREATE TABLE gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  streak INTEGER DEFAULT 0 CHECK (streak >= 0),
  last_activity DATE,
  badges JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habit Progress table
CREATE TABLE habit_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status = ANY (ARRAY['completed'::text, 'skipped'::text, 'failed'::text])),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, habit_id, progress_date)
);

-- Urges table
CREATE TABLE urges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  trigger TEXT,
  notes TEXT CHECK (char_length(notes) <= 1000),
  overcome BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  achievement_type TEXT NOT NULL CHECK (char_length(achievement_type) >= 1),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  description TEXT CHECK (char_length(description) <= 1000),
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  google_drive_folder_id TEXT,
  s3_bucket_path TEXT,
  share_link TEXT NOT NULL UNIQUE,
  share_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  plan_type TEXT DEFAULT 'free'::text CHECK (plan_type = ANY (ARRAY['free'::text, 'paid'::text])),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Event Members table
CREATE TABLE event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  permission TEXT DEFAULT 'write'::text CHECK (permission = ANY (ARRAY['read'::text, 'write'::text])),
  UNIQUE(event_id, user_id)
);

-- Media Files table
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL CHECK (char_length(file_name) >= 1),
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type = ANY (ARRAY['image'::text, 'video'::text])),
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  mime_type TEXT NOT NULL,
  width INTEGER CHECK (width > 0),
  height INTEGER CHECK (height > 0),
  duration INTEGER CHECK (duration >= 0),
  local_uri TEXT NOT NULL,
  remote_uri TEXT,
  thumbnail_uri TEXT,
  upload_status TEXT DEFAULT 'pending'::text CHECK (upload_status = ANY (ARRAY['pending'::text, 'uploading'::text, 'completed'::text, 'failed'::text])),
  upload_progress INTEGER DEFAULT 0 CHECK (upload_progress >= 0 AND upload_progress <= 100),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_at TIMESTAMP WITH TIME ZONE
);

-- Community Posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) >= 10),
  category TEXT NOT NULL CHECK (category = ANY (ARRAY['success'::text, 'support'::text, 'question'::text, 'motivation'::text, 'general'::text])),
  images TEXT[] DEFAULT ARRAY[]::text[],
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  is_pinned BOOLEAN DEFAULT false,
  is_reported BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Post Comments table
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  is_deleted BOOLEAN DEFAULT false,
  is_reported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Post Likes table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Comment Likes table
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Content Reports table
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type = ANY (ARRAY['post'::text, 'comment'::text, 'user'::text])),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason = ANY (ARRAY['spam'::text, 'harassment'::text, 'inappropriate'::text, 'misinformation'::text, 'other'::text])),
  description TEXT CHECK (char_length(description) <= 500),
  status TEXT DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'dismissed'::text])),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Success Stories table
CREATE TABLE success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  story TEXT NOT NULL CHECK (char_length(story) >= 50),
  days_clean INTEGER NOT NULL CHECK (days_clean >= 0),
  before_image_url TEXT,
  after_image_url TEXT,
  additional_images TEXT[] DEFAULT ARRAY[]::text[],
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Followers table
CREATE TABLE user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- User Notifications table
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type = ANY (ARRAY['like'::text, 'comment'::text, 'follow'::text, 'mention'::text, 'achievement'::text, 'system'::text])),
  title TEXT NOT NULL CHECK (char_length(title) >= 1),
  message TEXT NOT NULL CHECK (char_length(message) >= 1),
  related_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  related_post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1),
  description TEXT CHECK (char_length(description) <= 500),
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User Profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active DESC);

-- Gamification indexes
CREATE INDEX idx_gamification_user_id ON gamification(user_id);
CREATE INDEX idx_gamification_level ON gamification(level DESC);
CREATE INDEX idx_gamification_xp ON gamification(xp DESC);

-- Habits indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_is_active ON habits(is_active) WHERE is_active = true;
CREATE INDEX idx_habits_created_at ON habits(created_at DESC);

-- Habit Progress indexes
CREATE INDEX idx_habit_progress_user_id ON habit_progress(user_id);
CREATE INDEX idx_habit_progress_habit_id ON habit_progress(habit_id);
CREATE INDEX idx_habit_progress_date ON habit_progress(progress_date DESC);
CREATE INDEX idx_habit_progress_user_habit_date ON habit_progress(user_id, habit_id, progress_date);

-- Urges indexes
CREATE INDEX idx_urges_user_id ON urges(user_id);
CREATE INDEX idx_urges_habit_id ON urges(habit_id);
CREATE INDEX idx_urges_timestamp ON urges(timestamp DESC);
CREATE INDEX idx_urges_user_habit ON urges(user_id, habit_id);

-- Achievements indexes
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_habit_id ON achievements(habit_id);
CREATE INDEX idx_achievements_unlocked_at ON achievements(unlocked_at DESC);

-- Events indexes
CREATE INDEX idx_events_host_user_id ON events(host_user_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_is_active ON events(is_active) WHERE is_active = true;
CREATE INDEX idx_events_share_token ON events(share_token);

-- Event Members indexes
CREATE INDEX idx_event_members_event_id ON event_members(event_id);
CREATE INDEX idx_event_members_user_id ON event_members(user_id);
CREATE INDEX idx_event_members_event_user ON event_members(event_id, user_id);

-- Media Files indexes
CREATE INDEX idx_media_files_event_id ON media_files(event_id);
CREATE INDEX idx_media_files_user_id ON media_files(user_id);
CREATE INDEX idx_media_files_upload_status ON media_files(upload_status);
CREATE INDEX idx_media_files_created_at ON media_files(created_at DESC);

-- Community Posts indexes
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_is_pinned ON community_posts(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_community_posts_is_deleted ON community_posts(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_community_posts_likes_count ON community_posts(likes_count DESC);

-- Post Comments indexes
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX idx_post_comments_parent_comment_id ON post_comments(parent_comment_id);
CREATE INDEX idx_post_comments_created_at ON post_comments(created_at DESC);
CREATE INDEX idx_post_comments_is_deleted ON post_comments(is_deleted) WHERE is_deleted = false;

-- Post Likes indexes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_likes_post_user ON post_likes(post_id, user_id);

-- Comment Likes indexes
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_comment_likes_comment_user ON comment_likes(comment_id, user_id);

-- Content Reports indexes
CREATE INDEX idx_content_reports_reporter_id ON content_reports(reporter_id);
CREATE INDEX idx_content_reports_content_type_id ON content_reports(content_type, content_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_created_at ON content_reports(created_at DESC);

-- Success Stories indexes
CREATE INDEX idx_success_stories_author_id ON success_stories(author_id);
CREATE INDEX idx_success_stories_is_featured ON success_stories(is_featured) WHERE is_featured = true;
CREATE INDEX idx_success_stories_is_verified ON success_stories(is_verified) WHERE is_verified = true;
CREATE INDEX idx_success_stories_days_clean ON success_stories(days_clean DESC);
CREATE INDEX idx_success_stories_created_at ON success_stories(created_at DESC);

-- User Followers indexes
CREATE INDEX idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX idx_user_followers_following_id ON user_followers(following_id);
CREATE INDEX idx_user_followers_follower_following ON user_followers(follower_id, following_id);

-- User Notifications indexes
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX idx_user_notifications_user_read ON user_notifications(user_id, is_read, created_at DESC);

-- Rewards indexes
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_rewards_claimed ON rewards(claimed) WHERE claimed = false;
CREATE INDEX idx_rewards_created_at ON rewards(created_at DESC);

-- =====================================================
-- CREATE FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on habits
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on habit_progress
CREATE TRIGGER update_habit_progress_updated_at
  BEFORE UPDATE ON habit_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on community_posts
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on post_comments
CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on success_stories
CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON success_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE urges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- User Profiles Policies
CREATE POLICY "Users can view public profiles or their own"
  ON user_profiles FOR SELECT
  USING (is_profile_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gamification Policies
CREATE POLICY "Users can view their own gamification"
  ON gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification"
  ON gamification FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification"
  ON gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Habits Policies
CREATE POLICY "Users can manage their own habits"
  ON habits FOR ALL
  USING (auth.uid() = user_id);

-- Habit Progress Policies
CREATE POLICY "Users can manage their own habit progress"
  ON habit_progress FOR ALL
  USING (auth.uid() = user_id);

-- Urges Policies
CREATE POLICY "Users can manage their own urges"
  ON urges FOR ALL
  USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON achievements FOR INSERT
  WITH CHECK (true);

-- Events Policies
CREATE POLICY "Users can view events they're members of"
  ON events FOR SELECT
  USING (
    host_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_id = events.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their events"
  ON events FOR UPDATE
  USING (auth.uid() = host_user_id);

-- Event Members Policies
CREATE POLICY "Users can view members of events they're in"
  ON event_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_members.event_id
      AND (events.host_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM event_members em2
        WHERE em2.event_id = events.id AND em2.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can join events"
  ON event_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Media Files Policies
CREATE POLICY "Users can view media in events they're members of"
  ON media_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media_files.event_id
      AND (events.host_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM event_members
        WHERE event_id = events.id AND user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can upload media to events they're members of"
  ON media_files FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media_files.event_id
      AND (events.host_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM event_members
        WHERE event_id = events.id AND user_id = auth.uid()
      ))
    )
  );

-- Community Posts Policies
CREATE POLICY "Anyone can view non-deleted posts"
  ON community_posts FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

-- Post Comments Policies
CREATE POLICY "Anyone can view non-deleted comments"
  ON post_comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

CREATE POLICY "Users can update their own comments"
  ON post_comments FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

-- Post Likes Policies
CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comment Likes Policies
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Content Reports Policies
CREATE POLICY "Users can create reports"
  ON content_reports FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = reporter_id)
  );

CREATE POLICY "Users can view their own reports"
  ON content_reports FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = reporter_id)
  );

-- Success Stories Policies
CREATE POLICY "Anyone can view verified success stories"
  ON success_stories FOR SELECT
  USING (is_verified = true OR is_featured = true);

CREATE POLICY "Users can view their own success stories"
  ON success_stories FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

CREATE POLICY "Users can create success stories"
  ON success_stories FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

CREATE POLICY "Users can update their own success stories"
  ON success_stories FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = author_id)
  );

-- User Followers Policies
CREATE POLICY "Anyone can view followers"
  ON user_followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_followers FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = follower_id)
  );

CREATE POLICY "Users can unfollow"
  ON user_followers FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = follower_id)
  );

-- User Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON user_notifications FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = user_id)
  );

CREATE POLICY "Users can update their own notifications"
  ON user_notifications FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE id = user_id)
  );

-- Rewards Policies
CREATE POLICY "Users can view their own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
  ON rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- COMPLETION
-- =====================================================
-- Optimized schema created successfully!
-- All tables, indexes, constraints, functions, triggers, and RLS policies are in place.
-- =====================================================

