import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import Toast from 'react-native-root-toast';
import { communityService } from '../../services/CommunityService';
import { useCommunityStore } from '../../store/communityStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import type { CommunityPost, PostComment } from '../../services/CommunityService';
import type { Screen } from '../../navigation/AppNavigator';

interface PostDetailScreenProps {
  postId: string;
  onNavigate?: (screen: Screen) => void;
  onBack?: () => void;
}

export const PostDetailScreen = ({ postId, onNavigate, onBack }: PostDetailScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { currentProfile } = useCommunityStore();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);
  
  const isAuthor = post && currentProfile && post.author_id === currentProfile.id;

  useEffect(() => {
    const initializePost = async () => {
      try {
        // Increment views
        await communityService.incrementPostViews(postId);
  
        // Load post data
        await loadPost();
        await loadComments();
      } catch (error: any) {
        console.error('Error initializing post:', error);
      }
    };
  
    initializePost();
  }, [postId]);
  

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await communityService.getPost(postId);
      setPost(postData);
    } catch (error: any) {
      Toast.show(error.message || 'Failed to load post', { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentsData = await communityService.getPostComments(postId);
      setComments(commentsData);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async () => {
    if (!post || liking) return; // Prevent double-clicks
    
    try {
      setLiking(true);
      const wasLiked = post.is_liked;
      setPost({ ...post, is_liked: !wasLiked, likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1 });
      await communityService.togglePostLike(postId);
      const updatedPost = await communityService.getPost(postId);
      if (updatedPost) setPost(updatedPost);
    } catch (error: any) {
      console.error('Error liking post:', error);
      Toast.show(error.message || 'Failed to like post', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: '#E53935',
        textColor: '#FFF',
      });
      // Revert optimistic update
      if (post) {
        setPost({ ...post, is_liked: !post.is_liked, likes_count: post.is_liked ? post.likes_count + 1 : post.likes_count - 1 });
      }
    } finally {
      setLiking(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const wasLiked = comment.is_liked;
      setComments(
        comments.map((c) =>
          c.id === commentId
            ? { ...c, is_liked: !wasLiked, likes_count: wasLiked ? c.likes_count - 1 : c.likes_count + 1 }
            : c
        )
      );

      await communityService.toggleCommentLike(commentId);
      await loadComments(); // Reload to get accurate count
    } catch (error: any) {
      Toast.show('Failed to like comment', { duration: Toast.durations.SHORT });
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setCommenting(true);
      await communityService.addComment(postId, commentText.trim());
      setCommentText('');
      await loadComments();
      if (post) {
        setPost({ ...post, comments_count: post.comments_count + 1 });
      }
      Toast.show('Comment added!', { duration: Toast.durations.SHORT });
    } catch (error: any) {
      Toast.show(error.message || 'Failed to add comment', { duration: Toast.durations.SHORT });
    } finally {
      setCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await communityService.deletePost(postId);
              Toast.show('Post deleted successfully', { duration: Toast.durations.SHORT });
              if (onBack) {
                onBack();
              } else if (onNavigate) {
                onNavigate('community' as Screen);
              }
            } catch (error: any) {
              Toast.show(error.message || 'Failed to delete post', { duration: Toast.durations.SHORT });
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Post not found</Text>
      </View>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const author = post.author;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Post</Text>
        {isAuthor && (
          <TouchableOpacity
            onPress={handleDeletePost}
            disabled={deleting}
            style={styles.deleteButton}
          >
            {deleting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>🗑️</Text>
            )}
          </TouchableOpacity>
        )}
        {!isAuthor && <View style={styles.headerSpacer} />}
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Post Card */}
        <View style={[styles.postCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: isDark ? colors.border : '#E5E7EB' }]}>
          {/* Author Info */}
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              {author?.avatar_url ? (
                <Image source={{ uri: author.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{author?.username?.[0]?.toUpperCase() || '?'}</Text>
                </View>
              )}
              <View style={styles.authorDetails}>
                <Text style={[styles.authorName, { color: isDark ? colors.text : '#000' }]}>
                  {author?.display_name || author?.username || 'Anonymous'}
                </Text>
                <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>{timeAgo}</Text>
              </View>
            </View>
          </View>

          {/* Post Content */}
          <Text style={[styles.postTitle, { color: isDark ? colors.text : '#000' }]}>{post.title}</Text>
          <Text style={[styles.postContent, { color: isDark ? colors.textSecondary : '#666' }]}>{post.content}</Text>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {post.images.map((imageUri, index) => (
                <Image key={index} source={{ uri: imageUri }} style={styles.postImage} resizeMode="cover" />
              ))}
            </ScrollView>
          )}

          {/* Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLike} 
              activeOpacity={0.7}
              disabled={liking}
            >
              <Text style={[styles.actionIcon, { color: post.is_liked ? colors.error : colors.textSecondary }]}>
                {post.is_liked ? '❤️' : '🤍'}
              </Text>
              <Text style={[styles.actionCount, { color: isDark ? colors.textSecondary : '#666' }]}>
                {post.likes_count}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionButton}>
              <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>💬</Text>
              <Text style={[styles.actionCount, { color: isDark ? colors.textSecondary : '#666' }]}>
                {post.comments_count}
              </Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>👁️</Text>
              <Text style={[styles.actionCount, { color: isDark ? colors.textSecondary : '#666' }]}>
                {post.views_count}
              </Text>
            </View>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsTitle, { color: isDark ? colors.text : '#000' }]}>
            Comments ({comments.length})
          </Text>

          {comments.map((comment) => {
            const commentTimeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
            const commentAuthor = comment.author;

            return (
              <View
                key={comment.id}
                style={[styles.commentCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: isDark ? colors.border : '#E5E7EB' }]}
              >
                <View style={styles.commentHeader}>
                  {commentAuthor?.avatar_url ? (
                    <Image source={{ uri: commentAuthor.avatar_url }} style={styles.commentAvatar} />
                  ) : (
                    <View style={[styles.commentAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                      <Text style={styles.commentAvatarText}>{commentAuthor?.username?.[0]?.toUpperCase() || '?'}</Text>
                    </View>
                  )}
                  <View style={styles.commentAuthorInfo}>
                    <Text style={[styles.commentAuthorName, { color: isDark ? colors.text : '#000' }]}>
                      {commentAuthor?.display_name || commentAuthor?.username || 'Anonymous'}
                    </Text>
                    <Text style={[styles.commentTime, { color: colors.textSecondary }]}>{commentTimeAgo}</Text>
                  </View>
                </View>
                <Text style={[styles.commentContent, { color: isDark ? colors.textSecondary : '#666' }]}>
                  {comment.content}
                </Text>
                <TouchableOpacity
                  style={styles.commentLikeButton}
                  onPress={() => handleCommentLike(comment.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.commentLikeIcon, { color: comment.is_liked ? colors.error : colors.textSecondary }]}>
                    {comment.is_liked ? '❤️' : '🤍'}
                  </Text>
                  <Text style={[styles.commentLikeCount, { color: isDark ? colors.textSecondary : '#666' }]}>
                    {comment.likes_count}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {comments.length === 0 && (
            <View style={styles.noComments}>
              <Text style={[styles.noCommentsText, { color: colors.textSecondary }]}>No comments yet. Be the first!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={[styles.commentInputContainer, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderTopColor: isDark ? colors.border : '#E5E7EB' }]}>
        <TextInput
          style={[styles.commentInput, { backgroundColor: isDark ? colors.background : '#F5F5F5', color: isDark ? colors.text : '#000' }]}
          placeholder="Write a comment..."
          placeholderTextColor={isDark ? colors.textSecondary : '#999'}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.commentSubmitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || commenting}
        >
          {commenting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.commentSubmitText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.body,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSpacer: {
    width: 60,
  },
  deleteButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  postCard: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: SIZES.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: SIZES.tiny,
  },
  postTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    marginBottom: 12,
  },
  postContent: {
    fontSize: SIZES.body,
    lineHeight: 22,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  postImage: {
    width: 200,
    height: 200,
    borderRadius: SIZES.radius,
    marginRight: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  actionCount: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: SIZES.margin,
  },
  commentsTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    marginBottom: 16,
  },
  commentCard: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: SIZES.small,
    fontWeight: '700',
    marginBottom: 2,
  },
  commentTime: {
    fontSize: SIZES.tiny,
  },
  commentContent: {
    fontSize: SIZES.body,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  commentLikeIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  commentLikeCount: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
  },
  noComments: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: SIZES.body,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderRadius: SIZES.radius,
    padding: 12,
    fontSize: SIZES.body,
    maxHeight: 100,
    marginRight: 8,
  },
  commentSubmitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  commentSubmitText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '700',
  },
});

