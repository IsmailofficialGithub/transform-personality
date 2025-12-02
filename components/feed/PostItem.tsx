import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CommunityPost } from '../../types';
import { Heart, MessageCircle, User, Trash2, Eye } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import CommentsModal from './CommentsModal';

interface PostItemProps {
  post: CommunityPost;
  onPostDeleted?: () => void;
}

export default function PostItem({ post, onPostDeleted }: PostItemProps) {
  const theme = useTheme();
  const { user, profile } = useAuthStore();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [viewsCount, setViewsCount] = useState(post.views_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    checkIfLiked();
    checkIfAuthor();
    trackImpression();
  }, [post.id, user, profile]);

  const checkIfLiked = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .single();
    setIsLiked(!!data);
  };

  const checkIfAuthor = () => {
    if (!profile) return;
    // post.author_id references user_profiles(id), and profile.id is the user_profiles id
    setIsAuthor(post.author_id === profile.id);
  };

  const trackImpression = async () => {
    if (!user) return;
    try {
      const { data: postData } = await supabase
        .from('community_posts')
        .select('views_count')
        .eq('id', post.id)
        .single();

      if (postData) {
        await supabase
          .from('community_posts')
          .update({ views_count: (postData.views_count || 0) + 1 })
          .eq('id', post.id);
        setViewsCount((prev) => prev + 1);
      }
    } catch (error) {
      console.log('Error tracking impression:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like posts');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        // Update likes count
        const { data: postData } = await supabase
          .from('community_posts')
          .select('likes_count')
          .eq('id', post.id)
          .single();

        if (postData) {
          await supabase
            .from('community_posts')
            .update({ likes_count: Math.max(0, (postData.likes_count || 0) - 1) })
            .eq('id', post.id);
        }

        setLikesCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });

        // Update likes count
        const { data: postData } = await supabase
          .from('community_posts')
          .select('likes_count')
          .eq('id', post.id)
          .single();

        if (postData) {
          await supabase
            .from('community_posts')
            .update({ likes_count: (postData.likes_count || 0) + 1 })
            .eq('id', post.id);
        }

        setLikesCount((prev) => prev + 1);
        setIsLiked(true);

        // Create notification for post author
        await createLikeNotification();
      }
    } catch (error: any) {
      console.log('Error toggling like:', error);
    }
  };

  const createLikeNotification = async () => {
    if (!user || !profile || post.author_id === profile.id) return; // Don't notify self

    try {
      // Get liker's profile
      const { data: likerProfile } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('user_id', user.id)
        .single();

      if (!likerProfile) return;

      // Create notification
      await supabase
        .from('user_notifications')
        .insert({
          user_id: post.author_id,
          type: 'like',
          title: 'New Like',
          message: `${likerProfile.username || 'Someone'} liked your post`,
          related_user_id: likerProfile.id,
          related_post_id: post.id,
        });
    } catch (error) {
      console.log('Error creating notification:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('community_posts')
                .update({ is_deleted: true })
                .eq('id', post.id);
              
              onPostDeleted?.();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const displayName = post.user_profiles?.username || post.user_profiles?.display_name || 'User';

  return (
    <>
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 mb-3 rounded-xl border"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {post.user_profiles?.avatar_url ? (
              <Image
                source={{ uri: post.user_profiles.avatar_url }}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <View
                style={{ backgroundColor: theme.base.surface }}
                className="w-10 h-10 rounded-full mr-3 items-center justify-center"
              >
                <User size={20} color={theme.text.secondary} />
              </View>
            )}
            <View className="flex-1">
              <Text style={{ color: theme.text.primary }} className="font-bold">
                {displayName}
              </Text>
              {post.category && (
                <Text style={{ color: theme.text.tertiary }} className="text-xs">
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </Text>
              )}
            </View>
          </View>
          {isAuthor && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Trash2 size={18} color={theme.status.error} />
            </TouchableOpacity>
          )}
        </View>

        {post.title && (
          <Text style={{ color: theme.text.primary }} className="text-lg font-bold mb-2">
            {post.title}
          </Text>
        )}
        <Text style={{ color: theme.text.primary }} className="mb-3">
          {post.content}
        </Text>
        
        {post.images && post.images.length > 0 && (
          <Image
            source={{ uri: post.images[0] }}
            className="w-full h-48 rounded-lg mb-3"
            resizeMode="cover"
          />
        )}

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={handleLike}
            >
              <Heart
                size={20}
                color={isLiked ? theme.status.error : theme.text.secondary}
                fill={isLiked ? theme.status.error : 'none'}
              />
              <Text
                style={{ color: isLiked ? theme.status.error : theme.text.secondary }}
                className="ml-1 text-sm font-semibold"
              >
                {likesCount}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setShowComments(true)}
            >
              <MessageCircle size={20} color={theme.text.secondary} />
              <Text style={{ color: theme.text.secondary }} className="ml-1 text-sm font-semibold">
                {commentsCount}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <Eye size={18} color={theme.text.tertiary} />
              <Text style={{ color: theme.text.tertiary }} className="ml-1 text-xs">
                {viewsCount}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
        postAuthorId={post.author_id}
      />
    </>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    padding: 5,
  },
});
