import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { communityService } from '../services/CommunityService';
import type {
  UserProfile,
  CommunityPost,
  PostComment,
  SuccessStory,
} from '../services/CommunityService';

interface CommunityStore {
  // State
  currentProfile: UserProfile | null;
  posts: CommunityPost[];
  successStories: SuccessStory[];
  loading: boolean;
  error: string | null;
  hasMorePosts: boolean;
  currentPage: number;
  selectedCategory: string | null;
  selectedPostId: string | null;

  // Actions
  setCurrentProfile: (profile: UserProfile | null) => void;
  setPosts: (posts: CommunityPost[]) => void;
  addPost: (post: CommunityPost) => void;
  updatePost: (postId: string, updates: Partial<CommunityPost>) => void;
  removePost: (postId: string) => void;
  setSuccessStories: (stories: SuccessStory[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMorePosts: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedPostId: (postId: string | null) => void;

  // Async Actions
  loadCurrentProfile: () => Promise<void>;
  loadFeed: (page?: number, category?: string, append?: boolean) => Promise<void>;
  refreshFeed: () => Promise<void>;
  createPost: (post: {
    title: string;
    content: string;
    category: 'success' | 'support' | 'question' | 'motivation' | 'general';
    images?: string[];
  }) => Promise<CommunityPost>;
  likePost: (postId: string) => Promise<void>;
  loadSuccessStories: (page?: number) => Promise<void>;
  refreshSuccessStories: () => Promise<void>;
}

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentProfile: null,
      posts: [],
      successStories: [],
      loading: false,
      error: null,
      hasMorePosts: true,
  currentPage: 0,
  selectedCategory: null,
  selectedPostId: null,

      // Setters
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      updatePost: (postId, updates) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, ...updates } : p
          ),
        })),
      removePost: (postId) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
        })),
      setSuccessStories: (stories) => set({ successStories: stories }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setHasMorePosts: (hasMore) => set({ hasMorePosts: hasMore }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedPostId: (postId) => set({ selectedPostId: postId }),

      // Async Actions
      loadCurrentProfile: async () => {
        try {
          set({ loading: true, error: null });
          const profile = await communityService.getCurrentUserProfile();
          set({ currentProfile: profile, loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to load profile', loading: false });
        }
      },

      loadFeed: async (page = 0, category = null, append = false) => {
        try {
          set({ loading: true, error: null });
          const posts = await communityService.getCommunityFeed({
            page,
            limit: 20,
            category: category || undefined,
          });

          if (append) {
            set((state) => ({
              posts: [...state.posts, ...posts],
              hasMorePosts: posts.length === 20,
              currentPage: page,
              loading: false,
            }));
          } else {
            set({
              posts,
              hasMorePosts: posts.length === 20,
              currentPage: page,
              loading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to load feed', loading: false });
        }
      },

      refreshFeed: async () => {
        const { selectedCategory } = get();
        await get().loadFeed(0, selectedCategory || null, false);
      },

      createPost: async (postData) => {
        try {
          set({ loading: true, error: null });
          const newPost = await communityService.createPost(postData);
          
          // Add to top of feed
          set((state) => ({
            posts: [newPost, ...state.posts],
            loading: false,
          }));

          // Update profile post count
          const profile = get().currentProfile;
          if (profile) {
            set({
              currentProfile: {
                ...profile,
                total_posts: profile.total_posts + 1,
              },
            });
          }

          return newPost;
        } catch (error: any) {
          set({ error: error.message || 'Failed to create post', loading: false });
          throw error;
        }
      },

      likePost: async (postId) => {
        try {
          // Prevent duplicate calls - check if already processing
          const post = get().posts.find((p) => p.id === postId);
          if (!post) return;

          // Optimistic update
          const wasLiked = post.is_liked;
          const newLikesCount = wasLiked
            ? post.likes_count - 1
            : post.likes_count + 1;

          get().updatePost(postId, {
            is_liked: !wasLiked,
            likes_count: newLikesCount,
          });

          // Toggle like
          await communityService.togglePostLike(postId);

          // Reload to get accurate count
          const updatedPost = await communityService.getPost(postId);
          if (updatedPost) {
            get().updatePost(postId, {
              likes_count: updatedPost.likes_count,
              is_liked: updatedPost.is_liked,
            });
          }
        } catch (error: any) {
          console.error('Error liking post:', error);
          // Revert optimistic update
          const post = get().posts.find((p) => p.id === postId);
          if (post) {
            get().updatePost(postId, {
              is_liked: !post.is_liked,
              likes_count: post.is_liked
                ? post.likes_count + 1
                : post.likes_count - 1,
            });
          }
          set({ error: error.message || 'Failed to like post' });
          throw error; // Re-throw to show toast in UI
        }
      },

      loadSuccessStories: async (page = 0) => {
        try {
          set({ loading: true, error: null });
          const stories = await communityService.getSuccessStories({
            page,
            limit: 20,
          });

          if (page === 0) {
            set({ successStories: stories, loading: false });
          } else {
            set((state) => ({
              successStories: [...state.successStories, ...stories],
              loading: false,
            }));
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to load stories', loading: false });
        }
      },

      refreshSuccessStories: async () => {
        await get().loadSuccessStories(0);
      },
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentProfile: state.currentProfile,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);

