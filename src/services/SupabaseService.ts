import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ CRITICAL: Supabase credentials not found!');
  console.error('Add these to your .env file:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your_url');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key');
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
    };
  };
}