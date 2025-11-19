import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import Toast from 'react-native-root-toast';
import { useCommunityStore } from '../../store/communityStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES, COLORS } from '../../utils/theme';
import type { CommunityPost } from '../../services/CommunityService';
import type { Screen } from '../../navigation/AppNavigator';

interface CommunityFeedScreenProps {
  onNavigate?: (screen: Screen) => void;
}

const CATEGORIES = [
  { id: null, label: 'All', emoji: '🌐' },
  { id: 'success', label: 'Success', emoji: '🎉' },
  { id: 'support', label: 'Support', emoji: '💪' },
  { id: 'question', label: 'Question', emoji: '❓' },
  { id: 'motivation', label: 'Motivation', emoji: '🔥' },
  { id: 'general', label: 'General', emoji: '💬' },
];

export const CommunityFeedScreen = ({ onNavigate }: CommunityFeedScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const {
    posts,
    loading,
    error,
    hasMorePosts,
    currentPage,
    selectedCategory,
    loadFeed,
    refreshFeed,
    likePost,
    setSelectedCategory,
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed(0, selectedCategory || null, false);
  }, [selectedCategory]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFeed();
    } catch (err) {
      Toast.show('Failed to refresh feed', { duration: Toast.durations.SHORT });
    } finally {
      setRefreshing(false);
    }
  }, [refreshFeed]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMorePosts) {
      loadFeed(currentPage + 1, selectedCategory || null, true);
    }
  }, [loading, hasMorePosts, currentPage, selectedCategory, loadFeed]);

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
    } catch (err) {
      Toast.show('Failed to like post', { duration: Toast.durations.SHORT });
    }
  };

  const handlePostPress = (postId: string) => {
    if (onNavigate) {
      const { setSelectedPostId } = useCommunityStore.getState();
      setSelectedPostId(postId);
      onNavigate('postDetail' as Screen);
    }
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
    const author = item.author;

    return (
      <TouchableOpacity
        style={[
          styles.postCard,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderColor: isDark ? colors.border : '#E5E7EB',
          },
        ]}
        onPress={() => handlePostPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            {author?.avatar_url ? (
              <Image
                source={{ uri: author.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.avatarText}>
                  {author?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.authorDetails}>
              <Text
                style={[
                  styles.authorName,
                  { color: isDark ? colors.text : '#000' },
                ]}
              >
                {author?.display_name || author?.username || 'Anonymous'}
              </Text>
              <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
                {timeAgo}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(108, 92, 231, 0.2)'
                  : 'rgba(108, 92, 231, 0.1)',
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.primary },
              ]}
            >
              {CATEGORIES.find((c) => c.id === item.category)?.emoji}{' '}
              {item.category}
            </Text>
          </View>
        </View>

        {/* Post Content */}
        <Text
          style={[
            styles.postTitle,
            { color: isDark ? colors.text : '#000' },
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.postContent,
            { color: isDark ? colors.textSecondary : '#666' },
          ]}
          numberOfLines={3}
        >
          {item.content}
        </Text>

        {/* Post Images */}
        {item.images && item.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
          >
            {item.images.slice(0, 3).map((imageUri, index) => (
              <Image
                key={index}
                source={{ uri: imageUri }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
            {item.images.length > 3 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{item.images.length - 3}</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionIcon, { color: item.is_liked ? colors.error : colors.textSecondary }]}>
              {item.is_liked ? '❤️' : '🤍'}
            </Text>
            <Text
              style={[
                styles.actionCount,
                { color: isDark ? colors.textSecondary : '#666' },
              ]}
            >
              {item.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePostPress(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>
              💬
            </Text>
            <Text
              style={[
                styles.actionCount,
                { color: isDark ? colors.textSecondary : '#666' },
              ]}
            >
              {item.comments_count}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>
              👁️
            </Text>
            <Text
              style={[
                styles.actionCount,
                { color: isDark ? colors.textSecondary : '#666' },
              ]}
            >
              {item.views_count}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyEmoji, { color: colors.textSecondary }]}>
          📭
        </Text>
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? colors.textSecondary : '#666' },
          ]}
        >
          No posts yet. Be the first to share!
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : '#F5F5F5' },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Connect & Support Each Other</Text>
      </LinearGradient>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id || 'all'}
              style={[
                styles.categoryButton,
                isSelected && {
                  backgroundColor: colors.primary,
                },
                !isSelected && {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color: isSelected
                      ? '#FFF'
                      : isDark
                      ? colors.text
                      : '#000',
                  },
                ]}
              >
                {category.emoji} {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Post Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => onNavigate?.('createPost' as Screen)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradientPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.createButtonGradient}
        >
          <Text style={styles.createButtonText}>+ Create Post</Text>
        </LinearGradient>
      </TouchableOpacity>

      {error && (
        <Toast
          visible={!!error}
          position={Toast.positions.BOTTOM}
          shadow={true}
          animation={true}
          hideOnPress={true}
          duration={Toast.durations.LONG}
        >
          {error}
        </Toast>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  categoriesContainer: {
    maxHeight: 60,
    backgroundColor: 'transparent',
  },
  categoriesContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonText: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  postCard: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
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
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    marginBottom: 8,
  },
  postContent: {
    fontSize: SIZES.body,
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  postImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  moreImagesOverlay: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#FFF',
    fontSize: SIZES.h4,
    fontWeight: '700',
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
    fontSize: 20,
    marginRight: 6,
  },
  actionCount: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: SIZES.body,
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    right: SIZES.padding,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '700',
  },
});

