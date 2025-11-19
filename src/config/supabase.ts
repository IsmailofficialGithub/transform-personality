import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Cloud sync disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// Database Types
export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          custom_name: string | null;
          quit_date: string;
          current_streak: number;
          longest_streak: number;
          total_relapses: number;
          severity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
      };
      urges: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          timestamp: string;
          intensity: number;
          trigger: string;
          notes: string;
          overcome: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['urges']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['urges']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          achievement_type: string;
          unlocked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'unlocked_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      // Community Tables
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_profile_public: boolean;
          show_streak: boolean;
          show_before_after: boolean;
          show_success_stories: boolean;
          total_days_clean: number;
          current_streak: number;
          longest_streak: number;
          total_posts: number;
          total_likes_received: number;
          level: number;
          xp: number;
          badges: any;
          joined_at: string;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at' | 'joined_at' | 'last_active'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      community_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          category: 'success' | 'support' | 'question' | 'motivation' | 'general';
          images: string[] | null;
          likes_count: number;
          comments_count: number;
          views_count: number;
          is_pinned: boolean;
          is_reported: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['community_posts']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count' | 'is_pinned' | 'is_reported' | 'is_deleted'>;
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>;
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          parent_comment_id: string | null;
          content: string;
          likes_count: number;
          is_deleted: boolean;
          is_reported: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['post_comments']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'is_deleted' | 'is_reported'>;
        Update: Partial<Database['public']['Tables']['post_comments']['Insert']>;
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['post_likes']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      comment_likes: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comment_likes']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      success_stories: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          story: string;
          days_clean: number;
          before_image_url: string | null;
          after_image_url: string | null;
          additional_images: string[] | null;
          likes_count: number;
          views_count: number;
          is_featured: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['success_stories']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'views_count' | 'is_featured' | 'is_verified'>;
        Update: Partial<Database['public']['Tables']['success_stories']['Insert']>;
      };
      user_followers: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_followers']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      content_reports: {
        Row: {
          id: string;
          reporter_id: string;
          content_type: 'post' | 'comment' | 'user';
          content_id: string;
          reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
          description: string | null;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          created_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['content_reports']['Row'], 'id' | 'created_at' | 'status' | 'reviewed_at' | 'reviewed_by'>;
        Update: Partial<Database['public']['Tables']['content_reports']['Insert']>;
      };
      user_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'system';
          title: string;
          message: string;
          related_user_id: string | null;
          related_post_id: string | null;
          related_comment_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_notifications']['Row'], 'id' | 'created_at' | 'is_read'>;
        Update: Partial<Database['public']['Tables']['user_notifications']['Insert']>;
      };
    };
  };
}