import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { ChevronRight, Heart } from 'lucide-react-native';
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-root-toast";
import { SIZES } from "../../utils/theme";
import { useHabitStore } from "../../store/habitStore";
import { useThemeStore } from "../../store/themeStore";
import { usePremium } from "../../hooks/usePremium";
import { PremiumTestPanel } from "../../components/premium/PremiumTestPanel";
import { useAuthStore } from "../../store/authStore";

interface UserProfile {
  name: string;
  email: string;
  profileImage: string | null;
  joinedDate: string;
}

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

export const ProfileScreen = ({ onLogout, onNavigate }: ProfileScreenProps) => {
  const { habits, urgeLogs } = useHabitStore();
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { user } = useAuthStore();

  // 💎 Premium hook
  const { isPremium, isTrialActive, trialDaysLeft, refreshStatus } =
    usePremium();

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.full_name || "Warrior",
    email: user?.email || "user@transform.app",
    profileImage: user?.avatar_url || null,
    joinedDate: new Date().toISOString(),
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.full_name || prev.name,
        email: user.email || prev.email,
        profileImage: user.avatar_url || prev.profileImage,
      }));
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem("userProfile");
      if (stored) {
        const storedProfile = JSON.parse(stored);
        setProfile(prev => ({
          ...prev,
          ...storedProfile,
          // Prioritize auth store data if available
          name: user?.full_name || storedProfile.name,
          email: user?.email || storedProfile.email,
          profileImage: user?.avatar_url || storedProfile.profileImage,
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show("Permission needed. Please grant media permission.", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          backgroundColor: "#E53935",
          textColor: "#FFF",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const newProfile = { ...profile, profileImage: result.assets[0].uri };
        saveProfile(newProfile);
        Toast.show("Profile photo updated! 📸", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          backgroundColor: "#4CAF50",
          textColor: "#FFF",
        });
      }
    } catch (error: any) {
      Toast.show("Failed to update photo. Please try again.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "#E53935",
        textColor: "#FFF",
      });
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Toast.show("Permission needed. Please grant camera permission.", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          backgroundColor: "#E53935",
          textColor: "#FFF",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const newProfile = { ...profile, profileImage: result.assets[0].uri };
        saveProfile(newProfile);
        Toast.show("Profile photo updated! 📸", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          backgroundColor: "#4CAF50",
          textColor: "#FFF",
        });
      }
    } catch (error: any) {
      Toast.show("Failed to take photo. Please try again.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "#E53935",
        textColor: "#FFF",
      });
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleEditProfile = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setShowEditModal(true);
  };

  const saveEditProfile = () => {
    if (!editName.trim()) {
      Toast.show("Name cannot be empty", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "#E53935",
        textColor: "#FFF",
      });
      return;
    }
    try {
      const newProfile = { ...profile, name: editName, email: editEmail };
      saveProfile(newProfile);
      setShowEditModal(false);
      Toast.show("Profile updated successfully! ✅", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "#4CAF50",
        textColor: "#FFF",
      });
    } catch (error: any) {
      Toast.show("Failed to update profile. Please try again.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "#E53935",
        textColor: "#FFF",
      });
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    Alert.alert("Success", "Password changed successfully!");
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClearData = () => {
    Alert.alert("Clear All Data?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            Toast.show("All data has been cleared successfully", {
              duration: Toast.durations.SHORT,
              position: Toast.positions.TOP,
              backgroundColor: "#4CAF50",
              textColor: "#FFF",
            });
          } catch (error: any) {
            Toast.show("Failed to clear data. Please try again.", {
              duration: Toast.durations.SHORT,
              position: Toast.positions.TOP,
              backgroundColor: "#E53935",
              textColor: "#FFF",
            });
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          Toast.show("Logging out...", {
            duration: Toast.durations.SHORT,
            position: Toast.positions.TOP,
            backgroundColor: "#6C5CE7",
            textColor: "#FFF",
          });
          onLogout();
        }
      },
    ]);
  };

  const calculateDaysClean = (quitDate: string) => {
    const now = new Date();
    const quit = new Date(quitDate);
    const diffTime = Math.abs(now.getTime() - quit.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalDaysClean = habits.reduce(
    (sum, habit) => sum + calculateDaysClean(habit.quitDate),
    0,
  );
  const urgesOvercome = urgeLogs.filter((log) => log.overcome).length;
  const successRate =
    urgeLogs.length > 0
      ? Math.round((urgesOvercome / urgeLogs.length) * 100)
      : 0;
  const memberSince = new Date(profile.joinedDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const bg = isDark ? "#000" : "#F9F9F9";
  const cardBg = isDark ? "rgba(25,25,25,0.9)" : "#FFF";
  const textColor = isDark ? "#FFF" : "#000";
  const subText = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            onPress={handlePhotoOptions}
            style={styles.avatarContainer}
          >
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.avatarInitial}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: textColor }]}>
            {profile.name}
          </Text>
          <Text style={[styles.profileEmail, { color: subText }]}>
            {profile.email}
          </Text>
          <Text style={[styles.profileDate, { color: subText }]}>
            Member since {memberSince}
          </Text>
        </View>

        {/* Premium Status Card - PREMIUM LOGIC COMMENTED OUT - All features are now free */}
        {/* <View style={[styles.premiumCard, { backgroundColor: cardBg }]}>
          {isPremium ? (
            <>
              <View style={styles.premiumBadgeContainer}>
                <LinearGradient
                  colors={["#FFD700", "#FFA500"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.premiumBadgeGradient}
                >
                  <Text style={styles.premiumBadgeText}>✨ PREMIUM</Text>
                </LinearGradient>
              </View>
              <Text style={[styles.premiumTitle, { color: textColor }]}>
                {isTrialActive ? "🎉 Free Trial Active" : "💎 Premium Member"}
              </Text>
              {isTrialActive && trialDaysLeft && (
                <Text style={[styles.premiumSubtitle, { color: subText }]}>
                  {trialDaysLeft} days remaining in trial
                </Text>
              )}
              <Text style={[styles.premiumFeatures, { color: subText }]}>
                All premium features unlocked
              </Text>
            </>
          ) : (
            <>
              <View style={styles.freeBadgeContainer}>
                <Text style={styles.freeBadge}>FREE PLAN</Text>
              </View>
              <Text style={[styles.premiumTitle, { color: textColor }]}>
                🔒 Upgrade to Premium
              </Text>
              <Text style={[styles.premiumSubtitle, { color: subText }]}>
                Unlock unlimited habits, all games, AI analysis & more
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => onNavigate?.("premium")}
              >
                <LinearGradient
                  colors={["#6C5CE7", "#9C27B0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeText}>Start 3-Day Free Trial</Text>
                  <Text style={styles.upgradeSubtext}>Then $10 for 7 days</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View> */}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {totalDaysClean}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>
              Total Days
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {habits.length}
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>Habits</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {successRate}%
            </Text>
            <Text style={[styles.statLabel, { color: subText }]}>Success</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Account
          </Text>
          <View style={[styles.settingCard, { backgroundColor: cardBg }]}>
            <TouchableOpacity
              onPress={handleEditProfile}
              style={styles.settingRow}
            >
              <Text style={[styles.settingTitle, { color: textColor }]}>
                Edit Profile
              </Text>
              <ChevronRight size={20} color={subText} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              style={styles.settingRow}
            >
              <Text style={[styles.settingTitle, { color: textColor }]}>
                Change Password
              </Text>
              <ChevronRight size={20} color={subText} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigate?.("myCommunityPost")}
              style={styles.settingRow}
            >
              <Text style={[styles.settingTitle, { color: textColor }]}>
                My Community Posts
              </Text>
              <ChevronRight size={20} color={subText} />
            </TouchableOpacity>
          </View>

          <Text
            style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}
          >
            Appearance
          </Text>
          <View style={[styles.settingCard, { backgroundColor: cardBg }]}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingTitle, { color: textColor }]}>
                Dark Mode
              </Text>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
          </View>

          <Text
            style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}
          >
            Data
          </Text>
          <View style={[styles.settingCard, { backgroundColor: cardBg }]}>
            <TouchableOpacity
              onPress={handleClearData}
              style={styles.settingRow}
            >
              <Text style={[styles.settingTitle, { color: "#FF5252" }]}>
                Clear All Data
              </Text>
              <ChevronRight size={20} color={subText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Testing Panel - Only in dev mode */}
        {/* PREMIUM LOGIC COMMENTED OUT - All features are now free */}
        {/* {__DEV__ && <PremiumTestPanel onStatusChange={refreshStatus} />} */}

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: cardBg }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: "#FF5252" }]}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: subText }]}>
          Made with ❤️ for those brave enough to change
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Edit Profile
            </Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: subText }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              placeholderTextColor={subText}
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor: subText }]}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email"
              placeholderTextColor={subText}
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.cancelBtn}
              >
                <Text style={{ color: subText }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEditProfile}
                style={styles.saveBtn}
              >
                <Text style={{ color: "#FFF" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Change Password
            </Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: subText }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor={subText}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor: subText }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor={subText}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor: subText }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor={subText}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.cancelBtn}
              >
                <Text style={{ color: subText }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChangePassword}
                style={styles.saveBtn}
              >
                <Text style={{ color: "#FFF" }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  profileDate: {
    fontSize: 12,
    marginTop: 2,
  },
  premiumCard: {
    marginHorizontal: SIZES.padding,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  premiumBadgeContainer: {
    marginBottom: 12,
  },
  premiumBadgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  freeBadgeContainer: {
    marginBottom: 12,
  },
  freeBadge: {
    backgroundColor: "rgba(100, 100, 100, 0.2)",
    color: "#999",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  premiumSubtitle: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  premiumFeatures: {
    fontSize: 12,
  },
  upgradeButton: {
    marginTop: 12,
    borderRadius: 10,
    overflow: "hidden",
    width: "100%",
  },
  upgradeGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  upgradeText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  upgradeSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
    paddingHorizontal: SIZES.padding,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 6,
  },
  section: {
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  settingCard: {
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  settingTitle: {
    fontSize: 15,
  },
  settingArrow: {
    fontSize: 20,
  },
  logoutButton: {
    alignItems: "center",
    marginHorizontal: SIZES.padding,
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  logoutText: {
    fontWeight: "700",
    fontSize: 15,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: SIZES.padding,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    flex: 1,
    alignItems: "center",
    marginRight: 8,
  },
  saveBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    flex: 1,
    alignItems: "center",
  },
});
