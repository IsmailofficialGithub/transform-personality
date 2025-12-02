import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '../../services/supabase';
import { CommunityPost } from '../../types';
import PostItem from '../../components/feed/PostItem';
import CreatePostModal from '../../components/feed/CreatePostModal';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { Users, Plus } from 'lucide-react-native';

export default function Feed() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    fetchPosts();
    subscribeToPosts();
    subscribeToLikes();
    subscribeToComments();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const subscribeToPosts = () => {
    const channel = supabase
      .channel('community_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();
    
    channelRef.current = channel;
  };

  const subscribeToLikes = () => {
    supabase
      .channel('post_likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();
  };

  const subscribeToComments = () => {
    supabase
      .channel('post_comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();
  };

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        user_profiles!author_id (
          id,
          username,
          avatar_url,
          display_name
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching posts:', error);
    } else {
      // Check which posts are liked by current user
      if (user) {
        const { data: likedPosts } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', data?.map(p => p.id) || []);

        const likedIds = new Set(likedPosts?.map(l => l.post_id) || []);
        const postsWithLikes = data?.map((post: any) => ({
          ...post,
          user_profiles: post.user_profiles,
          is_liked: likedIds.has(post.id),
        })) || [];
        setPosts(postsWithLikes as CommunityPost[]);
      } else {
        setPosts(data as CommunityPost[]);
      }
    }
    setLoading(false);
  }

  const handlePostDeleted = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.base.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: theme.base.background }}>
        <View
          style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
          className="px-4 py-3 border-b"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Users size={24} color={theme.primary} />
              <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
                Community
              </Text>
            </View>
            {user && (
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                style={{ backgroundColor: theme.primary }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Plus size={20} color={theme.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlashList
          data={posts}
          renderItem={({ item }) => <PostItem post={item} onPostDeleted={handlePostDeleted} />}
          // @ts-ignore
          estimatedItemSize={200}
          onRefresh={fetchPosts}
          refreshing={loading}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Users size={48} color={theme.text.tertiary} />
              <Text style={{ color: theme.text.secondary }} className="mt-4 text-center">
                No posts yet. Be the first to share!
              </Text>
            </View>
          }
        />
      </View>
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={fetchPosts}
      />
    </SafeAreaView>
  );
}
