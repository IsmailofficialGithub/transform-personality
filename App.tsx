import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-root-toast";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { OnboardingController } from "./src/screens/onboarding/OnboardingController";
import { AuthNavigator } from "./src/screens/auth/AuthNavigator";
import { GamificationProvider } from "./src/components/gamification/";
import { useHabitStore } from "./src/store/habitStore";
import { useThemeStore } from "./src/store/themeStore";
import { useAuthStore } from "./src/store/authStore"; // ✅ Import auth store
import NotificationService from "./src/services/NotificationService";
import PaymentService from "./src/services/PaymentService";

type AppState = "loading" | "auth" | "onboarding" | "app";

function AppContent() {
  const [appState, setAppState] = useState<AppState>("loading");
  const loadHabits = useHabitStore((state) => state.loadHabits);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const habits = useHabitStore((state) => state.habits);
  
  // ✅ Get auth state from Zustand
  const { user, initialize: initializeAuth, initialized: authInitialized } = useAuthStore();

  // Initialize services once
  useEffect(() => {
    const init = async () => {
      try {
        await NotificationService.init();
        const userId = user?.id || "user_" + Date.now();
        await PaymentService.init(userId);
      } catch (error) {
        console.error("Service initialization error:", error);
      }
    };
    init();
  }, [user?.id]);

  // Main app initialization
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log("🚀 Starting app initialization...");

      // 1. Load theme first
      await loadTheme();
      console.log("✅ Theme loaded");

      // 2. Load habits
      await loadHabits();
      console.log("✅ Habits loaded:", habits.length);

      // 3. Initialize Supabase auth session
      await initializeAuth();
      console.log("✅ Auth initialized");

      // Wait a tick for auth state to propagate
      setTimeout(() => {
        determineAppState();
      }, 100);
    } catch (error) {
      console.error("❌ App initialization error:", error);
      setAppState("auth");
    }
  };

  // Separate function to determine app state based on auth
  const determineAppState = async () => {
    const currentUser = useAuthStore.getState().user;
    console.log("🔐 Current user:", currentUser?.email || "Not logged in");

    // Not authenticated - show auth screen
    if (!currentUser) {
      console.log("➡️ No user, showing auth screen");
      setAppState("auth");
      return;
    }

    // Authenticated - check onboarding
    const onboardingComplete = await AsyncStorage.getItem("onboardingComplete");
    console.log("🎓 Onboarding status:", onboardingComplete);

    if (!onboardingComplete || habits.length === 0) {
      console.log("➡️ Onboarding incomplete, showing onboarding");
      setAppState("onboarding");
    } else {
      console.log("➡️ All set, showing app");
      setAppState("app");
    }
  };

  const handleAuthSuccess = async () => {
    console.log("✅ Auth success");
    
    // Check if onboarding is complete
    const onboardingComplete = await AsyncStorage.getItem("onboardingComplete");

    if (!onboardingComplete || habits.length === 0) {
      setAppState("onboarding");
    } else {
      setAppState("app");
    }
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem("onboardingComplete", "true");
    setAppState("app");
  };

  const handleLogout = async () => {
    try {
      // ✅ Sign out from Supabase
      await useAuthStore.getState().signOut();
      
      // Clear local storage
      await AsyncStorage.removeItem("onboardingComplete");
      
      Toast.show("Logged out successfully 👋", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "#4CAF50",
        textColor: "#FFF",
      });
      
      console.log("👋 Logged out successfully");
      setAppState("auth");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      Toast.show(error.message || "Logout failed. Please try again.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "#E53935",
        textColor: "#FFF",
      });
      // Force logout anyway
      setAppState("auth");
    }
  };

  if (appState === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingEmoji}>🚀</Text>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Loading Transform...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {appState === "auth" && (
        <AuthNavigator onAuthSuccess={handleAuthSuccess} />
      )}
      {appState === "onboarding" && (
        <OnboardingController onComplete={handleOnboardingComplete} />
      )}
      {appState === "app" && <AppNavigator onLogout={handleLogout} />}
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GamificationProvider>
        <AppContent />
      </GamificationProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#6C5CE7",
    fontWeight: "600",
  },
});
