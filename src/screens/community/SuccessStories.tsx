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
import { communityData } from './CommunityHub';

const { width } = Dimensions.get('window');

interface SuccessStoriesProps {
  onNavigate?: (screen: string) => void;
}

export const SuccessStories = ({ onNavigate }: SuccessStoriesProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const stories = communityData.stories;

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
          <Text style={[styles.title, { color: textColor }]}>Success Stories</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Real journeys from our community
          </Text>
        </View>

        {stories.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={[styles.storyCard, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={story.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientHeader}
            >
              <Text style={styles.emoji}>{story.emoji}</Text>
              <Text style={styles.daysClean}>Day {story.daysClean}</Text>
            </LinearGradient>
            
            <View style={styles.content}>
              <Text style={[styles.storyTitle, { color: textColor }]}>
                {story.title}
              </Text>
              <Text style={[styles.storyText, { color: subText }]} numberOfLines={4}>
                {story.story}
              </Text>
              
              <View style={styles.meta}>
                <View style={styles.metaLeft}>
                  <Text style={[styles.author, { color: textColor }]}>
                    {story.author}
                  </Text>
                  <Text style={[styles.time, { color: subText }]}>
                    {story.timeAgo}
                  </Text>
                </View>
                <View style={styles.metaRight}>
                  <Text style={[styles.likes, { color: colors.primary }]}>
                    ❤️ {story.likes}
                  </Text>
                  <Text style={[styles.comments, { color: subText }]}>
                    💬 {story.comments}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={[styles.ctaCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.ctaTitle, { color: textColor }]}>
            Share Your Story
          </Text>
          <Text style={[styles.ctaText, { color: subText }]}>
            Your journey can inspire others. Share your success story with the community!
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => onNavigate?.('community')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradientPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButtonGradient}
            >
              <Text style={styles.ctaButtonText}>Share Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  storyCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientHeader: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  daysClean: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    padding: 20,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  storyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flex: 1,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  metaRight: {
    flexDirection: 'row',
    gap: 16,
  },
  likes: {
    fontSize: 14,
    fontWeight: '600',
  },
  comments: {
    fontSize: 14,
  },
  ctaCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

