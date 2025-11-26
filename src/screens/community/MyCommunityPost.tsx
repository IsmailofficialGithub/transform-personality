import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-root-toast';
import {
  Heart,
  MessageCircle,
  Eye,
  Plus,
  FileText,
  ArrowLeft,
  Trash2,
  Edit2,
  PartyPopper,
  HeartHandshake,
  HelpCircle,
  Flame,
  Globe
} from 'lucide-react-native';
import { SIZES, COLORS, SHADOWS } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { communityService, CommunityPost } from '../../services/CommunityService';
import { POST_CATEGORIES, formatTimeAgo, formatNumber } from '../../constants/community';

// Icon mapping for dynamic rendering
const IconMap: Record<string, any> = {
  PartyPopper,
  HeartHandshake,
  HelpCircle,
  Flame,
  MessageCircle,
  Globe,
};

interface MyCommunityPostProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export const MyCommunityPost = ({ onNavigate }: MyCommunityPostProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUserPosts = useCallback(async () => {
    try {
      const userPosts = await communityService.getUserPosts();
      // Sort by newest first
      const sortedPosts = userPosts.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
      Toast.show('Failed to load your posts', { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUserPosts();
  }, [loadUserPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserPosts();
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await communityService.deletePost(postId);
              setPosts(prev => prev.filter(p => p.id !== postId));
              Toast.show('Post deleted successfully', { duration: Toast.durations.SHORT });
            } catch (error) {
              console.error('Error deleting post:', error);
              Toast.show('Failed to delete post', { duration: Toast.durations.SHORT });
            }
          }
        }
      ]
    );
  };

  const openEditModal = (post: CommunityPost) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    if (!editTitle.trim() || !editContent.trim()) {
      Alert.alert('Error', 'Title and content cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const updatedPost = await communityService.updatePost(editingPost.id, {
        title: editTitle,
        content: editContent,
      });

      setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p));
      setEditModalVisible(false);
      Toast.show('Post updated successfully', { duration: Toast.durations.SHORT });
    } catch (error) {
      console.error('Error updating post:', error);
      Toast.show('Failed to update post', { duration: Toast.durations.SHORT });
    } finally {
      setSaving(false);
    }
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)';
  const inputBg = isDark ? 'rgba(255,255,255,0.1)' : '#F5F5F5';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F0F0F' : '#F5F7FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header Background */}
      <LinearGradient
        colors={isDark ? ['rgba(108, 92, 231, 0.15)', 'transparent'] : ['rgba(108, 92, 231, 0.05)', 'transparent']}
        style={styles.headerBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFF' }]}
          onPress={() => onNavigate?.('profile')}
        >
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: textColor }]}>My Posts</Text>
          <Text style={[styles.subtitle, { color: subText }]}>Manage your contributions</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FileText size={64} color={subText} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: textColor }]}>No posts yet</Text>
              <Text style={[styles.emptySubtext, { color: subText }]}>
                Share your journey with the community!
              </Text>
            </View>
          ) : (
            posts.map((post) => {
              const category = POST_CATEGORIES.find(c => c.id === post.category);
              const timeAgo = formatTimeAgo(post.created_at);
              const CategoryIcon = category?.icon ? IconMap[category.icon] : MessageCircle;

              return (
                <View
                  key={post.id}
                  style={[
                    styles.postCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      borderWidth: 1,
                    }
                  ]}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.categoryBadge}>
                      <CategoryIcon size={12} color="#6C5CE7" style={{ marginRight: 4 }} />
                      <Text style={styles.categoryText}>
                        {category?.label || post.category}
                      </Text>
                    </View>
                    <Text style={[styles.postTime, { color: subText }]}>{timeAgo}</Text>
                  </View>

                  <Text style={[styles.postTitle, { color: textColor }]}>{post.title}</Text>
                  <Text
                    style={[styles.postContent, { color: isDark ? '#CCC' : '#444' }]}
                    numberOfLines={3}
                  >
                    {post.content}
                  </Text>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Heart size={14} color={subText} />
                      <Text style={[styles.statText, { color: subText }]}>
                        {formatNumber(post.likes_count)}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MessageCircle size={14} color={subText} />
                      <Text style={[styles.statText, { color: subText }]}>
                        {formatNumber(post.comments_count)}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Eye size={14} color={subText} />
                      <Text style={[styles.statText, { color: subText }]}>
                        {formatNumber(post.views_count)}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={[styles.actionRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F0F0F0' }]}
                      onPress={() => openEditModal(post)}
                    >
                      <Edit2 size={16} color={textColor} style={{ marginRight: 6 }} />
                      <Text style={[styles.actionButtonText, { color: textColor }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: 'rgba(255, 82, 82, 0.1)' }]}
                      onPress={() => handleDelete(post.id)}
                    >
                      <Trash2 size={16} color="#FF5252" style={{ marginRight: 6 }} />
                      <Text style={[styles.actionButtonText, { color: '#FF5252' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, SHADOWS.medium]}
        onPress={() => onNavigate?.('createPost')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradientPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Edit Post</Text>

            <Text style={[styles.inputLabel, { color: subText }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Post title"
              placeholderTextColor={subText}
            />

            <Text style={[styles.inputLabel, { color: subText }]}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor }]}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Post content"
              placeholderTextColor={subText}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F0F0F0' }]}
                onPress={() => setEditModalVisible(false)}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
  },
  postCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#6C5CE7',
    fontSize: 12,
    fontWeight: '700',
  },
  postTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
