import { supabase } from '../config/supabase';
// import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
// import { Platform } from 'react-native';

// ============================================
// TYPES
// ============================================

export interface UserProfile {
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
  badges: any[];
  joined_at: string;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
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
  // Joined data
  author?: UserProfile;
  is_liked?: boolean;
}

export interface PostComment {
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
  // Joined data
  author?: UserProfile;
  is_liked?: boolean;
  replies?: PostComment[];
}

export interface SuccessStory {
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
  // Joined data
  author?: UserProfile;
  is_liked?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
}

// ============================================
// IMAGE UPLOAD HELPERS
// ============================================

/**
 * Compress image before upload
 */
async function compressImage(uri: string): Promise<string> {
  try {
    // For now, we'll use the original URI
    // In production, you might want to use a library like react-native-image-resizer
    return uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(
  uri: string,
  bucket: string,
  path: string
): Promise<string> {
  try {
    const compressedUri = await compressImage(uri);
    
    // Get file extension and create filename
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${path}/${Date.now()}.${fileExt}`;
    const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(compressedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob for Supabase
    // In React Native, we need to create a proper blob
    const response = await fetch(`data:${contentType};base64,${base64}`);
    const blob = await response.blob();

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// ============================================
// COMMUNITY SERVICE
// ============================================

class CommunityService {
  // ============================================
  // USER PROFILE
  // ============================================

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();   
      console.log('👤 Getting current user profile:', user.id);


      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(profileId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profileData = {
        ...profile,
        user_id: user.id,
        last_active: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }

  /**
   * Update profile settings
   */
  async updateProfileSettings(settings: {
    is_profile_public?: boolean;
    show_streak?: boolean;
    show_before_after?: boolean;
    show_success_stories?: boolean;
  }): Promise<UserProfile> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(settings)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile settings:', error);
      throw error;
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const url = await uploadImage(imageUri, 'avatars', user.id);
      
      // Update profile with new avatar URL
      const profile = await this.getCurrentUserProfile();
      if (profile) {
        await this.upsertUserProfile({ avatar_url: url });
      }

      return url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // ============================================
  // POSTS
  // ============================================

  /**
   * Get community feed with pagination
   */
  async getCommunityFeed(params: PaginationParams = {}): Promise<CommunityPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const page = params.page || 0;
      const limit = params.limit || 20;
      const offset = page * limit;

      let query = supabase
        .from('community_posts')
        .select(`
          *,
          author:user_profiles!community_posts_author_id_fkey(*)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (params.category) {
        query = query.eq('category', params.category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check if user liked each post
      if (user && data) {
        const postIds = data.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        return data.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id),
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error getting community feed:', error);
      throw error;
    }
  }

  /**
   * Get single post by ID
   */
  async getPost(postId: string): Promise<CommunityPost | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:user_profiles!community_posts_author_id_fkey(*)
        `)
        .eq('id', postId)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;

      // Check if liked
      if (user && data) {
        const { data: like } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        data.is_liked = !!like;
      }

      // Increment view count
      await supabase.rpc('increment_post_views', { post_id: postId });

      return data;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  async getUserPosts( params: PaginationParams = {}): Promise<CommunityPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const page = params.page || 0;
      const limit = params.limit || 20;
      const offset = page * limit;
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:user_profiles!community_posts_author_id_fkey(*)
        `)
        .eq('author_id', user?.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Check if user liked each post
      if (user && data) {
        const postIds = data.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        return data.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id),
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
    }
  }
  /**
   * Create new post
   * FIXED: Now correctly uses profile.id for author_id
   */
  async createPost(
    post: {
      title: string;
      content: string;
      category: 'success' | 'support' | 'question' | 'motivation' | 'general';
      images?: string[];
    }
  ): Promise<CommunityPost> {
    try {
      console.log('📝 CommunityService.createPost called with:', post);
      
      const profile = await this.getCurrentUserProfile();
      if (!profile) {
        throw new Error('Profile not found. Please create your profile first.');
      }

      console.log('✅ Profile found:', {
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username
      });

      // Upload images if provided
      let imageUrls: string[] = [];
      if (post.images && post.images.length > 0) {
        console.log('📸 Uploading', post.images.length, 'images...');
        try {
          imageUrls = await Promise.all(
            post.images.map(uri => uploadImage(uri, 'post-images', profile.user_id))
          );
          console.log('✅ Images uploaded:', imageUrls);
        } catch (imgError) {
          console.error('❌ Image upload failed:', imgError);
          // Continue without images rather than failing
          imageUrls = [];
        }
      }

      console.log('💾 Inserting post into database...');
      console.log('💾 Using author_id (profile.id):', profile.id);
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          author_id: profile.id, // ✅ FIXED: Use profile.id (references user_profiles.id)
          title: post.title,
          content: post.content,
          category: post.category,
          images: imageUrls.length > 0 ? imageUrls : null,
        })
        .select(`
          *,
          author:user_profiles!community_posts_author_id_fkey(*)
        `)
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      if (!data) {
        console.error('❌ No data returned from insert');
        throw new Error('Failed to create post - no data returned');
      }

      console.log('✅ Post created successfully:', data.id);

      // Update user's post count
      await supabase
        .from('user_profiles')
        .update({ total_posts: profile.total_posts + 1 })
        .eq('id', profile.id)

      return data;
    } catch (error: any) {
      console.error('❌ Error in createPost:', error);
      throw error;
    }
  }

  /**
   * Update post
   * FIXED: Now correctly checks author_id against profile.id
   */
  async updatePost(
    postId: string,
    updates: {
      title?: string;
      content?: string;
      category?: string;
      images?: string[];
    }
  ): Promise<CommunityPost> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      // Upload new images if provided
      let imageUrls: string[] | undefined;
      if (updates.images && updates.images.length > 0) {
        imageUrls = await Promise.all(
          updates.images.map(uri => uploadImage(uri, 'post-images', profile.user_id))
        );
      }

      const updateData: any = { ...updates };
      if (imageUrls) {
        updateData.images = imageUrls;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .update(updateData)
        .eq('id', postId)
        .eq('author_id', profile.id) // ✅ FIXED: Use profile.id
        .select(`
          *,
          author:user_profiles!community_posts_author_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * Delete post
   * FIXED: Now correctly checks author_id against profile.id
   */
  async deletePost(postId: string): Promise<void> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('community_posts')
        .update({ is_deleted: true })
        .eq('id', postId)
        .eq('author_id', profile.id) // ✅ FIXED: Use profile.id

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike post
   * FIXED: Prevents duplicate likes by using upsert with conflict handling
   */
  async togglePostLike(postId: string): Promise<boolean> {
    try {
      // 1. Get current user
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error("User not logged in");
  
      const userId = profile.user_id;
  
      // 2. Check if like already exists
      const { data: likeRows, error: selectError } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId);
  
      if (selectError) throw selectError;
  
      const existingLike = likeRows?.[0];
  
      // 3. If already liked → UNLIKE
      if (existingLike) {
        const { error: deleteError } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id);
  
        if (deleteError) throw deleteError;
  
        return false; // now unliked
      }
  
      // 4. If not liked → LIKE (double-check before insert to prevent race conditions)
      // Double-check to prevent race conditions from rapid clicks
      const { data: doubleCheck, error: checkError } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
  
      if (checkError) throw checkError;
      
      // If like was added between checks (race condition), return true
      if (doubleCheck) {
        console.log('⚠️ Like already exists (race condition prevented)');
        return true;
      }
  
      // Insert the like
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: userId,
        });
  
      // Handle duplicate key errors gracefully (unique constraint violation)
      if (insertError) {
        const isDuplicateError = 
          insertError.code === '23505' || 
          insertError.message?.includes('duplicate') || 
          insertError.message?.includes('unique') || 
          insertError.message?.includes('violates unique constraint') ||
          insertError.message?.includes('already exists');
        
        if (isDuplicateError) {
          console.log('⚠️ Duplicate like detected (unique constraint), ignoring...');
          // Like already exists, just return true
          return true;
        }
        throw insertError;
      }
  
      return true; // now liked
    } catch (error: any) {
      console.error("❌ togglePostLike Error:", error);
      // If it's a duplicate error, just return true (like already exists)
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        console.log('⚠️ Duplicate like detected, ignoring...');
        return true;
      }
      throw error;
    }
  }
  
  // ============================================
  // COMMENTS
  // ============================================

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string): Promise<PostComment[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:user_profiles!post_comments_author_id_fkey(*)
        `)
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Check if user liked each comment
      if (user && data) {
        const commentIds = data.map(c => c.id);
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const likedCommentIds = new Set(likes?.map(l => l.comment_id) || []);
        return data.map(comment => ({
          ...comment,
          is_liked: likedCommentIds.has(comment.id),
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  /**
   * Add comment to post
   * FIXED: Now correctly uses profile.id for author_id
   */
  async addComment(
    postId: string,
    content: string,
    parentCommentId?: string
  ): Promise<PostComment> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');
  
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: profile.id,
          content,
          parent_comment_id: parentCommentId || null,
        })
        .select(`
          *,
          author:user_profiles!post_comments_author_id_fkey(*)
        `)
        .single();
  
      if (error) throw error;
  
      // Increment comments_count once
      const { error: incrementError } = await supabase.rpc('increment_post_comments_count', { post_id_input: postId });
      if (incrementError) console.error('Error incrementing post comments_count:', incrementError);
  
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
  
  /**
   * Update comment
   * FIXED: Now correctly checks author_id against profile.id
   */
  async updateComment(
    commentId: string,
    content: string
  ): Promise<PostComment> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('post_comments')
        .update({ content })
        .eq('id', commentId)
        .eq('author_id', profile.id) // ✅ FIXED: Use profile.id
        .select(`
          *,
          author:user_profiles!post_comments_author_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Delete comment
   * FIXED: Now correctly checks author_id against profile.id
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('post_comments')
        .update({ is_deleted: true })
        .eq('id', commentId)
        .eq('author_id', profile.id) // ✅ FIXED: Use profile.id

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike comment
   */
  async toggleCommentLike(commentId: string): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error("Profile not found");
  
      // Check if user already liked the comment
      const { data: existingLike, error: selectError } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", profile.user_id)
        .maybeSingle();
  
      if (selectError) throw selectError;
  
      // ------------------------
      // CASE 1: Unlike (remove)
      // ------------------------
      if (existingLike) {
        const { error: deleteError } = await supabase
          .from("comment_likes")
          .delete()
          .eq("id", existingLike.id);
  
        if (deleteError) throw deleteError;
  
        // decrement like count
        const { error: decError } = await supabase.rpc(
          "decrement_comment_count",
          { comment_id: commentId }
        );
  
        if (decError) throw decError;
  
        return false; // now unliked
      }
  
      // ------------------------
      // CASE 2: Like (add)
      // ------------------------
      const { error: insertError } = await supabase.from("comment_likes").insert({
        comment_id: commentId,
        user_id: profile.user_id,
      });
  
      if (insertError) throw insertError;
  
      // increment like count
      const { error: incError } = await supabase.rpc(
        "increment_comment_count",
        { comment_id: commentId }
      );
  
      if (incError) throw incError;
  
      return true; // now liked
    } catch (error) {
      console.error("Error toggling comment like:", error);
      throw error;
    }
  }


  async incrementPostViews(postId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_post_views', { post_id_input: postId });
    if (error) throw error;
  }
  
  

  // ============================================
  // SUCCESS STORIES
  // ============================================

  /**
   * Get success stories
   */
  async getSuccessStories(params: PaginationParams = {}): Promise<SuccessStory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const page = params.page || 0;
      const limit = params.limit || 20;
      const offset = page * limit;

      const { data, error } = await supabase
        .from('success_stories')
        .select(`
          *,
          author:user_profiles!success_stories_author_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Check if user liked each story
      if (user && data) {
        const storyIds = data.map(s => s.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', storyIds);

        const likedStoryIds = new Set(likes?.map(l => l.post_id) || []);
        return data.map(story => ({
          ...story,
          is_liked: likedStoryIds.has(story.id),
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error getting success stories:', error);
      throw error;
    }
  }

  /**
   * Create success story
   * FIXED: Now correctly uses profile.id for author_id
   */
  async createSuccessStory(
    story: {
      title: string;
      story: string;
      days_clean: number;
      before_image_url?: string;
      after_image_url?: string;
      additional_images?: string[];
    }
  ): Promise<SuccessStory> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      // Upload images if provided
      let beforeUrl: string | undefined;
      let afterUrl: string | undefined;
      let additionalUrls: string[] = [];

      if (story.before_image_url) {
        beforeUrl = await uploadImage(story.before_image_url, 'success-stories', profile.user_id);
      }
      if (story.after_image_url) {
        afterUrl = await uploadImage(story.after_image_url, 'success-stories', profile.user_id);
      }
      if (story.additional_images && story.additional_images.length > 0) {
        additionalUrls = await Promise.all(
          story.additional_images.map(uri => uploadImage(uri, 'success-stories', profile.user_id))
        );
      }

      const { data, error } = await supabase
        .from('success_stories')
        .insert({
          author_id: profile.id, // ✅ FIXED: Use profile.id
          title: story.title,
          story: story.story,
          days_clean: story.days_clean,
          before_image_url: beforeUrl || null,
          after_image_url: afterUrl || null,
          additional_images: additionalUrls.length > 0 ? additionalUrls : null,
        })
        .select(`
          *,
          author:user_profiles!success_stories_author_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating success story:', error);
      throw error;
    }
  }

  // ============================================
  // FOLLOWERS
  // ============================================

  /**
   * Follow/Unfollow user
   */
  async toggleFollow(profileId: string): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      const { data: existingFollow } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', profile.user_id)
        .eq('following_id', profileId)
        .single();

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('id', existingFollow.id);

        if (error) throw error;
        return false;
      } else {
        // Follow
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: profile.user_id,
            following_id: profileId,
          });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  }

  /**
   * Check if following user
   */
  async isFollowing(profileId: string): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) return false;

      const { data } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', profile.user_id)
        .eq('following_id', profileId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // REPORTS
  // ============================================

  /**
   * Report content
   */
  async reportContent(
    contentType: 'post' | 'comment' | 'user',
    contentId: string,
    reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other',
    description?: string
  ): Promise<void> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: profile.user_id,
          content_type: contentType,
          content_id: contentId,
          reason,
          description: description || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }
}

export const communityService = new CommunityService();