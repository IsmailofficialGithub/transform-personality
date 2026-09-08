# Transform App - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [What Has Been Done](#what-has-been-done)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Application Flow](#application-flow)
7. [Key Functions & Locations](#key-functions--locations)
8. [State Management](#state-management)
9. [Services & APIs](#services--apis)
10. [Configuration](#configuration)
11. [Package Dependencies](#package-dependencies)
12. [Development Setup](#development-setup)


## Supabase public Database

  -- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  habit_id uuid,
  achievement_type text NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id),
  CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.comment_likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_likes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.community_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  content text NOT NULL CHECK (char_length(content) >= 10),
  category text NOT NULL CHECK (category = ANY (ARRAY['success'::text, 'support'::text, 'question'::text, 'motivation'::text, 'general'::text])),
  images ARRAY DEFAULT ARRAY[]::text[],
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  is_reported boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_posts_pkey PRIMARY KEY (id),
  CONSTRAINT community_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.content_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['post'::text, 'comment'::text, 'user'::text])),
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason = ANY (ARRAY['spam'::text, 'harassment'::text, 'inappropriate'::text, 'misinformation'::text, 'other'::text])),
  description text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'dismissed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  CONSTRAINT content_reports_pkey PRIMARY KEY (id),
  CONSTRAINT content_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.user_profiles(id),
  CONSTRAINT content_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.event_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  permission text DEFAULT 'write'::text CHECK (permission = ANY (ARRAY['read'::text, 'write'::text])),
  CONSTRAINT event_members_pkey PRIMARY KEY (id),
  CONSTRAINT event_members_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  host_user_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  google_drive_folder_id text,
  s3_bucket_path text,
  share_link text NOT NULL UNIQUE,
  share_token text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  plan_type text DEFAULT 'free'::text CHECK (plan_type = ANY (ARRAY['free'::text, 'paid'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gamification (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  last_activity date,
  badges jsonb DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gamification_pkey PRIMARY KEY (id),
  CONSTRAINT gamification_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.habit_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  habit_id uuid,
  progress_date date DEFAULT CURRENT_DATE,
  status text CHECK (status = ANY (ARRAY['completed'::text, 'skipped'::text, 'failed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT habit_progress_pkey PRIMARY KEY (id),
  CONSTRAINT habit_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT habit_progress_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id)
);
CREATE TABLE public.habits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT habits_pkey PRIMARY KEY (id),
  CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.media_files (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL CHECK (file_type = ANY (ARRAY['image'::text, 'video'::text])),
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  width integer,
  height integer,
  duration integer,
  local_uri text NOT NULL,
  remote_uri text,
  thumbnail_uri text,
  upload_status text DEFAULT 'pending'::text CHECK (upload_status = ANY (ARRAY['pending'::text, 'uploading'::text, 'completed'::text, 'failed'::text])),
  upload_progress integer DEFAULT 0,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  uploaded_at timestamp with time zone,
  CONSTRAINT media_files_pkey PRIMARY KEY (id),
  CONSTRAINT media_files_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.post_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  parent_comment_id uuid,
  content text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  likes_count integer DEFAULT 0,
  is_deleted boolean DEFAULT false,
  is_reported boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id),
  CONSTRAINT post_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.user_profiles(id),
  CONSTRAINT post_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.post_comments(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rewards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  title text NOT NULL,
  description text,
  points integer DEFAULT 0,
  claimed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rewards_pkey PRIMARY KEY (id),
  CONSTRAINT rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.success_stories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  story text NOT NULL CHECK (char_length(story) >= 50),
  days_clean integer NOT NULL,
  before_image_url text,
  after_image_url text,
  additional_images ARRAY DEFAULT ARRAY[]::text[],
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT success_stories_pkey PRIMARY KEY (id),
  CONSTRAINT success_stories_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.urges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  habit_id uuid NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  trigger text,
  notes text,
  overcome boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT urges_pkey PRIMARY KEY (id),
  CONSTRAINT urges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_followers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_followers_pkey PRIMARY KEY (id),
  CONSTRAINT user_followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.user_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['like'::text, 'comment'::text, 'follow'::text, 'mention'::text, 'achievement'::text, 'system'::text])),
  title text NOT NULL,
  message text NOT NULL,
  related_user_id uuid,
  related_post_id uuid,
  related_comment_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT user_notifications_related_post_id_fkey FOREIGN KEY (related_post_id) REFERENCES public.community_posts(id),
  CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_notifications_related_comment_id_fkey FOREIGN KEY (related_comment_id) REFERENCES public.post_comments(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  username text NOT NULL UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  display_name text,
  bio text,
  avatar_url text,
  is_profile_public boolean DEFAULT false,
  show_streak boolean DEFAULT true,
  show_before_after boolean DEFAULT false,
  show_success_stories boolean DEFAULT true,
  total_days_clean integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_posts integer DEFAULT 0,
  total_likes_received integer DEFAULT 0,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  joined_at timestamp with time zone DEFAULT now(),
  last_active timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
); 

## supabase auth 

  -- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE auth.audit_log_entries (
  instance_id uuid,
  id uuid NOT NULL,
  payload json,
  created_at timestamp with time zone,
  ip_address character varying NOT NULL DEFAULT ''::character varying,
  CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.flow_state (
  id uuid NOT NULL,
  user_id uuid,
  auth_code text NOT NULL,
  code_challenge_method USER-DEFINED NOT NULL,
  code_challenge text NOT NULL,
  provider_type text NOT NULL,
  provider_access_token text,
  provider_refresh_token text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  authentication_method text NOT NULL,
  auth_code_issued_at timestamp with time zone,
  CONSTRAINT flow_state_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.identities (
  provider_id text NOT NULL,
  user_id uuid NOT NULL,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  email text DEFAULT lower((identity_data ->> 'email'::text)),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT identities_pkey PRIMARY KEY (id),
  CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.instances (
  id uuid NOT NULL,
  uuid uuid,
  raw_base_config text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT instances_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.mfa_amr_claims (
  session_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  authentication_method text NOT NULL,
  id uuid NOT NULL,
  CONSTRAINT mfa_amr_claims_pkey PRIMARY KEY (id),
  CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id)
);
CREATE TABLE auth.mfa_challenges (
  id uuid NOT NULL,
  factor_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  verified_at timestamp with time zone,
  ip_address inet NOT NULL,
  otp_code text,
  web_authn_session_data jsonb,
  CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id)
);
CREATE TABLE auth.mfa_factors (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  friendly_name text,
  factor_type USER-DEFINED NOT NULL,
  status USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  secret text,
  phone text,
  last_challenged_at timestamp with time zone UNIQUE,
  web_authn_credential jsonb,
  web_authn_aaguid uuid,
  last_webauthn_challenge_data jsonb,
  CONSTRAINT mfa_factors_pkey PRIMARY KEY (id),
  CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.oauth_authorizations (
  id uuid NOT NULL,
  authorization_id text NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  user_id uuid,
  redirect_uri text NOT NULL CHECK (char_length(redirect_uri) <= 2048),
  scope text NOT NULL CHECK (char_length(scope) <= 4096),
  state text CHECK (char_length(state) <= 4096),
  resource text CHECK (char_length(resource) <= 2048),
  code_challenge text CHECK (char_length(code_challenge) <= 128),
  code_challenge_method USER-DEFINED,
  response_type USER-DEFINED NOT NULL DEFAULT 'code'::auth.oauth_response_type,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::auth.oauth_authorization_status,
  authorization_code text UNIQUE CHECK (char_length(authorization_code) <= 255),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '00:03:00'::interval),
  approved_at timestamp with time zone,
  CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id),
  CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.oauth_clients (
  id uuid NOT NULL,
  client_secret_hash text,
  registration_type USER-DEFINED NOT NULL,
  redirect_uris text NOT NULL,
  grant_types text NOT NULL,
  client_name text CHECK (char_length(client_name) <= 1024),
  client_uri text CHECK (char_length(client_uri) <= 2048),
  logo_uri text CHECK (char_length(logo_uri) <= 2048),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  client_type USER-DEFINED NOT NULL DEFAULT 'confidential'::auth.oauth_client_type,
  CONSTRAINT oauth_clients_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.oauth_consents (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  scopes text NOT NULL CHECK (char_length(scopes) <= 2048),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  revoked_at timestamp with time zone,
  CONSTRAINT oauth_consents_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id)
);
CREATE TABLE auth.one_time_tokens (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  token_type USER-DEFINED NOT NULL,
  token_hash text NOT NULL CHECK (char_length(token_hash) > 0),
  relates_to text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.refresh_tokens (
  instance_id uuid,
  id bigint NOT NULL DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass),
  token character varying UNIQUE,
  user_id character varying,
  revoked boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  parent character varying,
  session_id uuid,
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id)
);
CREATE TABLE auth.saml_providers (
  id uuid NOT NULL,
  sso_provider_id uuid NOT NULL,
  entity_id text NOT NULL UNIQUE CHECK (char_length(entity_id) > 0),
  metadata_xml text NOT NULL CHECK (char_length(metadata_xml) > 0),
  metadata_url text CHECK (metadata_url = NULL::text OR char_length(metadata_url) > 0),
  attribute_mapping jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  name_id_format text,
  CONSTRAINT saml_providers_pkey PRIMARY KEY (id),
  CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id)
);
CREATE TABLE auth.saml_relay_states (
  id uuid NOT NULL,
  sso_provider_id uuid NOT NULL,
  request_id text NOT NULL CHECK (char_length(request_id) > 0),
  for_email text,
  redirect_to text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  flow_state_id uuid,
  CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id),
  CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id),
  CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id)
);
CREATE TABLE auth.schema_migrations (
  version character varying NOT NULL,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);
CREATE TABLE auth.sessions (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  factor_id uuid,
  aal USER-DEFINED,
  not_after timestamp with time zone,
  refreshed_at timestamp without time zone,
  user_agent text,
  ip inet,
  tag text,
  oauth_client_id uuid,
  refresh_token_hmac_key text,
  refresh_token_counter bigint,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id)
);
CREATE TABLE auth.sso_domains (
  id uuid NOT NULL,
  sso_provider_id uuid NOT NULL,
  domain text NOT NULL CHECK (char_length(domain) > 0),
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT sso_domains_pkey PRIMARY KEY (id),
  CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id)
);
CREATE TABLE auth.sso_providers (
  id uuid NOT NULL,
  resource_id text CHECK (resource_id = NULL::text OR char_length(resource_id) > 0),
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  disabled boolean,
  CONSTRAINT sso_providers_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.users (
  instance_id uuid,
  id uuid NOT NULL,
  aud character varying,
  role character varying,
  email character varying,
  encrypted_password character varying,
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token character varying,
  confirmation_sent_at timestamp with time zone,
  recovery_token character varying,
  recovery_sent_at timestamp with time zone,
  email_change_token_new character varying,
  email_change character varying,
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone text DEFAULT NULL::character varying UNIQUE,
  phone_confirmed_at timestamp with time zone,
  phone_change text DEFAULT ''::character varying,
  phone_change_token character varying DEFAULT ''::character varying,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone DEFAULT LEAST(email_confirmed_at, phone_confirmed_at),
  email_change_token_current character varying DEFAULT ''::character varying,
  email_change_confirm_status smallint DEFAULT 0 CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2),
  banned_until timestamp with time zone,
  reauthentication_token character varying DEFAULT ''::character varying,
  reauthentication_sent_at timestamp with time zone,
  is_sso_user boolean NOT NULL DEFAULT false,
  deleted_at timestamp with time zone,
  is_anonymous boolean NOT NULL DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

## functions 
Name	Arguments	Return type	Security	

decrement_comment_count
comment_id uuid

void

Definer



decrement_comment_count
–

trigger	
Invoker



decrement_post_likes
–

trigger	
Invoker



handle_new_user
–

trigger	
Definer



handle_updated_at
–

trigger	
Invoker



increment_comment_count
comment_id uuid

void

Definer



increment_comment_count
–

trigger	
Invoker



increment_post_comments
–

trigger	
Invoker



increment_post_comments_count
post_id_input uuid

void

Definer



increment_post_likes
–

trigger	
Invoker



increment_post_views
post_id_input uuid

void

Definer



moddatetime
–

trigger	
Invoker



update_updated_at_column
–

trigger	
Invoker



upsert_habit
_user_id uuid, _name text, _description text, _is_active boolean DEFAULT true

void

Invoker


## triggers 

Name	Table	Function	Events	Orientation	Enabled	

on_comment_removed
post_comments
decrement_comment_count
AFTER DELETE
ROW



post_commented
post_comments
increment_post_comments
AFTER INSERT
ROW



post_liked
post_likes
increment_post_likes
AFTER INSERT
ROW



post_unliked
post_likes
decrement_post_likes
AFTER DELETE
ROW



update_comments_updated_at
post_comments
update_updated_at_column
BEFORE UPDATE
ROW



update_gamification_timestamp
gamification
moddatetime
BEFORE UPDATE
ROW



update_habit_progress_timestamp
habit_progress
moddatetime
BEFORE UPDATE
ROW



update_habits_timestamp
habits
moddatetime
BEFORE UPDATE
ROW



update_posts_updated_at
community_posts
update_updated_at_column
BEFORE UPDATE
ROW



update_stories_updated_at
success_stories
update_updated_at_column
BEFORE UPDATE
ROW



update_user_profiles_updated_at
user_profiles
update_updated_at_column
BEFORE UPDATE
ROW




---

## 🎯 Project Overview

**Transform App** is a comprehensive React Native mobile application built with Expo, designed to help users overcome addictive habits and build healthier lifestyles. The app provides:

- **Habit Tracking**: Track multiple habits, monitor streaks, and log urges
- **Community Support**: Social feed, posts, comments, likes, and success stories
- **Gamification**: Games, achievements, levels, challenges, and rewards
- **Progress Tracking**: AI analysis, exercises, photo tracking, and analytics
- **Wellness Tools**: Panic button, breathing exercises, mood tracking, meditation
- **AI Features**: Photo analysis, transformation prediction, insights
- **Notifications**: Motivational messages, reminders, and support notifications

### Core Purpose
Help users break free from addictive behaviors (pornography, smoking, alcohol, gaming, social media, junk food, gambling, shopping, procrastination) through:
- Daily tracking and accountability
- Community support and motivation
- Distraction through games
- Progress visualization
- AI-powered insights

---

## ✅ What Has Been Done

### Completed Features

1. **Authentication System**
   - ✅ Login/Signup with Supabase Auth
   - ✅ Password reset functionality
   - ✅ Session management with Zustand
   - ✅ Toast notifications for all auth actions

2. **Habit Management**
   - ✅ Add/remove habits
   - ✅ Track streaks (current & longest)
   - ✅ Log urges with intensity, triggers, and notes
   - ✅ Calculate days clean
   - ✅ Local storage + Supabase sync

3. **Community Features**
   - ✅ Post creation with images
   - ✅ Post feed with categories (success, support, question, motivation, general)
   - ✅ Like/unlike posts (with duplicate prevention)
   - ✅ Comments with replies
   - ✅ Post deletion (soft delete)
   - ✅ Success stories
   - ✅ User profiles
   - ✅ Community settings

4. **Dashboard**
   - ✅ Modern, production-ready UI
   - ✅ Stats cards with gradients
   - ✅ Quick action buttons
   - ✅ Motivational quotes
   - ✅ Habit cards with gradient backgrounds
   - ✅ Notification icon with badge

5. **Games**
   - ✅ 7 games total (all free - premium removed)
   - ✅ Memory Match, Breath Pacer, Reaction Time
   - ✅ Urge Fighter, Focus Master, Zen Garden, Pattern Master
   - ✅ Game session tracking

6. **UI/UX Improvements**
   - ✅ Removed duplicate back buttons
   - ✅ Toast notifications throughout app
   - ✅ Better error handling
   - ✅ Modern card designs
   - ✅ Improved spacing and typography

7. **Folder Structure**
   - ✅ Organized by feature
   - ✅ Removed duplicates
   - ✅ Clear separation of concerns
   - ✅ Updated all import paths

8. **Premium Logic**
   - ✅ Commented out (all features free)
   - ✅ `usePremium` hook always returns `isPremium: true`

---

## 🛠 Technology Stack

### Core Framework
- **React Native**: 0.81.5
- **Expo**: ^54.0.23
- **TypeScript**: ~5.9.2
- **React**: 19.1.0

### State Management
- **Zustand**: ^5.0.8 (with persistence)

### Backend & Database
- **Supabase**: ^2.81.1 (PostgreSQL database + Auth)

### UI Libraries
- **expo-linear-gradient**: ~15.0.7
- **react-native-root-toast**: ^4.0.1
- **expo-image-picker**: ~17.0.8
- **@expo/vector-icons**: ^15.0.3

### Navigation
- **@react-navigation/native**: ^7.1.19
- **@react-navigation/native-stack**: ^7.6.2

### Animations
- **react-native-reanimated**: ^4.1.5
- **react-native-animatable**: ^1.4.0

### Utilities
- **date-fns**: ^4.1.0
- **uuid**: ^13.0.0
- **axios**: ^1.13.2

---

## 📁 Project Structure

```
transform-app/
├── App.tsx                          # Main app entry point, handles app state (loading/auth/onboarding/app)
├── index.ts                         # Expo entry point
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration with path aliases
├── babel.config.js                  # Babel config with module resolver
├── app.json                         # Expo app configuration
│
└── src/
    ├── components/                  # Reusable UI components
    │   ├── common/                  # Common/shared components
    │   │   ├── Button.tsx           # Reusable button component
    │   │   └── Card.tsx             # Card wrapper component
    │   ├── habit/                   # Habit-related components
    │   │   └── HabitCard.tsx        # Habit card with gradient, stats display
    │   ├── gamification/            # Gamification components
    │   │   ├── AchievementBadge.tsx  # Badge display for achievements
    │   │   ├── ConfettiCelebration.tsx  # Confetti animation
    │   │   ├── GamificationProvider.tsx  # Context provider for gamification
    │   │   ├── ProgressRing.tsx     # Circular progress indicator
    │   │   └── index.ts             # Re-exports
    │   ├── premium/                 # Premium-related components (commented out)
    │   │   ├── PremiumBadge.tsx
    │   │   ├── PremiumLockedScreen.tsx
    │   │   └── PremiumTestPanel.tsx
    │   └── ErrorBoundary.tsx        # Error boundary for React errors
    │
    ├── config/                      # App configuration
    │   ├── app.config.ts            # App-specific configuration
    │   └── supabase.ts              # Supabase client initialization + Database types
    │
    ├── constants/                   # Constants and static data
    │   ├── community.ts             # Community-related constants (POST_CATEGORIES, etc.)
    │   ├── habits.ts                 # Habit-related constants
    │   └── index.ts                 # Re-exports all constants
    │
    ├── hooks/                       # Custom React hooks
    │   ├── useAnimatedValue.ts      # Animation hook
    │   ├── useKeyboard.ts           # Keyboard visibility hook
    │   ├── useNotifications.ts      # Notification hook
    │   └── usePremium.ts            # Premium status hook (always returns true)
    │
    ├── navigation/                  # Navigation setup
    │   ├── AppNavigator.tsx         # Main navigator, handles all screen routing
    │   └── BottomNavigation.tsx     # Bottom tab navigation component
    │
    ├── screens/                     # All screen components
    │   ├── auth/                    # Authentication screens
    │   │   ├── AuthNavigator.tsx   # Auth flow navigator
    │   │   ├── LoginScreen.tsx     # Login with email/password
    │   │   ├── SignupScreen.tsx     # Signup with email/password
    │   │   └── ForgotPasswordScreen.tsx  # Password reset
    │   │
    │   ├── dashboard/               # Dashboard screens
    │   │   └── DashboardScreen.tsx  # Main home screen with stats, habits, quick actions
    │   │
    │   ├── habits/                  # Habit tracking screens
    │   │   └── LogUrgeScreen.tsx   # Log urge with intensity, trigger, notes
    │   │
    │   ├── community/               # Community features
    │   │   ├── CommunityHub.tsx     # Community hub with tabs (feed/stories)
    │   │   ├── CommunityFeedScreen.tsx  # Main feed with posts
    │   │   ├── CreatePostScreen.tsx     # Create new post with images
    │   │   ├── PostDetailScreen.tsx     # Post detail with comments
    │   │   ├── UserProfileScreen.tsx    # User profile view
    │   │   ├── SuccessStoriesScreen.tsx  # Success stories feed
    │   │   ├── GroupChallenges.tsx      # Group challenges
    │   │   ├── MyCommunityPost.tsx      # User's own posts
    │   │   ├── CommunitySettingsScreen.tsx  # Community settings
    │   │   └── CommunityTestScreen.tsx   # Testing screen
    │   │
    │   ├── games/                   # Game screens
    │   │   ├── GamesHubScreen.tsx   # Games hub with all games
    │   │   ├── MemoryMatchGame.tsx  # Memory matching game
    │   │   ├── BreathPacerGame.tsx  # Breathing exercise game
    │   │   ├── ReactionTimeGame.tsx # Reaction time test
    │   │   ├── UrgeFighterGame.tsx  # Urge fighting game
    │   │   ├── FocusMasterGame.tsx  # Focus training game
    │   │   ├── ZenGardenGame.tsx    # Zen garden pattern game
    │   │   ├── PatternMasterGame.tsx    # Pattern recognition game
    │   │   └── GamePlayScreen.tsx   # Generic game play screen
    │   │
    │   ├── analytics/               # Analytics & statistics
    │   │   ├── StatisticsScreen.tsx     # Main statistics view
    │   │   ├── AdvancedAnalyticsScreen.tsx  # Advanced analytics
    │   │   ├── DeepInsights.tsx         # Deep insights
    │   │   └── TrackingDashboard.tsx    # Tracking dashboard
    │   │
    │   ├── gamification/            # Gamification screens
    │   │   ├── AchievementsScreen.tsx   # Achievements list
    │   │   ├── ChallengesScreen.tsx     # Challenges
    │   │   ├── LeaderboardScreen.tsx    # Leaderboard
    │   │   ├── LevelsScreen.tsx         # User levels
    │   │   └── RewardsShop.tsx          # Rewards shop
    │   │
    │   ├── progress/                # Progress tracking
    │   │   ├── ProgressHubScreen.tsx    # Progress hub
    │   │   ├── AIAnalysisScreen.tsx     # AI analysis of progress
    │   │   ├── ExercisesScreen.tsx      # Exercise recommendations
    │   │   └── SelfieProgressScreen.tsx # Photo progress tracking
    │   │
    │   ├── ai/                      # AI features
    │   │   ├── AIPhotoAnalysisScreen.tsx        # AI photo analysis
    │   │   └── TransformationPredictionScreen.tsx  # Transformation prediction
    │   │
    │   ├── profile/                 # Profile screens
    │   │   └── ProfileScreen.tsx   # User profile with edit, photo, settings
    │   │
    │   ├── tools/                   # Utility/tool screens
    │   │   └── PanicButtonScreen.tsx   # Panic button with breathing exercises
    │   │
    │   ├── onboarding/              # Onboarding flow
    │   │   ├── OnboardingController.tsx     # Controls onboarding flow
    │   │   ├── WelcomeScreen.tsx            # Welcome screen
    │   │   ├── HabitSelectionModal.tsx      # Modal to select habits
    │   │   ├── HabitSelectionScreen.tsx     # Full screen habit selection
    │   │   ├── PersonalityQuizScreen.tsx    # Personality quiz
    │   │   └── QuizResultsScreen.tsx        # Quiz results
    │   │
    │   ├── premium/                 # Premium features (commented out)
    │   │   ├── PremiumScreen.tsx
    │   │   ├── StyleConsultantScreen.tsx
    │   │   └── SubscriptionManagement.tsx
    │   │
    │   ├── analytics/               # Analytics screens
    │   ├── education/               # Education screens
    │   ├── wellness/                # Wellness screens
    │   ├── professional/            # Professional resources
    │   ├── settings/                # Settings screens
    │   ├── social/                  # Social features
    │   └── transformation/          # Transformation tracking
    │
    ├── services/                    # Business logic & API services
    │   ├── CommunityService.ts      # All community operations (posts, comments, likes, stories)
    │   ├── AIAnalysisService.ts     # AI analysis service
    │   ├── AIPhotoAnalysisService.ts    # AI photo analysis
    │   ├── AIService.ts             # General AI service
    │   ├── AnalyticsService.ts      # Analytics tracking
    │   ├── NotificationService.ts   # Push notifications
    │   ├── PaymentService.ts        # Payment/subscription handling
    │   ├── ScreenTimeService.ts     # Screen time tracking
    │   ├── SocialSharingService.ts  # Social media sharing
    │   └── StorageService.ts        # Local storage operations
    │
    ├── store/                       # State management (Zustand)
    │   ├── authStore.ts             # Authentication state (user, login, signup, logout)
    │   ├── communityStore.ts         # Community state (posts, comments, likes)
    │   ├── habitStore.ts             # Habit state (habits, urge logs)
    │   ├── themeStore.ts             # Theme state (dark/light mode, colors)
    │   └── trackingStore.ts          # Usage tracking state
    │
    ├── types/                       # TypeScript type definitions
    │   ├── habit.types.ts            # Habit-related types
    │   └── index.ts                  # Re-exports
    │
    └── utils/                       # Utility functions
        ├── theme.ts                 # Theme utilities (SIZES, COLORS, FONTS, SHADOWS)
        ├── constants.ts             # General constants (HABIT_NAMES, MOTIVATIONAL_QUOTES)
        ├── exercises.ts             # Exercise utilities
        └── games.ts                 # Game definitions and utilities
```

---

## 🗄 Database Schema

The app uses **Supabase (PostgreSQL)** with the following tables:

### Core Tables

#### `habits`
Tracks user habits and streaks.
- `id` (string, PK)
- `user_id` (string, FK to auth.users)
- `type` (string) - habit type (pornography, smoking, alcohol, etc.)
- `custom_name` (string, nullable)
- `quit_date` (string, timestamp)
- `current_streak` (number)
- `longest_streak` (number)
- `total_relapses` (number)
- `severity` (string) - 'mild' | 'moderate' | 'severe'
- `created_at` (string, timestamp)
- `updated_at` (string, timestamp)

#### `urges`
Logs user urges with details.
- `id` (string, PK)
- `user_id` (string, FK to auth.users)
- `habit_id` (string, FK to habits)
- `timestamp` (string, timestamp)
- `intensity` (number) - 1-10 scale
- `trigger` (string) - what triggered the urge
- `notes` (string) - additional notes
- `overcome` (boolean) - whether user overcame the urge
- `created_at` (string, timestamp)

#### `achievements`
Tracks user achievements.
- `id` (string, PK)
- `user_id` (string, FK to auth.users)
- `habit_id` (string, FK to habits)
- `achievement_type` (string)
- `unlocked_at` (string, timestamp)

### Community Tables

#### `user_profiles`
Extended user profile information.
- `id` (string, PK)
- `user_id` (string, FK to auth.users, unique)
- `username` (string, unique)
- `display_name` (string, nullable)
- `bio` (string, nullable)
- `avatar_url` (string, nullable)
- `is_profile_public` (boolean)
- `show_streak` (boolean)
- `show_before_after` (boolean)
- `show_success_stories` (boolean)
- `total_days_clean` (number)
- `current_streak` (number)
- `longest_streak` (number)
- `total_posts` (number)
- `total_likes_received` (number)
- `level` (number)
- `xp` (number)
- `badges` (jsonb)
- `joined_at` (string, timestamp)
- `last_active` (string, timestamp)
- `created_at` (string, timestamp)
- `updated_at` (string, timestamp)

#### `community_posts`
Community posts/feed.
- `id` (string, PK)
- `author_id` (string, FK to user_profiles)
- `title` (string)
- `content` (string)
- `category` (string) - 'success' | 'support' | 'question' | 'motivation' | 'general'
- `images` (string[], nullable) - array of image URLs
- `likes_count` (number, default 0)
- `comments_count` (number, default 0)
- `views_count` (number, default 0)
- `is_pinned` (boolean, default false)
- `is_reported` (boolean, default false)
- `is_deleted` (boolean, default false) - soft delete
- `created_at` (string, timestamp)
- `updated_at` (string, timestamp)

#### `post_comments`
Comments on posts (supports nested replies).
- `id` (string, PK)
- `post_id` (string, FK to community_posts)
- `author_id` (string, FK to user_profiles)
- `parent_comment_id` (string, nullable, FK to post_comments) - for nested replies
- `content` (string)
- `likes_count` (number, default 0)
- `is_deleted` (boolean, default false) - soft delete
- `is_reported` (boolean, default false)
- `created_at` (string, timestamp)
- `updated_at` (string, timestamp)

#### `post_likes`
Post likes (prevents duplicates with unique constraint on post_id + user_id).
- `id` (string, PK)
- `post_id` (string, FK to community_posts)
- `user_id` (string, FK to auth.users)
- `created_at` (string, timestamp)

#### `comment_likes`
Comment likes.
- `id` (string, PK)
- `comment_id` (string, FK to post_comments)
- `user_id` (string, FK to auth.users)
- `created_at` (string, timestamp)

#### `success_stories`
Success stories with before/after images.
- `id` (string, PK)
- `author_id` (string, FK to user_profiles)
- `title` (string)
- `story` (string)
- `days_clean` (number)
- `before_image_url` (string, nullable)
- `after_image_url` (string, nullable)
- `additional_images` (string[], nullable)
- `likes_count` (number, default 0)
- `views_count` (number, default 0)
- `is_featured` (boolean, default false)
- `is_verified` (boolean, default false)
- `created_at` (string, timestamp)
- `updated_at` (string, timestamp)

#### `user_followers`
User follow relationships.
- `id` (string, PK)
- `follower_id` (string, FK to user_profiles)
- `following_id` (string, FK to user_profiles)
- `created_at` (string, timestamp)

#### `content_reports`
Content moderation reports.
- `id` (string, PK)
- `reporter_id` (string, FK to user_profiles)
- `content_type` (string) - 'post' | 'comment' | 'user'
- `content_id` (string)
- `reason` (string) - 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other'
- `description` (string, nullable)
- `status` (string) - 'pending' | 'reviewed' | 'resolved' | 'dismissed'
- `created_at` (string, timestamp)
- `reviewed_at` (string, nullable, timestamp)
- `reviewed_by` (string, nullable, FK to user_profiles)

#### `user_notifications`
In-app notifications.
- `id` (string, PK)
- `user_id` (string, FK to auth.users)
- `type` (string) - 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'system'
- `title` (string)
- `message` (string)
- `related_user_id` (string, nullable, FK to user_profiles)
- `related_post_id` (string, nullable, FK to community_posts)
- `related_comment_id` (string, nullable, FK to post_comments)
- `is_read` (boolean, default false)
- `created_at` (string, timestamp)

### Database Relationships
- `user_profiles.user_id` → `auth.users.id` (one-to-one)
- `habits.user_id` → `auth.users.id` (many-to-one)
- `urges.habit_id` → `habits.id` (many-to-one)
- `community_posts.author_id` → `user_profiles.id` (many-to-one)
- `post_comments.post_id` → `community_posts.id` (many-to-one)
- `post_comments.author_id` → `user_profiles.id` (many-to-one)
- `post_comments.parent_comment_id` → `post_comments.id` (self-referential, for nested replies)
- `post_likes.post_id` → `community_posts.id` (many-to-one)
- `post_likes.user_id` → `auth.users.id` (many-to-one)
- Unique constraint on `(post_id, user_id)` in `post_likes` to prevent duplicates

---

## 🔄 Application Flow

### 1. App Initialization (`App.tsx`)

```
App.tsx
  ↓
AppContent()
  ↓
useEffect: initializeApp()
  ├─→ loadTheme()           # Load theme preferences
  ├─→ loadHabits()          # Load user habits from storage
  └─→ initializeAuth()      # Check Supabase session
      ↓
  determineAppState()
  ├─→ No user? → "auth" state → AuthNavigator
  ├─→ User but no onboarding? → "onboarding" state → OnboardingController
  └─→ User + onboarding complete? → "app" state → AppNavigator
```

### 2. Authentication Flow

```
AuthNavigator
  ├─→ LoginScreen
  │   ├─→ User enters email/password
  │   ├─→ Calls authStore.signIn()
  │   ├─→ Supabase auth.signInWithPassword()
  │   └─→ onAuthSuccess() → Check onboarding → Navigate
  │
  ├─→ SignupScreen
  │   ├─→ User enters email/password/name
  │   ├─→ Calls authStore.signUp()
  │   ├─→ Supabase auth.signUp()
  │   └─→ onAuthSuccess() → Navigate to onboarding
  │
  └─→ ForgotPasswordScreen
      ├─→ User enters email
      └─→ Supabase auth.resetPasswordForEmail()
```

### 3. Onboarding Flow

```
OnboardingController
  ├─→ WelcomeScreen
  ├─→ HabitSelectionScreen / HabitSelectionModal
  │   ├─→ User selects habits to track
  │   ├─→ Calls habitStore.addHabit() for each
  │   └─→ Saves to AsyncStorage + Supabase
  ├─→ PersonalityQuizScreen (optional)
  └─→ QuizResultsScreen (optional)
      ↓
  onComplete() → Set "onboardingComplete" → Navigate to AppNavigator
```

### 4. Main App Flow (`AppNavigator.tsx`)

```
AppNavigator
  ├─→ DashboardScreen (default)
  │   ├─→ Shows stats (habits count, total days, best streak)
  │   ├─→ Quick actions (Log Urge, Games, Community, Progress)
  │   ├─→ Motivational quote
  │   └─→ List of habits with gradient cards
  │
  ├─→ BottomNavigation (always visible on main screens)
  │   ├─→ Home (dashboard)
  │   ├─→ Community (communityFeed)
  │   ├─→ Stats (stats)
  │   ├─→ Games (games)
  │   └─→ Profile (profile)
  │
  └─→ Screen routing based on currentScreen state
      ├─→ "dashboard" → DashboardScreen
      ├─→ "logUrge" → LogUrgeScreen
      ├─→ "communityFeed" → CommunityFeedScreen
      ├─→ "games" → GamesHubScreen
      └─→ [50+ other screens]
```

### 5. Community Flow

```
CommunityFeedScreen
  ├─→ Loads posts via communityStore.loadFeed()
  ├─→ CommunityService.getPosts() → Supabase query
  ├─→ User can:
  │   ├─→ Like post → communityStore.likePost() → CommunityService.togglePostLike()
  │   │   └─→ Prevents duplicates with double-check + unique constraint handling
  │   ├─→ Tap post → Navigate to PostDetailScreen
  │   ├─→ Create post → Navigate to CreatePostScreen
  │   └─→ Delete own post → CommunityService.deletePost() (soft delete)
  │
  └─→ PostDetailScreen
      ├─→ Shows full post
      ├─→ Comments list (loads via CommunityService.getPostComments())
      ├─→ Add comment → CommunityService.addComment()
      ├─→ Like comment → CommunityService.toggleCommentLike()
      └─→ Delete own post → CommunityService.deletePost()
```

### 6. Habit Tracking Flow

```
DashboardScreen
  └─→ User taps "Log Urge" → Navigate to LogUrgeScreen
      ├─→ User selects habit
      ├─→ Enters intensity (1-10)
      ├─→ Enters trigger
      ├─→ Enters notes
      ├─→ Selects overcome (yes/no)
      └─→ Calls habitStore.logUrge() → Saves to AsyncStorage + Supabase
```

### 7. Game Flow

```
GamesHubScreen
  ├─→ Shows all games (no premium restrictions)
  ├─→ User taps game → Navigate to game screen
  ├─→ Game plays → Tracks session
  └─→ On complete → Navigate back to GamesHubScreen
```

---

## 🔍 Key Functions & Locations

### Authentication Functions

**Location**: `src/store/authStore.ts`

- `initialize()` - Checks Supabase session on app start
  - Calls: `supabase.auth.getSession()`
  - Sets user state if session exists
  - Listens to auth state changes

- `signIn(email, password)` - User login
  - Calls: `supabase.auth.signInWithPassword()`
  - Updates user state on success
  - Shows toast notification

- `signUp(email, password, full_name?)` - User registration
  - Calls: `supabase.auth.signUp()`
  - Creates user profile in `user_profiles` table
  - Shows toast notification

- `signOut()` - User logout
  - Calls: `supabase.auth.signOut()`
  - Clears user state
  - Shows toast notification

### Habit Management Functions

**Location**: `src/store/habitStore.ts`

- `addHabit(habit)` - Add new habit
  - Creates habit object with id, timestamps
  - Adds to habits array
  - Saves to AsyncStorage
  - Syncs to Supabase `habits` table

- `updateHabit(id, updates)` - Update habit
  - Updates habit in array
  - Saves to storage
  - Syncs to Supabase

- `deleteHabit(id)` - Remove habit
  - Removes from array
  - Deletes from storage
  - Deletes from Supabase

- `logUrge(urge)` - Log an urge
  - Creates urge log with timestamp
  - Adds to urgeLogs array
  - Saves to AsyncStorage
  - Inserts into Supabase `urges` table

- `loadHabits()` - Load habits from storage
  - Reads from AsyncStorage
  - Also fetches from Supabase for sync

### Community Functions

**Location**: `src/services/CommunityService.ts`

- `getCurrentUserProfile()` - Get current user's profile
  - Queries `user_profiles` table
  - Returns UserProfile object

- `getPosts(page, category?, append?)` - Get community posts
  - Queries `community_posts` table
  - Filters by category if provided
  - Excludes deleted posts (`is_deleted = false`)
  - Joins with `user_profiles` for author info
  - Checks if current user liked each post
  - Returns paginated results

- `createPost(post)` - Create new post
  - Uploads images to Supabase Storage if provided
  - Inserts into `community_posts` table
  - Returns created post

- `togglePostLike(postId)` - Like/unlike post
  - **Prevents duplicates** with:
    1. Check if like exists
    2. Double-check before insert (race condition prevention)
    3. Handles unique constraint violations gracefully
  - If liked → deletes from `post_likes`
  - If not liked → inserts into `post_likes`
  - Returns boolean (true = liked, false = unliked)

- `deletePost(postId)` - Delete post (soft delete)
  - Updates `is_deleted = true` in `community_posts`
  - Only author can delete (checks `author_id`)

- `addComment(postId, content, parentCommentId?)` - Add comment
  - Inserts into `post_comments` table
  - Supports nested replies via `parent_comment_id`
  - Increments `comments_count` on post

- `getPostComments(postId)` - Get comments for post
  - Queries `post_comments` table
  - Filters deleted comments
  - Only top-level comments (parent_comment_id is null)
  - Joins with `user_profiles` for author info
  - Checks if user liked each comment

- `toggleCommentLike(commentId)` - Like/unlike comment
  - Similar to `togglePostLike`
  - Manages `comment_likes` table

- `getSuccessStories(page)` - Get success stories
  - Queries `success_stories` table
  - Joins with `user_profiles`
  - Returns paginated results

### Navigation Functions

**Location**: `src/navigation/AppNavigator.tsx`

- `navigateTo(screen: Screen)` - Navigate to any screen
  - Updates `currentScreen` state
  - Triggers screen transition animation
  - Tracks screen view for analytics

- `renderScreen()` - Renders current screen based on `currentScreen` state
  - Large switch statement with 50+ cases
  - Each case returns appropriate screen component

### Dashboard Functions

**Location**: `src/screens/dashboard/DashboardScreen.tsx`

- `calculateDaysClean(quitDate)` - Calculate days since quit date
  - Takes quit date string
  - Returns number of days

- `handleQuickAction(screen)` - Navigate to quick action screen
  - Log Urge → "logUrge"
  - Games → "games"
  - Community → "communityFeed"
  - Progress → "progressHub"

- `handleProgressHubPress()` - Navigate to progress hub

### Notification Functions

**Location**: `src/services/NotificationService.ts`

- `init()` - Initialize notifications
  - Requests permissions
  - Configures Android channel
  - Gets push token

- `sendUrgeWarning(triggerType)` - Send urge warning notification
  - Sends immediate notification
  - Used by PanicButtonScreen

- `scheduleMotivationalNotifications()` - Schedule daily motivational messages
  - Schedules notifications at specific times
  - Saves to AsyncStorage

- `sendAchievementNotification(title, description)` - Send achievement notification

### Theme Functions

**Location**: `src/store/themeStore.ts`

- `toggleTheme()` - Toggle dark/light mode
  - Updates isDark state
  - Saves to AsyncStorage
  - Applies theme colors

- `loadTheme()` - Load theme from storage
  - Reads from AsyncStorage
  - Applies saved theme

---

## 📦 State Management

### Zustand Stores

All stores use Zustand with persistence to AsyncStorage.

#### 1. `authStore` (`src/store/authStore.ts`)
**State**:
- `user: User | null` - Current authenticated user
- `loading: boolean` - Loading state
- `initialized: boolean` - Whether auth has been initialized

**Actions**:
- `setUser(user)` - Set user
- `initialize()` - Initialize auth session
- `signUp(email, password, full_name?)` - Register user
- `signIn(email, password)` - Login user
- `signOut()` - Logout user
- `fetchUser()` - Fetch user from Supabase

#### 2. `habitStore` (`src/store/habitStore.ts`)
**State**:
- `habits: Habit[]` - Array of user habits
- `urgeLogs: UrgeLog[]` - Array of urge logs

**Actions**:
- `addHabit(habit)` - Add new habit
- `updateHabit(id, updates)` - Update habit
- `deleteHabit(id)` - Delete habit
- `logUrge(urge)` - Log an urge
- `loadHabits()` - Load from storage/Supabase
- `saveHabits()` - Save to storage/Supabase

#### 3. `communityStore` (`src/store/communityStore.ts`)
**State**:
- `posts: CommunityPost[]` - Array of posts
- `successStories: SuccessStory[]` - Array of success stories
- `currentProfile: UserProfile | null` - Current user profile
- `selectedPostId: string | null` - Selected post for detail view
- `selectedCategory: string | null` - Selected category filter
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `currentPage: number` - Current page for pagination
- `hasMorePosts: boolean` - Whether more posts available

**Actions**:
- `loadFeed(page, category?, append?)` - Load posts
- `refreshFeed()` - Refresh posts
- `likePost(postId)` - Like/unlike post (with optimistic update)
- `loadSuccessStories(page)` - Load success stories
- `refreshSuccessStories()` - Refresh success stories
- `setSelectedPostId(id)` - Set selected post
- `setSelectedCategory(category)` - Set category filter
- `updatePost(id, updates)` - Update post in store
- `removePost(id)` - Remove post from store

#### 4. `themeStore` (`src/store/themeStore.ts`)
**State**:
- `isDark: boolean` - Dark mode enabled
- `colors: object` - Theme colors

**Actions**:
- `toggleTheme()` - Toggle dark/light mode
- `loadTheme()` - Load theme from storage

#### 5. `trackingStore` (`src/store/trackingStore.ts`)
**State**:
- Usage statistics and screen views

**Actions**:
- `trackScreenView(screen)` - Track screen view
- `trackEvent(event, properties)` - Track custom event

---

## 🔌 Services & APIs

### CommunityService (`src/services/CommunityService.ts`)

**Main Class**: `CommunityService` (exported as singleton `communityService`)

**Key Methods**:
- `getCurrentUserProfile()` - Get user profile
- `getPosts(page, category?, append?)` - Get paginated posts
- `getPost(postId)` - Get single post with author
- `createPost(post)` - Create post with image upload
- `updatePost(postId, updates)` - Update post (author only)
- `deletePost(postId)` - Soft delete post (author only)
- `togglePostLike(postId)` - Like/unlike with duplicate prevention
- `getPostComments(postId)` - Get comments for post
- `addComment(postId, content, parentCommentId?)` - Add comment
- `toggleCommentLike(commentId)` - Like/unlike comment
- `getSuccessStories(page)` - Get success stories
- `createSuccessStory(story)` - Create success story
- `uploadImage(uri)` - Upload image to Supabase Storage
- `followUser(profileId)` - Follow user
- `unfollowUser(profileId)` - Unfollow user
- `reportContent(contentType, contentId, reason, description?)` - Report content

### NotificationService (`src/services/NotificationService.ts`)

**Main Class**: `NotificationService` (exported as default singleton)

**Key Methods**:
- `init()` - Initialize notifications
- `sendUrgeWarning(triggerType)` - Send immediate urge warning
- `scheduleMotivationalNotifications()` - Schedule daily messages
- `sendAchievementNotification(title, description)` - Send achievement
- `sendGameInvitation()` - Send game invitation
- `scheduleWeeklyReport()` - Schedule weekly report
- `sendMilestoneNotification(days, habitName)` - Send milestone

### AnalyticsService (`src/services/AnalyticsService.ts`)

**Main Class**: `AnalyticsService` (exported as default singleton)

**Key Methods**:
- `track(event, properties?)` - Track event
- `getEvents()` - Get tracked events
- `clearEvents()` - Clear events

### Other Services

- **AIAnalysisService** - AI-powered habit analysis
- **AIPhotoAnalysisService** - AI photo analysis
- **AIService** - General AI operations
- **PaymentService** - Payment/subscription handling
- **ScreenTimeService** - Screen time tracking
- **SocialSharingService** - Social media sharing
- **StorageService** - Local storage operations

---

## ⚙️ Configuration

### Environment Variables

Required in `.env` or Expo environment:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### TypeScript Path Aliases

Configured in `tsconfig.json` and `babel.config.js`:
- `@components/*` → `src/components/*`
- `@screens/*` → `src/screens/*`
- `@utils/*` → `src/utils/*`
- `@store/*` → `src/store/*`
- `@hooks/*` → `src/hooks/*`
- `@services/*` → `src/services/*`
- `@config/*` → `src/config/*`
- `@constants/*` → `src/constants/*`

### Supabase Configuration

**Location**: `src/config/supabase.ts`

- Creates Supabase client with AsyncStorage for auth persistence
- Defines complete Database type with all tables
- Single source of truth for Supabase connection

---

## 📚 Package Dependencies

### Core Dependencies

```json
{
  "expo": "^54.0.23",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "typescript": "~5.9.2"
}
```

### State & Data
- `zustand`: ^5.0.8 - State management
- `@supabase/supabase-js`: ^2.81.1 - Backend & database
- `@react-native-async-storage/async-storage`: ^2.2.0 - Local storage

### UI & Styling
- `expo-linear-gradient`: ~15.0.7 - Gradient backgrounds
- `react-native-root-toast`: ^4.0.1 - Toast notifications
- `expo-image-picker`: ~17.0.8 - Image selection
- `@expo/vector-icons`: ^15.0.3 - Icons

### Navigation
- `@react-navigation/native`: ^7.1.19
- `@react-navigation/native-stack`: ^7.6.2

### Animations
- `react-native-reanimated`: ^4.1.5
- `react-native-animatable`: ^1.4.0

### Utilities
- `date-fns`: ^4.1.0 - Date formatting
- `uuid`: ^13.0.0 - ID generation
- `axios`: ^1.13.2 - HTTP requests

### Notifications
- `expo-notifications`: ^0.32.12

### Other
- `expo-camera`: ~17.0.9 - Camera access
- `expo-file-system`: ^19.0.17 - File operations
- `expo-sharing`: ^14.0.7 - Share functionality
- `react-native-purchases`: ^9.6.4 - In-app purchases (premium)

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Environment Setup

1. Create `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Set up Supabase:
   - Create Supabase project
   - Run migrations to create tables (see Database Schema section)
   - Enable Storage for image uploads
   - Configure RLS (Row Level Security) policies

### Key Files to Know

- **`App.tsx`** - App entry point, handles routing between auth/onboarding/app
- **`src/navigation/AppNavigator.tsx`** - Main navigator, all screen routing
- **`src/config/supabase.ts`** - Supabase client + database types
- **`src/services/CommunityService.ts`** - All community operations
- **`src/store/`** - All Zustand stores (auth, habits, community, theme, tracking)

---

## 🗺 Finding Functions & Features

### Where is the login function?
**Location**: `src/store/authStore.ts` → `signIn(email, password)`
**Called from**: `src/screens/auth/LoginScreen.tsx`

### Where is the like post function?
**Location**: `src/services/CommunityService.ts` → `togglePostLike(postId)`
**Called from**: `src/store/communityStore.ts` → `likePost(postId)`
**Used in**: `src/screens/community/CommunityFeedScreen.tsx`, `src/screens/community/PostDetailScreen.tsx`

### Where is the duplicate like prevention?
**Location**: `src/services/CommunityService.ts` → `togglePostLike()` method
**Implementation**:
1. Checks if like exists
2. Double-checks before insert (race condition prevention)
3. Handles unique constraint violations gracefully

### Where is the habit creation?
**Location**: `src/store/habitStore.ts` → `addHabit(habit)`
**Called from**: `src/screens/onboarding/HabitSelectionModal.tsx`

### Where is the dashboard stats calculation?
**Location**: `src/screens/dashboard/DashboardScreen.tsx`
**Functions**:
- `calculateDaysClean(quitDate)` - Calculates days since quit
- `totalDaysClean` - Sum of all habit days
- `longestStreak` - Max streak across all habits

### Where is the navigation handled?
**Location**: `src/navigation/AppNavigator.tsx`
**Function**: `navigateTo(screen: Screen)` - Updates currentScreen state
**Function**: `renderScreen()` - Renders screen based on currentScreen

### Where is the toast notification setup?
**Package**: `react-native-root-toast`
**Usage**: `Toast.show(message, options)` throughout app
**Examples**:
- `src/screens/auth/LoginScreen.tsx` - Login success/error
- `src/screens/dashboard/DashboardScreen.tsx` - Habit removal
- `src/screens/community/CommunityFeedScreen.tsx` - Like errors

### Where is the database schema defined?
**Location**: `src/config/supabase.ts`
**Interface**: `Database` - Complete type definition for all tables

### Where is the theme configuration?
**Location**: `src/utils/theme.ts`
**Exports**: `SIZES`, `COLORS`, `FONTS`, `SHADOWS`, `EFFECTS`
**Store**: `src/store/themeStore.ts` - Manages dark/light mode

### Where are constants defined?
**Location**: `src/utils/constants.ts` - General constants (HABIT_NAMES, MOTIVATIONAL_QUOTES)
**Location**: `src/constants/community.ts` - Community constants (POST_CATEGORIES)
**Location**: `src/constants/habits.ts` - Habit constants

---

## 🔐 Security & Best Practices

### Authentication
- Uses Supabase Auth with secure session management
- Passwords never stored locally
- Session persisted securely

### Data Protection
- Row Level Security (RLS) should be enabled on Supabase
- User can only access their own data
- Soft deletes for posts/comments (is_deleted flag)

### Duplicate Prevention
- Post likes: Unique constraint on (post_id, user_id)
- Double-check before insert to prevent race conditions
- Graceful error handling for constraint violations

### Error Handling
- Toast notifications for user feedback
- Try-catch blocks in all async operations
- Error boundaries for React errors

---

## 📝 Notes

### Premium Features
- All premium logic is **commented out**
- `usePremium` hook always returns `isPremium: true`
- All features are free and accessible

### Image Uploads
- Images uploaded to Supabase Storage
- Public URLs stored in database
- Supports multiple images per post

### Offline Support
- Habits and urge logs stored in AsyncStorage
- Syncs to Supabase when online
- Works offline for basic tracking

### Performance
- Pagination for posts and stories
- Optimistic updates for likes
- Image lazy loading
- Animated transitions

---

## 🐛 Known Issues & Fixes Applied

### Fixed Issues
1. ✅ **Duplicate likes** - Fixed with double-check and unique constraint handling
2. ✅ **Babel error** - Fixed by installing `react-refresh`
3. ✅ **Import errors** - Fixed by reorganizing folder structure and updating paths
4. ✅ **Premium restrictions** - Commented out, all features free
5. ✅ **Multiple back buttons** - Removed, using AppNavigator for navigation
6. ✅ **Bad error handling** - Replaced with toast notifications throughout

---

## 📞 Support & Development

### Key Contacts
- Supabase Project: Configure in `src/config/supabase.ts`
- Environment Variables: Set in `.env` file

### Common Tasks

**Add a new screen**:
1. Create screen in appropriate `src/screens/[feature]/` folder
2. Add to `Screen` type in `src/navigation/AppNavigator.tsx`
3. Add case in `renderScreen()` switch statement
4. Add navigation button/link where needed

**Add a new service**:
1. Create file in `src/services/`
2. Export as default singleton or class
3. Import and use in components/stores

**Add a new store**:
1. Create file in `src/store/`
2. Use Zustand `create()` with persistence
3. Export hook (e.g., `useMyStore`)

**Add a new constant**:
1. Add to appropriate file in `src/constants/` or `src/utils/constants.ts`
2. Export from `src/constants/index.ts` if in constants folder

---

## 🎓 Learning Resources

- **Expo Docs**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **Zustand Docs**: https://zustand-demo.pmnd.rs
- **React Native Docs**: https://reactnative.dev

---
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Environment Setup

1. Create `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Set up Supabase:
   - Create Supabase project
   - Run migrations to create tables (see Database Schema section)
   - Enable Storage for image uploads
   - Configure RLS (Row Level Security) policies

### Key Files to Know

- **`App.tsx`** - App entry point, handles routing between auth/onboarding/app
- **`src/navigation/AppNavigator.tsx`** - Main navigator, all screen routing
- **`src/config/supabase.ts`** - Supabase client + database types
- **`src/services/CommunityService.ts`** - All community operations
- **`src/store/`** - All Zustand stores (auth, habits, community, theme, tracking)

---

## 🗺 Finding Functions & Features

### Where is the login function?
**Location**: `src/store/authStore.ts` → `signIn(email, password)`
**Called from**: `src/screens/auth/LoginScreen.tsx`

### Where is the like post function?
**Location**: `src/services/CommunityService.ts` → `togglePostLike(postId)`
**Called from**: `src/store/communityStore.ts` → `likePost(postId)`
**Used in**: `src/screens/community/CommunityFeedScreen.tsx`, `src/screens/community/PostDetailScreen.tsx`

### Where is the duplicate like prevention?
**Location**: `src/services/CommunityService.ts` → `togglePostLike()` method
**Implementation**:
1. Checks if like exists
2. Double-checks before insert (race condition prevention)
3. Handles unique constraint violations gracefully

### Where is the habit creation?
**Location**: `src/store/habitStore.ts` → `addHabit(habit)`
**Called from**: `src/screens/onboarding/HabitSelectionModal.tsx`

### Where is the dashboard stats calculation?
**Location**: `src/screens/dashboard/DashboardScreen.tsx`
**Functions**:
- `calculateDaysClean(quitDate)` - Calculates days since quit
- `totalDaysClean` - Sum of all habit days
- `longestStreak` - Max streak across all habits

### Where is the navigation handled?
**Location**: `src/navigation/AppNavigator.tsx`
**Function**: `navigateTo(screen: Screen)` - Updates currentScreen state
**Function**: `renderScreen()` - Renders screen based on currentScreen

### Where is the toast notification setup?
**Package**: `react-native-root-toast`
**Usage**: `Toast.show(message, options)` throughout app
**Examples**:
- `src/screens/auth/LoginScreen.tsx` - Login success/error
- `src/screens/dashboard/DashboardScreen.tsx` - Habit removal
- `src/screens/community/CommunityFeedScreen.tsx` - Like errors

### Where is the database schema defined?
**Location**: `src/config/supabase.ts`
**Interface**: `Database` - Complete type definition for all tables

### Where is the theme configuration?
**Location**: `src/utils/theme.ts`
**Exports**: `SIZES`, `COLORS`, `FONTS`, `SHADOWS`, `EFFECTS`
**Store**: `src/store/themeStore.ts` - Manages dark/light mode

### Where are constants defined?
**Location**: `src/utils/constants.ts` - General constants (HABIT_NAMES, MOTIVATIONAL_QUOTES)
**Location**: `src/constants/community.ts` - Community constants (POST_CATEGORIES)
**Location**: `src/constants/habits.ts` - Habit constants

---

## 🔐 Security & Best Practices

### Authentication
- Uses Supabase Auth with secure session management
- Passwords never stored locally
- Session persisted securely

### Data Protection
- Row Level Security (RLS) should be enabled on Supabase
- User can only access their own data
- Soft deletes for posts/comments (is_deleted flag)

### Duplicate Prevention
- Post likes: Unique constraint on (post_id, user_id)
- Double-check before insert to prevent race conditions
- Graceful error handling for constraint violations

### Error Handling
- Toast notifications for user feedback
- Try-catch blocks in all async operations
- Error boundaries for React errors

---

## 📝 Notes

### Premium Features
- All premium logic is **commented out**
- `usePremium` hook always returns `isPremium: true`
- All features are free and accessible

### Image Uploads
- Images uploaded to Supabase Storage
- Public URLs stored in database
- Supports multiple images per post

### Offline Support
- Habits and urge logs stored in AsyncStorage
- Syncs to Supabase when online
- Works offline for basic tracking

### Performance
- Pagination for posts and stories
- Optimistic updates for likes
- Image lazy loading
- Animated transitions

---

## 🐛 Known Issues & Fixes Applied

### Fixed Issues
1. ✅ **Duplicate likes** - Fixed with double-check and unique constraint handling
2. ✅ **Babel error** - Fixed by installing `react-refresh`
3. ✅ **Import errors** - Fixed by reorganizing folder structure and updating paths
4. ✅ **Premium restrictions** - Commented out, all features free
5. ✅ **Multiple back buttons** - Removed, using AppNavigator for navigation
6. ✅ **Bad error handling** - Replaced with toast notifications throughout

---

## 📞 Support & Development

### Key Contacts
- Supabase Project: Configure in `src/config/supabase.ts`
- Environment Variables: Set in `.env` file

### Common Tasks

**Add a new screen**:
1. Create screen in appropriate `src/screens/[feature]/` folder
2. Add to `Screen` type in `src/navigation/AppNavigator.tsx`
3. Add case in `renderScreen()` switch statement
4. Add navigation button/link where needed

**Add a new service**:
1. Create file in `src/services/`
2. Export as default singleton or class
3. Import and use in components/stores

**Add a new store**:
1. Create file in `src/store/`
2. Use Zustand `create()` with persistence
3. Export hook (e.g., `useMyStore`)

**Add a new constant**:
1. Add to appropriate file in `src/constants/` or `src/utils/constants.ts`
2. Export from `src/constants/index.ts` if in constants folder

---

## 🎓 Learning Resources

- **Expo Docs**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **Zustand Docs**: https://zustand-demo.pmnd.rs
- **React Native Docs**: https://reactnative.dev

---

**Last Updated**: After folder reorganization and import fixes
**Version**: 1.0.0
**Status**: Production-ready with all features implemented.
**Latest Update**: 
- **Community Hub**: Replaced basic feed with a premium `CommunityHub` featuring glassmorphic UI and enhanced visuals.
- **UI Polish**: Enhanced typography, gradients, and animations throughout the community section.


//