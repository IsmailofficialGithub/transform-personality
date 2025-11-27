import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Trash2,
  X,
  PartyPopper,
  HeartHandshake,
  HelpCircle,
  Flame,
  Globe,
} from 'lucide-react-native';
import Toast from 'react-native-root-toast';
import { useThemeStore } from '../../store/themeStore';
import { useCommunityStore } from '../../store/communityStore';
import { POST_CATEGORIES } from '../../constants/community';
import { communityService, type CommunityPost } from '../../services/CommunityService';

type CommunityTab = 'feed' | 'myPosts';

// Icon mapping for categories
const IconMap: Record<string, any> = {
  PartyPopper: PartyPopper,
  HeartHandshake: HeartHandshake,
  HelpCircle: HelpCircle,
  Flame: Flame,
  MessageCircle: MessageCircle,
  Globe: Globe,
};

interface CommunityHubProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export const CommunityHub = ({ onNavigate }: CommunityHubProps) => {
  const colors = useThemeStore((state: any) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const {
    posts,
    loading,
    loadFeed,
    refreshFeed,
    likePost,
    removePost,
  } = useCommunityStore();

  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);

  // Load initial data
  useEffect(() => {
    if (activeTab === 'feed') {
      loadFeed(0, undefined, false);
    } else {
      // Load user's posts
      loadUserPosts();
    }
  }, [activeTab]);

  const loadUserPosts = async () => {
    try {
      setLoadingUserPosts(true);
      const posts = await communityService.getUserPosts();
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading user posts:', error);
      Toast.show('Failed to load your posts', { duration: Toast.durations.SHORT });
    } finally {
      setLoadingUserPosts(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'feed') {
        await refreshFeed();
      } else {
        await loadUserPosts();
      }
    } catch (error) {
      Toast.show('Failed to refresh', { duration: Toast.durations.SHORT });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      // Also update local user posts state if needed
      if (activeTab === 'myPosts') {
        setUserPosts(current =>
          current.map(p =>
            p.id === postId
              ? { ...p, is_liked: !p.is_liked, likes_count: p.likes_count + (p.is_liked ? -1 : 1) }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = (postId: string) => {
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
              await communityService.deletePost(postId);
              removePost(postId);
              setUserPosts(current => current.filter(p => p.id !== postId));
              Toast.show('Post deleted', { duration: Toast.durations.SHORT });
            } catch (error) {
              console.error('Error deleting post:', error);
              Toast.show('Failed to delete post', { duration: Toast.durations.SHORT });
            }
          },
        },
      ]
    );
  };

  const handleShare = async (postId: string) => {
    try {
      const post = activeTab === 'feed'
        ? posts.find(p => p.id === postId)
        : userPosts.find(p => p.id === postId);

      if (!post) return;

      const result = await Share.share({
        message: `Check out this post: ${post.title}\n\n${post.content.substring(0, 100)}...`,
        title: post.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handlePostPress = (postId: string) => {
    const { setSelectedPostId } = useCommunityStore.getState();
    setSelectedPostId(postId);
    onNavigate?.('postDetail');
  };

  const handleCreatePost = () => {
    onNavigate?.('createPost');
  };

  const getCategoryInfo = (categoryId: string) => {
    return POST_CATEGORIES.find(cat => cat.id === categoryId) || POST_CATEGORIES[0];
  };

  const getInitial = (name?: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${month} ${day} • ${time}`;
    }

    return date.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const category = getCategoryInfo(item.category);
    const CategoryIcon = IconMap[category.icon] || X;

    return (
      <TouchableOpacity
        style={[styles.postCard, { backgroundColor: '#1E1E1E' }]}
        onPress={() => handlePostPress(item.id)}
        activeOpacity={0.9}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <View style={[styles.avatar, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.avatarText}>
                {getInitial(item.author?.display_name || item.author?.username)}
              </Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.authorName}>
                {item.author?.display_name || item.author?.username || 'Unknown User'}
              </Text>
              <Text style={styles.postTime}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
          <View style={styles.postHeaderRight}>
            <View style={styles.categoryBadge}>
              <CategoryIcon size={14} color="#FF6B6B" />
              <Text style={styles.categoryBadgeText}>{category.label}</Text>
            </View>
            {activeTab === 'myPosts' && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Trash2 size={18} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <View style={styles.postTitleRow}>
            <CategoryIcon size={16} color="#4CAF50" />
            <Text style={styles.postTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.postText} numberOfLines={3}>
            {item.content}
          </Text>
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Heart
              size={20}
              color={item.is_liked ? '#FF6B6B' : '#B0B0B0'}
              fill={item.is_liked ? '#FF6B6B' : 'none'}
            />
            <Text style={[styles.actionText, item.is_liked && { color: '#FF6B6B' }]}>
              {item.likes_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePostPress(item.id)}
          >
            <MessageCircle size={20} color="#B0B0B0" />
            <Text style={styles.actionText}>{item.comments_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item.id)}
          >
            <Share2 size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const displayPosts = activeTab === 'feed' ? posts : userPosts;
  const isLoading = activeTab === 'feed' ? (loading && !refreshing) : (loadingUserPosts && !refreshing);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'feed' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'feed' && styles.tabTextActive,
          ]}>
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'myPosts' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('myPosts')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'myPosts' && styles.tabTextActive,
          ]}>
            My Posts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={displayPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4CAF50"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'feed' ? 'No posts yet' : 'You haven\'t created any posts yet'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
        activeOpacity={0.9}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1E4620',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B0B0B0',
  },
  tabTextActive: {
    color: '#4CAF50',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  postCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  postContent: {
    marginBottom: 12,
  },
  postTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    flex: 1,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});