import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../config/supabase";
import  HabitSelectionScreen  from "../onboarding/HabitSelectionScreen";
import { PlusCircle } from "lucide-react-native";

export function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const [habits, setHabits] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [habitModalVisible, setHabitModalVisible] = useState(false);

  const fetchHabits = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);
    if (!error) setHabits(data || []);
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back 👋</Text>
        <TouchableOpacity onPress={() => setHabitModalVisible(true)}>
          <PlusCircle size={28} color="#4a90e2"  />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        <Text style={styles.subtitle}>Your Habits</Text>

        {habits.length === 0 ? (
          <Text style={styles.noHabits}>No habits yet. Tap + to add one.</Text>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={styles.habitCard}>
              <Text style={styles.habitEmoji}>{habit.icon || "🌱"}</Text>
              <View>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitDescription}>{habit.description}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <HabitSelectionScreen
        visible={habitModalVisible}
        onClose={() => setHabitModalVisible(false)}
        onHabitsUpdated={fetchHabits}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1f2937",
  },
  noHabits: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
  habitCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  habitEmoji: { fontSize: 28 },
  habitName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  habitDescription: { fontSize: 13, color: "#6b7280" },
});
