import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

const { width } = Dimensions.get('window');

interface Video {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnail: string;
  views: number;
}

const VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Understanding Your Brain on Addiction',
    duration: '12:34',
    category: 'Science',
    thumbnail: '🧠',
    views: 1250,
  },
  {
    id: '2',
    title: '5-Minute Morning Meditation',
    duration: '5:00',
    category: 'Meditation',
    thumbnail: '🧘',
    views: 890,
  },
  {
    id: '3',
    title: 'Success Story: 90 Days Clean',
    duration: '8:45',
    category: 'Stories',
    thumbnail: '🎉',
    views: 2100,
  },
];

export const VideoLibrary = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Video Library</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Educational videos and guided content
          </Text>
        </View>

        {VIDEOS.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={[styles.videoCard, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.videoThumbnail}>
              <Text style={styles.thumbnailEmoji}>{video.thumbnail}</Text>
              <View style={styles.playOverlay}>
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={[styles.videoCategory, { color: colors.primary }]}>
                {video.category}
              </Text>
              <Text style={[styles.videoTitle, { color: textColor }]}>
                {video.title}
              </Text>
              <Text style={[styles.videoViews, { color: subText }]}>
                {video.views.toLocaleString()} views
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  videoCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailEmoji: {
    fontSize: 80,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#FFF',
    marginLeft: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  videoInfo: {
    padding: 16,
  },
  videoCategory: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  videoViews: {
    fontSize: 12,
  },
});

