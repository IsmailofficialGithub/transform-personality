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
    type: 'smoking' | 'pornography' | 'alcohol' | 'drugs' | 'gambling' | 'social_media' | 'gaming' | 'custom';
    custom_name?: string;
    description?: string;
    quit_date: string;
    is_active: boolean;
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