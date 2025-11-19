import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// Stores
import { useHabitStore } from "../store/habitStore";
import { useThemeStore } from "../store/themeStore";
import { useTrackingStore } from "../store/trackingStore";
import { useCommunityStore } from "../store/communityStore";

// Hooks
import { usePremium } from "../hooks/usePremium";

// Screens
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { PanicButtonScreen } from "../screens/tools/PanicButtonScreen";
import { LogUrgeScreen } from "../screens/habits/LogUrgeScreen";
import { StatisticsScreen } from "../screens/analytics/StatisticsScreen";
import { AchievementsScreen } from "../screens/gamification/AchievementsScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { PartnerHomeScreen } from "../screens/accountability/PartnerHomeScreen";
import { CommunityHub } from "../screens/community/CommunityHub";
import { CommunityFeedScreen } from "../screens/community/CommunityFeedScreen";
import { CreatePostScreen } from "../screens/community/CreatePostScreen";
import { PostDetailScreen } from "../screens/community/PostDetailScreen";
import { UserProfileScreen } from "../screens/community/UserProfileScreen";
import { SuccessStoriesScreen } from "../screens/community/SuccessStoriesScreen";
import { CommunitySettingsScreen } from "../screens/community/CommunitySettingsScreen";
import { CommunityTestScreen } from "../screens/community/CommunityTestScreen";
import { BodyTrackingScreen } from "../screens/transformation/BodyTrackingScreen";
import { ScreenTimeScreen } from "../screens/monitoring/ScreenTimeScreen";
import { PremiumScreen } from "../screens/premium/PremiumScreen";
import { StyleConsultantScreen } from "../screens/premium/StyleConsultantScreen";
import { ProgressHubScreen } from "../screens/progress/ProgressHubScreen";
import { AIAnalysisScreen } from "../screens/progress/AIAnalysisScreen";
import { ExercisesScreen } from "../screens/progress/ExercisesScreen";
import { SelfieProgressScreen } from "../screens/progress/SelfieProgressScreen";
import { AIPhotoAnalysisScreen } from "../screens/ai/AIPhotoAnalysisScreen";
import { TransformationPredictionScreen } from "../screens/ai/TransformationPredictionScreen";
import {MyCommunityPost } from "../screens/community/MyCommunityPost";

// 👥 COMMUNITY IMPORTS
import { SuccessStories } from "../screens/community/SuccessStories";
import { GroupChallenges } from "../screens/community/GroupChallenges";

// 📊 ANALYTICS IMPORTS
import { DeepInsights } from "../screens/analytics/DeepInsights";

// 🎮 GAMIFICATION IMPORTS
import { LevelsScreen } from "../screens/gamification/LevelsScreen";
import { ChallengesScreen } from "../screens/gamification/ChallengesScreen";
import { LeaderboardScreen } from "../screens/gamification/LeaderboardScreen";
import { RewardsShop } from "../screens/gamification/RewardsShop";

// 📚 EDUCATION IMPORTS
import { LearningHub } from "../screens/education/LearningHub";
import { GuidedPrograms } from "../screens/education/GuidedPrograms";
import { VideoLibrary } from "../screens/education/VideoLibrary";

// 💚 WELLNESS IMPORTS
import { MoodTracker } from "../screens/wellness/MoodTracker";
import { Meditation } from "../screens/wellness/Meditation";

// 💼 PROFESSIONAL IMPORTS
import { EmergencyResources } from "../screens/professional/EmergencyResources";

// 💎 PREMIUM IMPORTS
import { SubscriptionManagement } from "../screens/premium/SubscriptionManagement";

// 🎮 GAMES IMPORTS
import { GamesHubScreen } from "../screens/games/GamesHubScreen";
import { MemoryMatchGame } from "../screens/games/MemoryMatchGame";
import { BreathPacerGame } from "../screens/games/BreathPacerGame";
import { ReactionTimeGame } from "../screens/games/ReactionTimeGame";
import { UrgeFighterGame } from "../screens/games/UrgeFighterGame";
import { FocusMasterGame } from "../screens/games/FocusMasterGame";
import { ZenGardenGame } from "../screens/games/ZenGardenGame";
import { PatternMasterGame } from "../screens/games/PatternMasterGame";

