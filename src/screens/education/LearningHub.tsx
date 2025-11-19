import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  icon: string;
  color: string[];
  description: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Understanding Addiction Science',
    category: 'Science',
    readTime: '5 min',
    icon: '🧠',
    color: ['#667EEA', '#764BA2'],
    description: 'Learn how addiction affects your brain and body',
  },
  {
    id: '2',
    title: 'The 21-Day Habit Rule',
    category: 'Recovery',
    readTime: '3 min',
    icon: '📅',
    color: ['#00E676', '#00C853'],
    description: 'Why 21 days matters in breaking bad habits',
  },
  {
    id: '3',
    title: 'Mindfulness Techniques',
    category: 'Wellness',
    readTime: '7 min',
    icon: '🧘',
    color: ['#9C27B0', '#7B1FA2'],
    description: 'Practice mindfulness to overcome urges',
  },
  {
    id: '4',
    title: 'Building Healthy Routines',
    category: 'Lifestyle',
    readTime: '4 min',
    icon: '💪',
    color: ['#FF9800', '#FF5722'],
    description: 'Replace bad habits with positive ones',
  },
];

export const LearningHub = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const categories = Array.from(new Set(ARTICLES.map(a => a.category)));

  const filteredArticles = selectedCategory
    ? ARTICLES.filter(a => a.category === selectedCategory)
    : ARTICLES;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Learning Hub</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Educational content to support your journey
          </Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              { backgroundColor: selectedCategory === null ? colors.primary : cardBg }
            ]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === null ? '#FFF' : textColor }
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === category ? colors.primary : cardBg }
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === category ? '#FFF' : textColor }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Articles */}
        {filteredArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={[styles.articleCard, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.articleHeader}>
              <LinearGradient
                colors={article.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.articleIcon}
              >
                <Text style={styles.articleIconText}>{article.icon}</Text>
              </LinearGradient>
              <View style={styles.articleInfo}>
                <View style={styles.articleMeta}>
                  <Text style={[styles.articleCategory, { color: article.color[0] }]}>
                    {article.category}
                  </Text>
                  <Text style={[styles.articleTime, { color: subText }]}>
                    {article.readTime}
                  </Text>
                </View>
                <Text style={[styles.articleTitle, { color: textColor }]}>
                  {article.title}
                </Text>
                <Text style={[styles.articleDesc, { color: subText }]}>
                  {article.description}
                </Text>
              </View>
            </View>
            <View style={styles.articleFooter}>
              <Text style={[styles.readMore, { color: colors.primary }]}>
                Read Article →
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
  categories: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: SIZES.padding,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  articleCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  articleHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  articleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleIconText: {
    fontSize: 28,
  },
  articleInfo: {
    flex: 1,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  articleCategory: {
    fontSize: 12,
    fontWeight: '700',
  },
  articleTime: {
    fontSize: 12,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  articleDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  articleFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
  },
});

