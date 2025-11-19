import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Stores
import { useThemeStore } from "../store/themeStore";

// Utils
import { SIZES } from "../utils/theme";

// Types
import type { Screen } from "./AppNavigator";

const { width } = Dimensions.get("window");

interface BottomNavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNavigation = ({
  currentScreen,
  onNavigate,
}: BottomNavigationProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const tabs = [
    { screen: "dashboard" as Screen, icon: "🏠", label: "Home" },
    { screen: "communityFeed" as Screen, icon: "💬", label: "Community" },
    { screen: "stats" as Screen, icon: "📊", label: "Stats" },
    { screen: "games" as Screen, icon: "🎮", label: "Games" },
    { screen: "profile" as Screen, icon: "👤", label: "Profile" },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#101010" : "#FFFFFF",
          borderTopColor: isDark ? "#222" : "#E0E0E0",
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.screen;

        return (
          <TouchableOpacity
            key={tab.screen}
            style={styles.tab}
            onPress={() => onNavigate(tab.screen)}
            activeOpacity={0.8}
          >
            {isActive ? (
              <LinearGradient
                colors={colors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeTab}
              >
                <Text style={[styles.activeIcon, { color: "#FFF" }]}>
                  {tab.icon}
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.inactiveTab,
                  {
                    backgroundColor: isDark ? "#1E1E1E" : "#F4F4F4",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.icon,
                    {
                      color: isDark ? "rgba(255,255,255,0.7)" : "#555",
                    },
                  ]}
                >
                  {tab.icon}
                </Text>
              </View>
            )}
            <Text
              style={[
                styles.label,
                {
                  color: isActive
                    ? colors.primary
                    : isDark
                      ? "rgba(255,255,255,0.6)"
                      : "#555",
                  fontWeight: isActive ? "700" : "600",
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingBottom: 25,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  activeTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  inactiveTab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    fontSize: 22,
  },
  activeIcon: {
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: SIZES.tiny,
    marginTop: 2,
  },
});