// 📊 ANALYTICS & SOCIAL IMPORTS
import { AdvancedAnalyticsScreen } from "../screens/analytics/AdvancedAnalyticsScreen";
import { SocialSharingScreen } from "../screens/social/SocialSharingScreen";
import { NotificationSettingsScreen } from "../screens/settings/NotificationSettingsScreen";
import { TrackingDashboard } from "../screens/analytics/TrackingDashboard";

// Components
import { BottomNavigation } from "./BottomNavigation";

// Utils
import { SIZES } from "../utils/theme";

// ✅ Complete Screen type with all features
export type Screen =
  | "dashboard"
  | "panic"
  | "logUrge"
  | "stats"
  | "achievements"
  | "profile"
  | "partner"
  | "community"
  | "communityFeed"
  | "transformation"
  | "screentime"
  | "premium"
  | "style"
  | "progressHub"
  | "aiAnalysis"
  | "exercises"
  | "selfies"
  | "games"
  | "memory-match"
  | "breath-pacer"
  | "reaction-time"
  | "urge-fighter"
  | "focus-master"
  | "zen-garden"
  | "pattern-master"
  | "advancedAnalytics"
  | "socialSharing"
  | "notificationSettings"
  | "trackingDashboard"
  | "createPost"
  | "postDetail"
  | "userProfile"
  | "successStories"
  | "communitySettings"
  | "communityTest"
  | "aiPhotoAnalysis"
  | "transformationPrediction"
  | "successStoriesAlt"
  | "groupChallenges"
  | "deepInsights"
  | "levels"
  | "challenges"
  | "leaderboard"
  | "rewardsShop"
  | "learningHub"
  | "guidedPrograms"
  | "videoLibrary"
  | "moodTracker"
  | "meditation"
  | "emergencyResources"
  | "myCommunityPost"
  | "subscriptionManagement";

interface AppNavigatorProps {
  onLogout: () => void;
}

