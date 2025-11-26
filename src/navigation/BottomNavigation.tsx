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

import { Home, Users, BarChart2, Gamepad2, User } from "lucide-react-native";

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
    { screen: "dashboard" as Screen, Icon: Home, label: "Home" },
    { screen: "community" as Screen, Icon: Users, label: "Community" },
    { screen: "stats" as Screen, Icon: BarChart2, label: "Stats" },
    { screen: "games" as Screen, Icon: Gamepad2, label: "Games" },
    { screen: "profile" as Screen, Icon: User, label: "Profile" },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#101010" : "#FFFFFF",
          borderTopColor: isDark ? "#222" : "#F0F0F0",
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.screen;
        const IconComponent = tab.Icon;

        return (
          <TouchableOpacity
            key={tab.screen}
            style={styles.tab}
            onPress={() => onNavigate(tab.screen)}
            activeOpacity={0.7}
          >
            {isActive ? (
              <LinearGradient
                colors={colors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeTab}
              >
                <IconComponent size={24} color="#FFF" strokeWidth={2.5} />
              </LinearGradient>
            ) : (
              <View style={styles.inactiveTab}>
                <IconComponent
                  size={24}
                  color={isDark ? "rgba(255,255,255,0.5)" : "#9CA3AF"}
                  strokeWidth={2}
                />
              </View>
            )}
            <Text
              style={[
                styles.label,
                {
                  color: isActive
                    ? colors.primary
                    : isDark
                      ? "rgba(255,255,255,0.5)"
                      : "#9CA3AF",
                  fontWeight: isActive ? "600" : "500",
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
    paddingVertical: 12,
    paddingBottom: 28,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveTab: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
