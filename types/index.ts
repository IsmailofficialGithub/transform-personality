export interface Profile {
    id: string;
    email: string;
    username?: string;
    avatar_url?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    age?: number;
    created_at: string;
    updated_at?: string;
  }
  
  export interface Habit {
    id: string;
    user_id: string;
    name: string;
    type: 'smoking' | 'pornography' | 'alcohol' | 'drugs' | 'gambling' | 'social_media' | 'gaming' | 'gaming_addiction' | 'pornography_addiction' | 'substance_abuse' | 'social_media_overuse' | 'junk_food' | 'procrastination' | 'anger_issues' | 'toxic_relationships' | 'overspending' | 'custom';
    custom_name?: string;
    description?: string;
    quit_date: string;
    is_active: boolean;
    hardcore_mode?: boolean;
    plan_id?: string;
    severity_level?: number;
    accountability_enabled?: boolean;
    created_at: string;
    icon?: string;
  }
  
  export interface HabitCheckIn {
    id: string;
    habit_id: string;
    user_id: string;
    date: string;
    status: 'success' | 'relapse' | 'struggle';
    mood?: number; // 1-5 scale
    craving_intensity?: number; // 0-10 scale
    reflection_note?: string;
    notes?: string;
    triggers?: string[];
    created_at: string;
  }
  
  export interface Milestone {
    id: string;
    habit_id: string;
    user_id: string;
    days_count: number;
    milestone_type: '1_day' | '3_days' | '1_week' | '2_weeks' | '1_month' | '3_months' | '6_months' | '1_year';
    achieved_at: string;
    celebrated: boolean;
  }
  
  export interface CommunityPost {
    id: string;
    author_id: string;
    title: string;
    content: string;
    category: 'success' | 'support' | 'question' | 'motivation' | 'general';
    images: string[];
    likes_count: number;
    comments_count: number;
    views_count: number;
    is_pinned: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    user_profiles?: Profile;
    is_liked?: boolean;
  }

  export interface PostComment {
    id: string;
    post_id: string;
    author_id: string;
    parent_comment_id?: string;
    content: string;
    likes_count: number;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    user_profiles?: Profile;
    is_liked?: boolean;
  }

  // Legacy interface for backward compatibility
  export interface SupportPost {
    id: string;
    user_id: string;
    content: string;
    is_anonymous: boolean;
    category?: 'motivation' | 'struggle' | 'victory' | 'question' | 'support';
    image_url?: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles?: Profile;
  }

  // Legacy Post interface for backward compatibility
  export interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    user?: Profile;
  }
  
  export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    is_anonymous: boolean;
    created_at: string;
    profiles?: Profile;
  }
  
  export interface DailyStat {
    id: string;
    user_id: string;
    habit_id: string;
    date: string;
    days_clean: number;
    money_saved?: number;
    time_saved?: number;
    created_at: string;
  }
  
  export interface Trigger {
    id: string;
    user_id: string;
    habit_id: string;
    name: string;
    description?: string;
    severity: 'low' | 'medium' | 'high';
    created_at: string;
  }
  
  export interface CopingStrategy {
    id: string;
    user_id: string;
    habit_id: string;
    title: string;
    description: string;
    effectiveness_rating?: number;
    times_used: number;
    created_at: string;
  }

  // Rewards and Badges
  export interface UserReward {
    id: string;
    user_id: string;
    reward_type: 'badge' | 'coin' | 'unlockable';
    title: string;
    description?: string;
    icon_url?: string;
    points: number;
    unlocked_at: string;
    created_at: string;
  }

  export interface Badge {
    id: string;
    badge_key: string;
    name: string;
    description?: string;
    icon_url?: string;
    requirement_type: 'streak' | 'days_clean' | 'checkins' | 'milestone';
    requirement_value: number;
    coins_reward: number;
    created_at: string;
  }

  export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    habit_id?: string;
    unlocked_at: string;
    badge?: Badge;
  }

  export interface UnlockedContent {
    id: string;
    user_id: string;
    content_type: 'theme' | 'game' | 'feature' | 'badge';
    content_key: string;
    unlocked_at: string;
  }

  export interface UserCoins {
    id: string;
    user_id: string;
    total_coins: number;
    earned_coins: number;
    spent_coins: number;
    updated_at: string;
    created_at: string;
  }

  // Trigger Logs and Pattern Analysis
  export interface TriggerLog {
    id: string;
    user_id: string;
    habit_id: string;
    trigger_type: 'craving' | 'slip_up' | 'struggle';
    intensity: number; // 1-10
    trigger_category?: 'time' | 'place' | 'mood' | 'social' | 'stress' | 'boredom' | 'other';
    trigger_description?: string;
    location?: string;
    mood_context?: number; // 1-5
    time_of_day?: string; // TIME format
    day_of_week?: number; // 0-6, 0 = Sunday
    overcame: boolean;
    coping_strategy_used?: string;
    notes?: string;
    created_at: string;
  }

  export interface PatternInsight {
    id: string;
    user_id: string;
    habit_id: string;
    insight_type: 'time_pattern' | 'place_pattern' | 'mood_pattern' | 'trigger_frequency';
    pattern_description: string;
    frequency_count: number;
    suggested_action?: string;
    confidence_score?: number; // 0-1
    last_updated: string;
    created_at: string;
  }

  // Streak and Progress
  export interface StreakData {
    current_streak: number;
    longest_streak: number;
    days_clean: number;
    last_check_in_date?: string;
  }

  // Enhanced Onboarding Types
  export interface QuestionnaireResponse {
    id: string;
    user_id: string;
    habit_id: string;
    question_category: 'basic' | 'impact' | 'motivation' | 'severity' | 'behavior_specific';
    question_key: string;
    question_text: string;
    response_text?: string;
    response_number?: number;
    response_array?: string[];
    created_at: string;
  }

  export interface QuitPlan {
    id: string;
    user_id: string;
    habit_id: string;
    plan_name: string;
    plan_description?: string;
    high_risk_times?: string[];
    high_risk_places?: string[];
    generated_at: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface DailyRoutine {
    id: string;
    plan_id: string;
    routine_type: 'morning' | 'midday' | 'evening';
    task_title: string;
    task_description?: string;
    task_type: 'reflection' | 'check_in' | 'exercise' | 'journaling' | 'breathing' | 'activity';
    scheduled_time?: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
  }

  export interface Challenge {
    id: string;
    plan_id: string;
    challenge_name: string;
    challenge_description?: string;
    challenge_type: 'detox' | 'trigger_resistance' | 'device_limit' | 'money_saving' | 'custom';
    duration_days: number;
    start_date?: string;
    end_date?: string;
    is_completed: boolean;
    progress_percentage: number;
    created_at: string;
  }

  export interface HardcoreModeSettings {
    id: string;
    habit_id: string;
    user_id: string;
    zero_tolerance_enabled: boolean;
    mandatory_checkin_enabled: boolean;
    checkin_deadline?: string;
    feature_lock_enabled: boolean;
    locked_features?: string[];
    random_tasks_enabled: boolean;
    accountability_partner_enabled: boolean;
    accountability_partner_id?: string;
    created_at: string;
    updated_at: string;
  }

  export interface AccountabilityPartner {
    id: string;
    user_id: string;
    partner_user_id?: string;
    partner_email?: string;
    partner_name?: string;
    habit_id?: string;
    access_level: 'view_progress' | 'view_checkins' | 'view_milestones' | 'receive_alerts';
    is_active: boolean;
    created_at: string;
  }

  export interface UrgeBlocker {
    id: string;
    user_id: string;
    habit_id: string;
    blocker_type: 'timer' | 'sos_coping' | 'grounding' | 'motivation' | 'breathing';
    title: string;
    description?: string;
    content?: string;
    is_favorite: boolean;
    times_used: number;
    effectiveness_rating?: number;
    created_at: string;
  }

  export interface BehaviorInsight {
    id: string;
    user_id: string;
    habit_id: string;
    insight_type: 'risk_prediction' | 'trigger_analysis' | 'progress_analysis' | 'relapse_warning';
    insight_title: string;
    insight_description: string;
    confidence_score?: number;
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
    predicted_date?: string;
    recommended_actions?: string[];
    is_active: boolean;
    created_at: string;
  }

  export interface PersonalizedTask {
    id: string;
    plan_id: string;
    task_title: string;
    task_description?: string;
    task_category: 'replacement_activity' | 'coping_exercise' | 'breathing' | 'journaling' | 'stress_relief';
    estimated_minutes?: number;
    is_completed: boolean;
    completion_date?: string;
    order_index: number;
    created_at: string;
  }