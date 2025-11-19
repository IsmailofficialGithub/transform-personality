import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-root-toast';
import { communityService } from '../../services/CommunityService';
import { useCommunityStore } from '../../store/communityStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import type { UserProfile, CommunityPost } from '../../services/CommunityService';
import type { Screen } from '../../navigation/AppNavigator';

interface UserProfileScreenProps {
  profileId?: string; // If not provided, shows current user's profile
  onNavigate?: (screen: Screen) => void;
  onBack?: () => void;
}

export const UserProfileScreen = ({ profileId, onNavigate, onBack }: UserProfileScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { currentProfile, loadCurrentProfile } = useCommunityStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isOwnProfile = !profileId || profile?.id === currentProfile?.id;

  useEffect(() => {
    loadProfile();
    if (isOwnProfile) {
      loadCurrentProfile();
    }
  }, [profileId]);

  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.display_name || '');
      setEditBio(profile.bio || '');
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = profileId
        ? await communityService.getUserProfile(profileId)
        : await communityService.getCurrentUserProfile();
      setProfile(profileData);

      if (profileData && !isOwnProfile) {
        const following = await communityService.isFollowing(profileData.id);
        setIsFollowing(following);
      }

      // Load user's posts
      if (profileData) {
        const userPosts = await communityService.getCommunityFeed({ page: 0, limit: 20 });
        setPosts(userPosts.filter((p) => p.author_id === profileData.id));
      }
    } catch (error: any) {
      Toast.show(error.message || 'Failed to load profile', { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        const url = await communityService.uploadAvatar(result.assets[0].uri);
        setProfile((p) => (p ? { ...p, avatar_url: url } : null));
        Toast.show('Avatar updated!', { duration: Toast.durations.SHORT });
      }
    } catch (error: any) {
      Toast.show(error.message || 'Failed to upload avatar', { duration: Toast.durations.SHORT });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const updated = await communityService.upsertUserProfile({
        display_name: editDisplayName.trim() || null,
        bio: editBio.trim() || null,
      });
      setProfile(updated);
      setIsEditing(false);
      Toast.show('Profile updated!', { duration: Toast.durations.SHORT });
    } catch (error: any) {
      Toast.show(error.message || 'Failed to update profile', { duration: Toast.durations.SHORT });
    }
  };

  const handleToggleFollow = async () => {
    if (!profile) return;

    try {
      const newFollowing = await communityService.toggleFollow(profile.id);
      setIsFollowing(newFollowing);
      Toast.show(newFollowing ? 'Following!' : 'Unfollowed', { duration: Toast.durations.SHORT });
    } catch (error: any) {
      Toast.show(error.message || 'Failed to follow/unfollow', { duration: Toast.durations.SHORT });
    }
  };

  const handleToggleSetting = async (setting: keyof UserProfile, value: boolean) => {
    if (!profile) return;

    try {
      await communityService.updateProfileSettings({ [setting]: value });
      setProfile((p) => (p ? { ...p, [setting]: value } : null));
    } catch (error: any) {
      Toast.show('Failed to update setting', { duration: Toast.durations.SHORT });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Profile not found</Text>
      </View>
    );
  }

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
        <TouchableOpacity onPress={onBack || (() => onNavigate?.('community' as Screen))} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isOwnProfile ? 'My Profile' : 'Profile'}</Text>
        {isOwnProfile && (
          <TouchableOpacity
            onPress={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        )}
        {!isOwnProfile && <View style={styles.headerSpacer} />}
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={isOwnProfile && isEditing ? handleUploadAvatar : undefined}
            disabled={!isOwnProfile || !isEditing || uploadingAvatar}
            activeOpacity={isOwnProfile && isEditing ? 0.7 : 1}
          >
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{profile.username[0]?.toUpperCase() || '?'}</Text>
              </View>
            )}
            {isOwnProfile && isEditing && (
              <View style={styles.avatarEditOverlay}>
                {uploadingAvatar ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.avatarEditText}>📷</Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <>
              <TextInput
                style={[styles.editInput, { backgroundColor: isDark ? colors.surface : '#FFFFFF', color: isDark ? colors.text : '#000' }]}
                value={editDisplayName}
                onChangeText={setEditDisplayName}
                placeholder="Display name"
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.editTextArea, { backgroundColor: isDark ? colors.surface : '#FFFFFF', color: isDark ? colors.text : '#000' }]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Bio"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </>
          ) : (
            <>
              <Text style={[styles.displayName, { color: isDark ? colors.text : '#000' }]}>
                {profile.display_name || profile.username}
              </Text>
              <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username}</Text>
              {profile.bio && (
                <Text style={[styles.bio, { color: isDark ? colors.textSecondary : '#666' }]}>{profile.bio}</Text>
              )}
            </>
          )}

          {!isOwnProfile && (
            <TouchableOpacity
              style={[styles.followButton, { backgroundColor: isFollowing ? colors.surface : colors.primary }]}
              onPress={handleToggleFollow}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={isFollowing ? ['transparent', 'transparent'] : colors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.followButtonGradient}
              >
                <Text style={styles.followButtonText}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{profile.total_days_clean}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Days Clean</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{profile.current_streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{profile.total_posts}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
          </View>
        </View>

        {/* Settings (Own Profile Only) */}
        {isOwnProfile && (
          <View style={[styles.settingsContainer, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <Text style={[styles.settingsTitle, { color: isDark ? colors.text : '#000' }]}>Privacy Settings</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.text : '#000' }]}>Public Profile</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Allow others to view your profile
                </Text>
              </View>
              <Switch
                value={profile.is_profile_public}
                onValueChange={(value) => handleToggleSetting('is_profile_public', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.text : '#000' }]}>Show Streak</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Display your current streak publicly
                </Text>
              </View>
              <Switch
                value={profile.show_streak}
                onValueChange={(value) => handleToggleSetting('show_streak', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        )}

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          <Text style={[styles.postsTitle, { color: isDark ? colors.text : '#000' }]}>Posts ({posts.length})</Text>
          {posts.length > 0 ? (
            <View style={styles.postsGrid}>
              {posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.postThumbnail, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
                  onPress={() => onNavigate?.('postDetail' as Screen)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.postThumbnailTitle, { color: isDark ? colors.text : '#000' }]} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <View style={styles.postThumbnailStats}>
                    <Text style={[styles.postThumbnailStat, { color: colors.textSecondary }]}>
                      ❤️ {post.likes_count}
                    </Text>
                    <Text style={[styles.postThumbnailStat, { color: colors.textSecondary }]}>
                      💬 {post.comments_count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noPosts}>
              <Text style={[styles.noPostsText, { color: colors.textSecondary }]}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.body,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SIZES.marginLarge,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 36,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditText: {
    fontSize: 24,
  },
  displayName: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: SIZES.body,
    marginBottom: 8,
    textAlign: 'center',
  },
  bio: {
    fontSize: SIZES.body,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: SIZES.padding,
  },
  editInput: {
    width: '100%',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.h4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editTextArea: {
    width: '100%',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.body,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 80,
  },
  followButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 8,
  },
  followButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.marginLarge,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SIZES.padding,
  },
  statValue: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.tiny,
    textTransform: 'uppercase',
  },
  settingsContainer: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.marginLarge,
  },
  settingsTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: SIZES.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: SIZES.tiny,
  },
  postsSection: {
    marginTop: SIZES.margin,
  },
  postsTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    marginBottom: 16,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postThumbnail: {
    width: '48%',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  postThumbnailTitle: {
    fontSize: SIZES.small,
    fontWeight: '600',
    marginBottom: 8,
  },
  postThumbnailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postThumbnailStat: {
    fontSize: SIZES.tiny,
  },
  noPosts: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: SIZES.body,
  },
});

