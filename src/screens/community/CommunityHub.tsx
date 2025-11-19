import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-root-toast';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { usePremium } from '../../hooks/usePremium';
import { useCommunityStore } from '../../store/communityStore';
import { communityService } from '../../services/CommunityService';
import { POST_CATEGORIES, formatTimeAgo, formatNumber } from '../../constants/community';
import type { CommunityPost, SuccessStory } from '../../services/CommunityService';

const { width } = Dimensions.get('window');

type CommunityTab = 'feed' | 'stories';

interface CommunityHubProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export const CommunityHub = ({ onNavigate }: CommunityHubProps) => {
  const colors = useThemeStore((state: any) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  // PREMIUM LOGIC COMMENTED OUT - All features are now free
  // const { isPremium } = usePremium();
  const isPremium = true; // Always true - all features are free

  const {
    posts,
    successStories,
    loading,
    selectedCategory,
    loadFeed,
    refreshFeed,
    likePost,
    setSelectedCategory,
    loadSuccessStories,
    refreshSuccessStories,
  } = useCommunityStore();

  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Load initial data
  useEffect(() => {
    if (activeTab === 'feed') {
      loadFeed(0, selectedCategory || undefined, false);
    } else if (activeTab === 'stories') {
      loadSuccessStories(0);
    }
  }, [activeTab, selectedCategory]);

  // Animate tab changes
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'feed') {
        await refreshFeed();
      } else if (activeTab === 'stories') {
        await refreshSuccessStories();
      }
      Toast.show('Refreshed!', { duration: Toast.durations.SHORT });
    } catch (error) {
      Toast.show('Failed to refresh', { duration: Toast.durations.SHORT });
    } finally {
      setRefreshing(false);
    }
  };

  const handlePostLike = async (postId: string) => {
    try {
      await likePost(postId);
    } catch (error) {
      Toast.show('Failed to like post', { duration: Toast.durations.SHORT });
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handlePostPress = (postId: string) => {
    const { setSelectedPostId } = useCommunityStore.getState();
    setSelectedPostId(postId);
    onNavigate?.('postDetail');
  };

  const handleCreatePost = () => {
    onNavigate?.('createPost');
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';
  const inputBg = isDark ? 'rgba(40,40,40,0.9)' : 'rgba(245,245,245,0.95)';

  const renderFeed = () => (
    <Animated.ScrollView
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
      >
        <TouchableOpacity
          key="all"
          style={[
            styles.categoryChip,
            { backgroundColor: selectedCategory === null ? colors.primary : cardBg }
          ]}
          onPress={() => handleCategorySelect(null)}
        >
          <Text style={[
            styles.categoryText,
            { color: selectedCategory === null ? '#FFF' : textColor }
          ]}>
            🌐 All
          </Text>
        </TouchableOpacity>

        {POST_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              { backgroundColor: selectedCategory === category.id ? colors.primary : cardBg }
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category.id ? '#FFF' : textColor }
            ]}>
              {category.emoji} {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading State */}
      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: subText }]}>Loading posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={[styles.emptyText, { color: textColor }]}>No posts yet</Text>
          <Text style={[styles.emptySubtext, { color: subText }]}>
            Be the first to share something!
          </Text>
          <TouchableOpacity 
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={handleCreatePost}
          >
            <Text style={styles.emptyButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Posts */}
          {posts.map((post) => {
            const author = post.author;
            const timeAgo = formatTimeAgo(post.created_at);
            const category = POST_CATEGORIES.find(c => c.id === post.category);

            return (
              <TouchableOpacity
                key={post.id}
                style={[styles.postCard, { backgroundColor: cardBg }]}
                onPress={() => handlePostPress(post.id)}
                activeOpacity={0.7}
              >
                {/* User Info */}
                <View style={styles.postHeader}>
                  {author?.avatar_url ? (
                    <Image 
                      source={{ uri: author.avatar_url }} 
                      style={[styles.avatar, { backgroundColor: colors.primary }]}
                    />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>
                        {author?.username?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.postMeta}>
                    <View style={styles.authorRow}>
                      <Text style={[styles.authorName, { color: textColor }]}>
                        {author?.display_name || author?.username || 'Anonymous'}
                      </Text>
                      {author?.level && author.level >= 10 && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.postTime, { color: subText }]}>
                      {timeAgo} • {category?.emoji} {category?.label || post.category}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={[styles.postTitle, { color: textColor }]}>
                  {post.title}
                </Text>
                <Text 
                  style={[styles.postContent, { color: subText }]}
                  numberOfLines={3}
                >
                  {post.content}
                </Text>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.postImagesScroll}
                  >
                    {post.images.slice(0, 3).map((imageUrl, index) => (
                      <Image
                        key={index}
                        source={{ uri: imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    ))}
                    {post.images.length > 3 && (
                      <View style={styles.moreImagesOverlay}>
                        <Text style={styles.moreImagesText}>+{post.images.length - 3}</Text>
                      </View>
                    )}
                  </ScrollView>
                )}

                {/* Stats & Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handlePostLike(post.id);
                    }}
                  >
                    <Text style={styles.actionIcon}>
                      {post.is_liked ? '❤️' : '🤍'}
                    </Text>
                    <Text style={[styles.actionText, { color: subText }]}>
                      {formatNumber(post.likes_count)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={[styles.actionText, { color: subText }]}>
                      {formatNumber(post.comments_count)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>👁️</Text>
                    <Text style={[styles.actionText, { color: subText }]}>
                      {formatNumber(post.views_count)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </Animated.ScrollView>
  );

  const renderStories = () => (
    <Animated.ScrollView
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {loading && successStories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: subText }]}>Loading stories...</Text>
        </View>
      ) : successStories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>⭐</Text>
          <Text style={[styles.emptyText, { color: textColor }]}>No success stories yet</Text>
          <Text style={[styles.emptySubtext, { color: subText }]}>
            Share your journey and inspire others!
          </Text>
        </View>
      ) : (
        <>
          {successStories.map((story) => {
            const author = story.author;
            const timeAgo = formatTimeAgo(story.created_at);
            const gradients = [
              ['#667eea', '#764ba2'],
              ['#f093fb', '#f5576c'],
              ['#4facfe', '#00f2fe'],
              ['#fa709a', '#fee140'],
              ['#30cfd0', '#330867'],
            ];
            const gradient = gradients[Math.floor(Math.random() * gradients.length)];

            return (
              <View key={story.id} style={[styles.storyCard, { backgroundColor: cardBg }]}>
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.storyBanner}
                >
                  <Text style={styles.storyEmoji}>🏆</Text>
                  <Text style={styles.storyDays}>{story.days_clean} Days</Text>
                </LinearGradient>

                <View style={styles.storyContent}>
                  <View style={styles.storyHeader}>
                    {author?.avatar_url ? (
                      <Image 
                        source={{ uri: author.avatar_url }} 
                        style={[styles.storyAvatar, { backgroundColor: colors.primary }]}
                      />
                    ) : (
                      <View style={[styles.storyAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>
                          {author?.username?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={[styles.storyAuthor, { color: textColor }]}>
                        {author?.display_name || author?.username || 'Anonymous'}
                      </Text>
                      <Text style={[styles.storyTime, { color: subText }]}>
                        {timeAgo}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.storyTitle, { color: textColor }]}>
                    {story.title}
                  </Text>
                  <Text 
                    style={[styles.storyText, { color: subText }]}
                    numberOfLines={4}
                  >
                    {story.story}
                  </Text>

                  {/* Before/After Images */}
                  {(story.before_image_url || story.after_image_url) && (
                    <View style={styles.beforeAfterContainer}>
                      {story.before_image_url && (
                        <View style={styles.beforeAfterImage}>
                          <Text style={[styles.beforeAfterLabel, { color: subText }]}>Before</Text>
                          <Image 
                            source={{ uri: story.before_image_url }} 
                            style={styles.beforeAfterImg}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      {story.after_image_url && (
                        <View style={styles.beforeAfterImage}>
                          <Text style={[styles.beforeAfterLabel, { color: subText }]}>After</Text>
                          <Image 
                            source={{ uri: story.after_image_url }} 
                            style={styles.beforeAfterImg}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.storyActions}>
                    <TouchableOpacity style={styles.storyActionButton}>
                      <Text style={styles.actionIcon}>❤️</Text>
                      <Text style={[styles.actionText, { color: subText }]}>
                        {formatNumber(story.likes_count)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.storyActionButton}>
                      <Text style={styles.actionIcon}>👁️</Text>
                      <Text style={[styles.actionText, { color: subText }]}>
                        {formatNumber(story.views_count)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.storyActionButton}>
                      <Text style={styles.actionIcon}>🙌</Text>
                      <Text style={[styles.actionText, { color: subText }]}>
                        Inspire
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}
    </Animated.ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Community</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => onNavigate?.('notifications')}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search community..."
          placeholderTextColor={subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'feed', label: 'Feed', icon: '📰' },
          { id: 'stories', label: 'Stories', icon: '⭐' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
              { borderBottomColor: activeTab === tab.id ? colors.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab(tab.id as CommunityTab)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? textColor : subText }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'feed' && renderFeed()}
      {activeTab === 'stories' && renderStories()}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#6C5CE7', '#9C27B0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>✏️</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    gap: 6,
  },
  activeTab: {},
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    paddingBottom: 100,
  },
  categoriesScroll: {
    marginBottom: 16,
    paddingLeft: SIZES.padding,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
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
    fontWeight: '700',
    color: '#FFF',
  },
  postMeta: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  postTime: {
    fontSize: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImagesScroll: {
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
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
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  storyCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  storyBanner: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  storyDays: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  storyContent: {
    padding: 16,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  storyAuthor: {
    fontSize: 14,
    fontWeight: '700',
  },
  storyTime: {
    fontSize: 11,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  storyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  beforeAfterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  beforeAfterImage: {
    flex: 1,
  },
  beforeAfterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  beforeAfterImg: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  storyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
});