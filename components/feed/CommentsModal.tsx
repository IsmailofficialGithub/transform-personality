import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { X, Send, Heart, Trash2, User } from 'lucide-react-native';
import { PostComment } from '../../types';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postAuthorId: string;
}

export default function CommentsModal({ visible, onClose, postId, postAuthorId }: CommentsModalProps) {
  const theme = useTheme();
  const { user, profile } = useAuthStore();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchComments();
      subscribeToComments();
    }
    return () => {
      if (visible) {
        supabase.removeAllChannels();
      }
    };
  }, [visible, postId]);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user_profiles!author_id (
          id,
          username,
          avatar_url,
          display_name
        )
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.log('Error fetching comments:', error);
    } else {
      // Check which comments are liked by current user
      if (user) {
        const { data: likedComments } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', data?.map(c => c.id) || []);

        const likedIds = new Set(likedComments?.map(l => l.comment_id) || []);
        const commentsWithLikes = data?.map((comment: any) => ({
          ...comment,
          user_profiles: comment.user_profiles,
          is_liked: likedIds.has(comment.id),
        })) || [];
        setComments(commentsWithLikes as PostComment[]);
      } else {
        setComments(data as PostComment[]);
      }
    }
    setLoading(false);
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`post_comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitComment = async () => {
    if (!user || !profile || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        Alert.alert('Error', 'Profile not found');
        return;
      }

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: userProfile.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      // Update comments count
      const { data: postData } = await supabase
        .from('community_posts')
        .select('comments_count')
        .eq('id', postId)
        .single();

      if (postData) {
        await supabase
          .from('community_posts')
          .update({ comments_count: (postData.comments_count || 0) + 1 })
          .eq('id', postId);
      }

      setNewComment('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        // Update comment likes count
        const { data: commentData } = await supabase
          .from('post_comments')
          .select('likes_count')
          .eq('id', commentId)
          .single();

        if (commentData) {
          await supabase
            .from('post_comments')
            .update({ likes_count: Math.max(0, (commentData.likes_count || 0) - 1) })
            .eq('id', commentId);
        }
      } else {
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        // Update comment likes count
        const { data: commentData } = await supabase
          .from('post_comments')
          .select('likes_count')
          .eq('id', commentId)
          .single();

        if (commentData) {
          await supabase
            .from('post_comments')
            .update({ likes_count: (commentData.likes_count || 0) + 1 })
            .eq('id', commentId);
        }
      }
      fetchComments();
    } catch (error: any) {
      console.log('Error toggling like:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('post_comments')
                .update({ is_deleted: true })
                .eq('id', commentId);

              // Update comments count
              const { data: postData } = await supabase
                .from('community_posts')
                .select('comments_count')
                .eq('id', postId)
                .single();

              if (postData) {
                await supabase
                  .from('community_posts')
                  .update({ comments_count: Math.max(0, (postData.comments_count || 0) - 1) })
                  .eq('id', postId);
              }

              fetchComments();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.base.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.base.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsList} contentContainerStyle={{ padding: 15 }}>
            {loading ? (
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>Loading comments...</Text>
            ) : comments.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No comments yet</Text>
            ) : (
              comments.map((comment) => {
                const isCommentAuthor = profile && comment.author_id === profile.id;
                return (
                  <View
                    key={comment.id}
                    style={[styles.commentItem, { backgroundColor: theme.base.card }]}
                  >
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthor}>
                        {comment.user_profiles?.avatar_url ? (
                          <View style={styles.avatarPlaceholder}>
                            <User size={16} color={theme.text.secondary} />
                          </View>
                        ) : (
                          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.base.surface }]}>
                            <User size={16} color={theme.text.secondary} />
                          </View>
                        )}
                        <Text style={[styles.authorName, { color: theme.text.primary }]}>
                          {comment.user_profiles?.username || 'User'}
                        </Text>
                      </View>
                      {isCommentAuthor && (
                        <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                          <Trash2 size={16} color={theme.status.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.commentContent, { color: theme.text.primary }]}>
                      {comment.content}
                    </Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLikeComment(comment.id, comment.is_liked || false)}
                      >
                        <Heart
                          size={16}
                          color={comment.is_liked ? theme.status.error : theme.text.secondary}
                          fill={comment.is_liked ? theme.status.error : 'none'}
                        />
                        <Text style={[styles.likeCount, { color: theme.text.secondary }]}>
                          {comment.likes_count || 0}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {user && (
            <View style={[styles.inputContainer, { borderTopColor: theme.base.border }]}>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: theme.base.card,
                    color: theme.text.primary,
                    borderColor: theme.base.border,
                  },
                ]}
                placeholder="Write a comment..."
                placeholderTextColor={theme.text.tertiary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                style={[
                  styles.sendButton,
                  {
                    backgroundColor:
                      submitting || !newComment.trim() ? theme.base.border : theme.primary,
                  },
                ]}
              >
                <Send
                  size={20}
                  color={submitting || !newComment.trim() ? theme.text.tertiary : theme.text.inverse}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  commentItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeCount: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    gap: 10,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