export const AppNavigator = ({ onLogout }: AppNavigatorProps) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const habits = useHabitStore((state) => state.habits);
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  // 💎 Premium hook
  const { isPremium } = usePremium();

  // 📊 Tracking functions
  const trackScreenView = useTrackingStore((state) => state.trackScreenView);
  const endGameSession = useTrackingStore((state) => state.endGameSession);
  const currentGameSession = useTrackingStore(
    (state) => state.currentGameSession,
  );

  const navigateTo = (screen: Screen) => {
    if (isTransitioning || currentScreen === screen) return;

    setIsTransitioning(true);

    // 📊 Track screen view
    trackScreenView(screen);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(screen);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen onNavigate={navigateTo} />;

      case "panic":
        return <PanicButtonScreen />;

      case "logUrge":
        return <LogUrgeScreen onComplete={() => navigateTo("dashboard")} />;

      case "stats":
        return <StatisticsScreen />;

      case "achievements":
        return <AchievementsScreen />;

      case "profile":
        return <ProfileScreen onLogout={onLogout} onNavigate={navigateTo} />;

      case "partner":
        return <PartnerHomeScreen />;

      case "community":
        return <CommunityHub onNavigate={navigateTo} />;

        case "myCommunityPost": // <--- ADD THIS NEW CASE
         return <MyCommunityPost onNavigate={navigateTo} />;

      case "communityFeed":
        return <CommunityFeedScreen onNavigate={navigateTo} />;

      case "createPost":
        return (
          <CreatePostScreen
            onNavigate={navigateTo}
            onClose={() => navigateTo("communityFeed")}
          />
        );

      case "postDetail": {
        const selectedPostId = useCommunityStore.getState().selectedPostId;
        return (
          <PostDetailScreen
            postId={selectedPostId || ""}
            onNavigate={navigateTo}
            onBack={() => {
              useCommunityStore.getState().setSelectedPostId(null);
              navigateTo("communityFeed");
            }}
          />
        );
      }

      case "userProfile":
        return (
          <UserProfileScreen
            onNavigate={navigateTo}
            onBack={() => navigateTo("communityFeed")}
          />
        );

      case "successStories":
        return <SuccessStoriesScreen onNavigate={navigateTo} />;

      case "communitySettings":
        return (
          <CommunitySettingsScreen
            onNavigate={navigateTo}
            onBack={() => navigateTo("profile")}
          />
        );

      case "communityTest":
        return <CommunityTestScreen />;

      case "transformation":
        return <BodyTrackingScreen />;

      case "screentime":
        return <ScreenTimeScreen />;

      case "premium":
        return <PremiumScreen onBack={() => navigateTo("dashboard")} />;

      case "style":
        return <StyleConsultantScreen />;

      case "progressHub":
        return <ProgressHubScreen onNavigate={navigateTo} />;

      case "aiAnalysis":
        return <AIAnalysisScreen habitId={habits[0]?.id || ""} />;

      case "exercises":
        return <ExercisesScreen habitType={habits[0]?.type || "pornography"} />;

      case "selfies":
        return <SelfieProgressScreen />;

      // 🤖 AI SCREENS
      case "aiPhotoAnalysis":
        return (
          <AIPhotoAnalysisScreen onBack={() => navigateTo("progressHub")} />
        );

      case "transformationPrediction":
        return (
          <TransformationPredictionScreen
            onBack={() => navigateTo("progressHub")}
          />
        );

      // 🎮 GAMES NAVIGATION
      case "games":
        // PREMIUM LOGIC COMMENTED OUT - All features are now free
        return <GamesHubScreen onNavigate={navigateTo} isPremium={true} />;

      // FREE GAMES
      case "memory-match":
        return (
          <MemoryMatchGame
            onComplete={(score) => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, score, true);
              }
              navigateTo("games");
            }}
            onBack={() => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, undefined, false);
              }
              navigateTo("games");
            }}
          />
        );

      case "breath-pacer":
        return (
          <BreathPacerGame
            onComplete={(score) => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, score, true);
              }
              navigateTo("games");
            }}
            onBack={() => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, undefined, false);
              }
              navigateTo("games");
            }}
          />
        );

      case "reaction-time":
        return (
          <ReactionTimeGame
            onComplete={(score) => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, score, true);
              }
              navigateTo("games");
            }}
            onBack={() => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, undefined, false);
              }
              navigateTo("games");
            }}
          />
        );

      // PREMIUM GAMES
      case "urge-fighter":
        return (
          <UrgeFighterGame
            onComplete={(score) => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, score, true);
              }
              navigateTo("games");
            }}
            onBack={() => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, undefined, false);
              }
              navigateTo("games");
            }}
          />
        );

      case "focus-master":
        return (
          <FocusMasterGame
            onComplete={(score) => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, score, true);
              }
              navigateTo("games");
            }}
            onBack={() => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, undefined, false);
              }
              navigateTo("games");
            }}
          />
        );

      case "zen-garden":
        return (
          <ZenGardenGame
            onComplete={(score) => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, score, true);
              }
              navigateTo("games");
            }}
            onBack={() => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, undefined, false);
              }
              navigateTo("games");
            }}
          />
        );

      case "pattern-master":
        return (
          <PatternMasterGame
            onComplete={(score) => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, score, true);
              }
              navigateTo("games");
            }}
            onBack={() => {
              const sessionId = currentGameSession?.id;
              if (sessionId) {
                endGameSession(sessionId, undefined, false);
              }
              navigateTo("games");
            }}
          />
        );

      // 📊 ANALYTICS & SOCIAL
      case "advancedAnalytics":
        return (
          <AdvancedAnalyticsScreen
            onBack={() => navigateTo("progressHub")}
            onNavigate={navigateTo}
          />
        );

      case "socialSharing":
        return (
          <SocialSharingScreen onBack={() => navigateTo("advancedAnalytics")} />
        );

      // 🔔 NOTIFICATIONS
      case "notificationSettings":
        return (
          <NotificationSettingsScreen onBack={() => navigateTo("profile")} />
        );

      // 📊 TRACKING
      case "trackingDashboard":
        return <TrackingDashboard onBack={() => navigateTo("profile")} />;

      // 👥 COMMUNITY (Alternative versions)
      case "successStoriesAlt":
        return <SuccessStories onNavigate={navigateTo} />;

      case "groupChallenges":
        return <GroupChallenges onNavigate={navigateTo} />;

      // 📊 ANALYTICS
      case "deepInsights":
        return <DeepInsights onNavigate={navigateTo} />;

      // 🎮 GAMIFICATION
      case "levels":
        return <LevelsScreen onNavigate={navigateTo} />;

      case "challenges":
        return <ChallengesScreen />;

      case "leaderboard":
        return <LeaderboardScreen />;

      case "rewardsShop":
        return <RewardsShop />;

      // 📚 EDUCATION
      case "learningHub":
        return <LearningHub />;

      case "guidedPrograms":
        return <GuidedPrograms />;

      case "videoLibrary":
        return <VideoLibrary />;

      // 💚 WELLNESS
      case "moodTracker":
        return <MoodTracker />;

      case "meditation":
        return <Meditation />;

      // 💼 PROFESSIONAL
      case "emergencyResources":
        return <EmergencyResources />;

      // 💎 PREMIUM
      case "subscriptionManagement":
        return <SubscriptionManagement />;

      default:
        return <DashboardScreen onNavigate={navigateTo} />;
    }
  };

  // Hide bottom nav on detail screens, games, analytics, and settings
  const showBottomNav =
    currentScreen !== "panic" &&
    currentScreen !== "logUrge" &&
    currentScreen !== "aiAnalysis" &&
    currentScreen !== "exercises" &&
    currentScreen !== "selfies" &&
    currentScreen !== "aiPhotoAnalysis" &&
    currentScreen !== "transformationPrediction" &&
    currentScreen !== "successStories" &&
    currentScreen !== "successStoriesAlt" &&
    currentScreen !== "groupChallenges" &&
    currentScreen !== "deepInsights" &&
    currentScreen !== "levels" &&
    currentScreen !== "challenges" &&
    currentScreen !== "leaderboard" &&
    currentScreen !== "rewardsShop" &&
    currentScreen !== "learningHub" &&
    currentScreen !== "guidedPrograms" &&
    currentScreen !== "videoLibrary" &&
    currentScreen !== "moodTracker" &&
    currentScreen !== "meditation" &&
    currentScreen !== "emergencyResources" &&
    currentScreen !== "subscriptionManagement" &&
    currentScreen !== "memory-match" &&
    currentScreen !== "breath-pacer" &&
    currentScreen !== "reaction-time" &&
    currentScreen !== "urge-fighter" &&
    currentScreen !== "focus-master" &&
    currentScreen !== "zen-garden" &&
    currentScreen !== "pattern-master" &&
    currentScreen !== "advancedAnalytics" &&
    currentScreen !== "socialSharing" &&
    currentScreen !== "notificationSettings" &&
    currentScreen !== "trackingDashboard" &&
    currentScreen !== "createPost" &&
    currentScreen !== "postDetail" &&
    currentScreen !== "userProfile" &&
    currentScreen !== "communitySettings"&&
    currentScreen !== "myCommunityPost"; 

  const showFloatingButtons = currentScreen === "dashboard";

  // Show back button for games, detail screens, analytics, and settings
  const showBackButton =
    currentScreen === "panic" ||
    currentScreen === "logUrge" ||
    currentScreen === "aiAnalysis" ||
    currentScreen === "exercises" ||
    currentScreen === "selfies" ||
    currentScreen === "aiPhotoAnalysis" ||
    currentScreen === "transformationPrediction" ||
    currentScreen === "successStories" ||
    currentScreen === "successStoriesAlt" ||
    currentScreen === "groupChallenges" ||
    currentScreen === "deepInsights" ||
    currentScreen === "levels" ||
    currentScreen === "challenges" ||
    currentScreen === "leaderboard" ||
    currentScreen === "rewardsShop" ||
    currentScreen === "learningHub" ||
    currentScreen === "guidedPrograms" ||
    currentScreen === "videoLibrary" ||
    currentScreen === "moodTracker" ||
    currentScreen === "meditation" ||
    currentScreen === "emergencyResources" ||
    currentScreen === "subscriptionManagement" ||
    currentScreen === "memory-match" ||
    currentScreen === "breath-pacer" ||
    currentScreen === "reaction-time" ||
    currentScreen === "urge-fighter" ||
    currentScreen === "focus-master" ||
    currentScreen === "zen-garden" ||
    currentScreen === "pattern-master" ||
    currentScreen === "advancedAnalytics" ||
    currentScreen === "socialSharing" ||
    currentScreen === "notificationSettings" ||
    currentScreen === "trackingDashboard" ||
    currentScreen === "createPost" ||
    currentScreen === "postDetail" ||
    currentScreen === "userProfile" ||
    currentScreen === "communitySettings";

  const getBackDestination = (): Screen => {
    // Games go back to games hub
    if (
      [
        "memory-match",
        "breath-pacer",
        "reaction-time",
        "urge-fighter",
        "focus-master",
        "zen-garden",
        "pattern-master",
      ].includes(currentScreen)
    ) {
      return "games";
    }
    // Progress screens go back to progress hub
    if (
      [
        "aiAnalysis",
        "exercises",
        "selfies",
        "advancedAnalytics",
        "aiPhotoAnalysis",
        "transformationPrediction",
        "deepInsights",
      ].includes(currentScreen)
    ) {
      return "progressHub";
    }
    // Community screens go back to community
    if (
      [
        "createPost",
        "postDetail",
        "userProfile",
        "successStories",
        "successStoriesAlt",
        "groupChallenges",
      ].includes(currentScreen)
    ) {
      return "community";
    }
    // Gamification screens go back to achievements
    if (
      ["levels", "challenges", "leaderboard", "rewardsShop"].includes(
        currentScreen,
      )
    ) {
      return "achievements";
    }
    // Education screens go back to dashboard
    if (
      ["learningHub", "guidedPrograms", "videoLibrary"].includes(currentScreen)
    ) {
      return "dashboard";
    }
    // Wellness screens go back to dashboard
    if (["moodTracker", "meditation"].includes(currentScreen)) {
      return "dashboard";
    }
    // Professional screens go back to profile
    if (["emergencyResources"].includes(currentScreen)) {
      return "profile";
    }
    // Premium screens go back to premium or profile
    if (["subscriptionManagement"].includes(currentScreen)) {
      return "premium";
    }
    // Social sharing goes back to analytics
    if (currentScreen === "socialSharing") {
      return "advancedAnalytics";
    }
    // Notification settings & tracking go back to profile
    if (
      currentScreen === "notificationSettings" ||
      currentScreen === "trackingDashboard"
    ) {
      return "profile";
    }
    // Community settings go back to profile
    if (currentScreen === "communitySettings") {
      return "profile";
    }
    // Everything else goes to dashboard
    return "dashboard";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderScreen()}
      </Animated.View>

      {showBottomNav && (
        <BottomNavigation
          currentScreen={currentScreen}
          onNavigate={navigateTo}
        />
      )}

      {showFloatingButtons && (
        <View style={styles.floatingButtons}>
          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: "#FF5252" }]}
            onPress={() => navigateTo("panic")}
            activeOpacity={0.8}
          >
            <Text style={styles.floatingButtonText}>🆘</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: colors.primary }]}
            onPress={() => navigateTo("logUrge")}
            activeOpacity={0.8}
          >
            <Text style={styles.floatingButtonText}>📝</Text>
          </TouchableOpacity>
        </View>
      )}

      {showBackButton && (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => navigateTo(getBackDestination())}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  content: {
    flex: 1,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 90,
    right: 20,
    gap: 12,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 28,
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonText: {
    fontSize: SIZES.body,
    fontWeight: "600",
  },
});
