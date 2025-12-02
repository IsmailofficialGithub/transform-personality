import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../stores/useThemeStore';
import { supabase } from '../../services/supabase';
import Constants from 'expo-constants';
import {
  User,
  Camera,
  Edit3,
  Lock,
  RefreshCw,
  LogOut,
  Moon,
  Sun,
  Settings,
  CheckCircle,
} from 'lucide-react-native';

export default function Account() {
  const theme = useTheme();
  const { user, profile, fetchProfile, signOut } = useAuthStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  // Profile edit fields
  const [username, setUsername] = useState(profile?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const pickImage = async () => {
    // For now, we'll use a placeholder approach
    // In production, you'll need to install expo-image-picker:
    // npx expo install expo-image-picker
    // Then uncomment the code below and remove this placeholder
    
    Alert.alert(
      'Avatar Upload',
      'Avatar upload feature coming soon! For now, you can update your profile picture URL manually.',
      [
        {
          text: 'Use Placeholder',
          onPress: async () => {
            const placeholderUrl = `https://placehold.co/200x200?text=${encodeURIComponent(username || 'User')}`;
            await uploadAvatar(placeholderUrl);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );

    // Uncomment when expo-image-picker is installed:
    /*
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to change your avatar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
    */
  };

  const uploadAvatar = async (imageUriOrUrl: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // For now, we'll use the provided URL directly
      // In production with expo-image-picker, you'd upload to Supabase Storage first
      // Example: const { data, error: uploadError } = await supabase.storage
      //   .from('avatars')
      //   .upload(`${user.id}/${Date.now()}.jpg`, imageFile);
      
      const avatarUrl = imageUriOrUrl.startsWith('http') 
        ? imageUriOrUrl 
        : `https://placehold.co/200x200?text=${encodeURIComponent(username || 'User')}`;
      
      // Update profile with new avatar URL
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile();
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: username.trim() || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangingPassword(false);
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    try {
      // Check app version
      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      
      // In a real app, you'd check against an API or app store
      // For now, we'll just show current version
      setTimeout(() => {
        setCheckingUpdate(false);
        Alert.alert(
          'App Version',
          `Current version: ${currentVersion}\n\nYou're using the latest version!`,
        );
      }, 1000);
    } catch (error: any) {
      setCheckingUpdate(false);
      Alert.alert('Error', error.message || 'Failed to check for updates');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return <Sun size={20} color={theme.text.primary} />;
    if (themeMode === 'dark') return <Moon size={20} color={theme.text.primary} />;
    return <Settings size={20} color={theme.text.primary} />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'light') return 'Light Mode';
    if (themeMode === 'dark') return 'Dark Mode';
    return 'Auto (System)';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
      {/* Header */}
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <User size={28} color={theme.primary} />
          <Text style={{ color: theme.text.primary }} className="text-2xl font-bold ml-2">
            Account
          </Text>
        </View>
        <Text style={{ color: theme.text.secondary }} className="text-sm">
          Manage your profile and settings
        </Text>
      </View>

      {/* Avatar Section */}
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-6 rounded-xl border mb-4 items-center"
      >
        <View className="relative mb-4">
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View
              style={{ backgroundColor: theme.base.surface }}
              className="w-24 h-24 rounded-full items-center justify-center"
            >
              <User size={48} color={theme.text.secondary} />
            </View>
          )}
          <TouchableOpacity
            onPress={pickImage}
            disabled={loading}
            style={{
              backgroundColor: theme.primary,
              borderColor: theme.base.background,
              position: 'absolute',
              top: 0,
              right: 0,
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.text.inverse} />
            ) : (
              <Camera size={18} color={theme.text.inverse} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={{ color: theme.text.primary }} className="text-lg font-bold">
          {profile?.username || user?.email || 'User'}
        </Text>
        <Text style={{ color: theme.text.secondary }} className="text-sm">
          {user?.email}
        </Text>
      </View>

      {/* Profile Information */}
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border mb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Edit3 size={20} color={theme.primary} />
            <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
              Profile Information
            </Text>
          </View>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={{ color: theme.primary }} className="font-medium">
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View>
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="mb-2 font-medium">
                Username
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.base.surface,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="p-3 rounded-xl border-2"
                placeholder="Enter username"
                placeholderTextColor={theme.text.tertiary}
                value={username}
                onChangeText={setUsername}
              />
            </View>
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="mb-2 font-medium">
                Email
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.base.surface,
                  borderColor: theme.base.border,
                  color: theme.text.tertiary,
                }}
                className="p-3 rounded-xl border-2"
                value={email}
                editable={false}
              />
              <Text style={{ color: theme.text.tertiary }} className="text-xs mt-1">
                Email cannot be changed
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setUsername(profile?.username || '');
                }}
                style={{ borderColor: theme.base.border }}
                className="flex-1 p-3 rounded-xl border-2 mr-2 items-center"
              >
                <Text style={{ color: theme.text.secondary }} className="font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={loading}
                style={{ backgroundColor: theme.primary }}
                className="flex-1 p-3 rounded-xl items-center"
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.text.inverse} />
                ) : (
                  <Text style={{ color: theme.text.inverse }} className="font-medium">
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View className="mb-3">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-1">
                Username
              </Text>
              <Text style={{ color: theme.text.primary }} className="text-base">
                {profile?.username || 'Not set'}
              </Text>
            </View>
            <View className="mb-3">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-1">
                Email
              </Text>
              <Text style={{ color: theme.text.primary }} className="text-base">
                {user?.email || 'Not set'}
              </Text>
            </View>
            {profile?.age && (
              <View className="mb-3">
                <Text style={{ color: theme.text.secondary }} className="text-sm mb-1">
                  Age
                </Text>
                <Text style={{ color: theme.text.primary }} className="text-base">
                  {profile.age}
                </Text>
              </View>
            )}
            {profile?.gender && (
              <View>
                <Text style={{ color: theme.text.secondary }} className="text-sm mb-1">
                  Gender
                </Text>
                <Text style={{ color: theme.text.primary }} className="text-base capitalize">
                  {profile.gender.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Change Password */}
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border mb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Lock size={20} color={theme.primary} />
            <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
              Change Password
            </Text>
          </View>
          {!changingPassword && (
            <TouchableOpacity onPress={() => setChangingPassword(true)}>
              <Text style={{ color: theme.primary }} className="font-medium">
                Change
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {changingPassword && (
          <View>
            <View className="mb-3">
              <TextInput
                style={{
                  backgroundColor: theme.base.surface,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="p-3 rounded-xl border-2 mb-3"
                placeholder="Current password"
                placeholderTextColor={theme.text.tertiary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                style={{
                  backgroundColor: theme.base.surface,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="p-3 rounded-xl border-2 mb-3"
                placeholder="New password"
                placeholderTextColor={theme.text.tertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={{
                  backgroundColor: theme.base.surface,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="p-3 rounded-xl border-2 mb-3"
                placeholder="Confirm new password"
                placeholderTextColor={theme.text.tertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  setChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={{ borderColor: theme.base.border }}
                className="flex-1 p-3 rounded-xl border-2 mr-2 items-center"
              >
                <Text style={{ color: theme.text.secondary }} className="font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                style={{ backgroundColor: theme.primary }}
                className="flex-1 p-3 rounded-xl items-center"
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.text.inverse} />
                ) : (
                  <Text style={{ color: theme.text.inverse }} className="font-medium">
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Theme Toggle */}
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border mb-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            {getThemeIcon()}
            <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
              Theme
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text style={{ color: theme.text.secondary }} className="mr-3">
              {getThemeLabel()}
            </Text>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
              trackColor={{ false: theme.base.border, true: theme.primary }}
              thumbColor={themeMode === 'dark' ? theme.text.inverse : theme.text.tertiary}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            const nextMode: 'light' | 'dark' | 'auto' =
              themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'auto' : 'light';
            setThemeMode(nextMode);
          }}
          className="mt-3"
        >
          <Text style={{ color: theme.primary }} className="text-sm">
            Tap to cycle: Light → Dark → Auto
          </Text>
        </TouchableOpacity>
      </View>

      {/* Check for Updates */}
      <TouchableOpacity
        onPress={checkForUpdates}
        disabled={checkingUpdate}
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border mb-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <RefreshCw
            size={20}
            color={checkingUpdate ? theme.text.tertiary : theme.primary}
          />
          <Text
            style={{ color: checkingUpdate ? theme.text.tertiary : theme.text.primary }}
            className="text-lg font-bold ml-2"
          >
            Check for Updates
          </Text>
        </View>
        {checkingUpdate ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Text style={{ color: theme.text.secondary }} className="text-sm">
            v{Constants.expoConfig?.version || '1.0.0'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{ backgroundColor: theme.status.error }}
        className="p-4 rounded-xl items-center mb-4"
      >
        <View className="flex-row items-center">
          <LogOut size={20} color={theme.text.inverse} />
          <Text style={{ color: theme.text.inverse }} className="font-bold ml-2 text-lg">
            Sign Out
          </Text>
        </View>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

