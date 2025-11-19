import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import Toast from 'react-native-root-toast';
import { useCommunityStore } from '../../store/communityStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import type { SuccessStory } from '../../services/CommunityService';
import type { Screen } from '../../navigation/AppNavigator';

interface SuccessStoriesScreenProps {
  onNavigate?: (screen: Screen) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.padding * 3) / 2;

export const SuccessStoriesScreen = ({ onNavigate }: SuccessStoriesScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { successStories, loading, loadSuccessStories, refreshSuccessStories } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadSuccessStories(0);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSuccessStories();
      setCurrentPage(0);
    } catch (err) {
      Toast.show('Failed to refresh stories', { duration: Toast.durations.SHORT });
    } finally {
      setRefreshing(false);
    }
  }, [refreshSuccessStories]);

  const handleLoadMore = useCallback(() => {
    if (!loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadSuccessStories(nextPage);
    }
  }, [loading, currentPage, loadSuccessStories]);

  const renderStory = ({ item }: { item: SuccessStory }) => {
    const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
    const author = item.author;

    return (
      <TouchableOpacity
        style={[
          styles.storyCard,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderColor: isDark ? colors.border : '#E5E7EB',
          },
        ]}
        activeOpacity={0.7}
      >
        {/* Before/After Images */}
        {(item.before_image_url || item.after_image_url) && (
          <View style={styles.imagesContainer}>
            {item.before_image_url && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.before_image_url }} style={styles.storyImage} resizeMode="cover" />
                <View style={styles.imageLabel}>
                  <Text style={styles.imageLabelText}>Before</Text>
                </View>
              </View>
            )}
            {item.after_image_url && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.after_image_url }} style={styles.storyImage} resizeMode="cover" />
                <View style={styles.imageLabel}>
                  <Text style={styles.imageLabelText}>After</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Story Content */}
        <View style={styles.storyContent}>
          <View style={styles.storyHeader}>
            <View style={styles.authorInfo}>
              {author?.avatar_url ? (
                <Image source={{ uri: author.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{author?.username?.[0]?.toUpperCase() || '?'}</Text>
                </View>
              )}
              <View style={styles.authorDetails}>
                <Text style={[styles.authorName, { color: isDark ? colors.text : '#000' }]} numberOfLines={1}>
                  {author?.display_name || author?.username || 'Anonymous'}
                </Text>
                <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>{timeAgo}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.daysBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.daysText, { color: colors.primary }]}>
              🎉 {item.days_clean} Days Clean
            </Text>
          </View>

          <Text style={[styles.storyTitle, { color: isDark ? colors.text : '#000' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.storyText, { color: isDark ? colors.textSecondary : '#666' }]} numberOfLines={3}>
            {item.story}
          </Text>

          <View style={styles.storyStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statIcon, { color: item.is_liked ? colors.error : colors.textSecondary }]}>
                {item.is_liked ? '❤️' : '🤍'}
              </Text>
              <Text style={[styles.statCount, { color: isDark ? colors.textSecondary : '#666' }]}>
                {item.likes_count}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statIcon, { color: colors.textSecondary }]}>👁️</Text>
              <Text style={[styles.statCount, { color: isDark ? colors.textSecondary : '#666' }]}>
                {item.views_count}
              </Text>
            </View>
            {item.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
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
        <Text style={[styles.emptyEmoji, { color: colors.textSecondary }]}>🌟</Text>
        <Text style={[styles.emptyText, { color: isDark ? colors.textSecondary : '#666' }]}>
          No success stories yet. Share your journey!
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Success Stories</Text>
        <Text style={styles.headerSubtitle}>Inspiring transformations</Text>
      </LinearGradient>

      {/* Stories Grid */}
      <FlatList
        data={successStories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id}
        numColumns={2}
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
        columnWrapperStyle={styles.columnWrapper}
      />

      {/* Create Story Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => onNavigate?.('createStory' as Screen)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradientPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.createButtonGradient}
        >
          <Text style={styles.createButtonText}>+ Share Story</Text>
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
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  storyCard: {
    width: CARD_WIDTH,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagesContainer: {
    flexDirection: 'row',
    height: 120,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  imageLabelText: {
    color: '#FFF',
    fontSize: SIZES.tiny,
    fontWeight: '700',
    textAlign: 'center',
  },
  storyContent: {
    padding: SIZES.padding,
  },
  storyHeader: {
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: SIZES.tiny - 2,
  },
  daysBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  daysText: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
  },
  storyTitle: {
    fontSize: SIZES.small,
    fontWeight: '700',
    marginBottom: 6,
  },
  storyText: {
    fontSize: SIZES.tiny,
    lineHeight: 16,
    marginBottom: 8,
  },
  storyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statCount: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#00E676',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#FFF',
    fontSize: SIZES.tiny - 2,
    fontWeight: '700',
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

