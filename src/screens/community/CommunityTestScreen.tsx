/**
 * Community System Test Screen
 * Use this screen to test all community features
 * Navigate to this screen to run tests
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-root-toast';
import { communityService } from '../../services/CommunityService';
import { supabase } from '../../config/supabase';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

export const CommunityTestScreen = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string, success: boolean = true) => {
    const emoji = success ? '✅' : '❌';
    setTestResults((prev) => [...prev, `${emoji} ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testConnection = async () => {
    setLoading(true);
    clearResults();
    addResult('Testing Supabase connection...');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      addResult('Supabase connection successful!');
    } catch (error: any) {
      addResult(`Connection failed: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    clearResults();
    addResult('Checking authentication...');

    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user) {
        addResult('No user authenticated. Please sign in first.', false);
        Alert.alert(
          'Not Authenticated',
          'Please sign in to test community features. You can use the auth screens to sign in.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      addResult(`User authenticated: ${user.email}`);
      addResult(`User ID: ${user.id}`);
    } catch (error: any) {
      addResult(`Auth check failed: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    setLoading(true);
    clearResults();
    addResult('Testing user profile...');

    try {
      let profile = await communityService.getCurrentUserProfile();

      if (!profile) {
        addResult('No profile found. Creating one...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const username = user.user_metadata?.username || `user_${user.id.slice(0, 8)}`;
        profile = await communityService.upsertUserProfile({
          username,
          display_name: user.user_metadata?.display_name || username,
          is_profile_public: false,
          show_streak: true,
          show_before_after: false,
          show_success_stories: true,
        });
        addResult('Profile created successfully!');
      } else {
        addResult(`Profile found: ${profile.username}`);
        addResult(`Display Name: ${profile.display_name || 'N/A'}`);
        addResult(`Total Posts: ${profile.total_posts}`);
        addResult(`Days Clean: ${profile.total_days_clean}`);
      }
    } catch (error: any) {
      addResult(`Profile test failed: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testCreatePost = async () => {
    setLoading(true);
    clearResults();
    addResult('Testing post creation...');

    try {
      const testPost = await communityService.createPost({
        title: 'Test Post - Community System Working! 🎉',
        content: 'This is a test post to verify the community system is working correctly. If you see this, everything is set up properly!',
        category: 'general',
      });

      addResult('Post created successfully!');
      addResult(`Post ID: ${testPost.id}`);
      addResult(`Title: ${testPost.title}`);
      addResult(`Category: ${testPost.category}`);

      Toast.show('Test post created!', { duration: Toast.durations.SHORT });
    } catch (error: any) {
      addResult(`Post creation failed: ${error.message}`, false);
      Toast.show(`Error: ${error.message}`, { duration: Toast.durations.LONG });
    } finally {
      setLoading(false);
    }
  };

  const testFeed = async () => {
    setLoading(true);
    clearResults();
    addResult('Testing community feed...');

    try {
      const posts = await communityService.getCommunityFeed({ page: 0, limit: 10 });
      addResult(`Loaded ${posts.length} posts from feed`);

      if (posts.length > 0) {
        addResult(`First post: ${posts[0].title}`);
        addResult(`Likes: ${posts[0].likes_count}, Comments: ${posts[0].comments_count}`);
      }
    } catch (error: any) {
      addResult(`Feed test failed: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    addResult('Running all tests...');
    addResult('');

    await testConnection();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testAuth();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testProfile();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testFeed();
    await new Promise((resolve) => setTimeout(resolve, 500));

    addResult('');
    addResult('All tests completed!');
    setLoading(false);
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
        <Text style={styles.headerTitle}>Community System Test</Text>
        <Text style={styles.headerSubtitle}>Test all community features</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Test Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.primary }]}
            onPress={runAllTests}
            disabled={loading}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={colors.gradientPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.testButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.testButtonText}>Run All Tests</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
            ]}
            onPress={testConnection}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              Test Connection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
            ]}
            onPress={testAuth}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              Test Auth
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
            ]}
            onPress={testProfile}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              Test Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
            ]}
            onPress={testFeed}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              Test Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
            ]}
            onPress={testCreatePost}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              Create Test Post
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {testResults.length > 0 && (
          <View
            style={[
              styles.resultsContainer,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
            ]}
          >
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, { color: isDark ? colors.text : '#000' }]}>
                Test Results
              </Text>
              <TouchableOpacity onPress={clearResults} activeOpacity={0.7}>
                <Text style={[styles.clearButton, { color: colors.primary }]}>Clear</Text>
              </TouchableOpacity>
            </View>
            {testResults.map((result, index) => (
              <Text
                key={index}
                style={[
                  styles.resultText,
                  { color: isDark ? colors.textSecondary : '#666' },
                ]}
              >
                {result}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: SIZES.marginLarge,
  },
  testButton: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: 8,
  },
  testButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: '#FFF',
  },
  resultsContainer: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginTop: SIZES.margin,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
  },
  clearButton: {
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  resultText: {
    fontSize: SIZES.body,
    marginBottom: 8,
    lineHeight: 20,
  },
});

