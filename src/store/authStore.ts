import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../config/supabase";
import NotificationService from "../services/NotificationService";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    full_name?: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),

      // Initialize auth session on app start
      initialize: async () => {
        try {
          console.log("🔄 Initializing auth session...");

          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error("❌ Session initialization error:", error);
            set({ user: null, initialized: true });
            return;
          }

          if (session?.user) {
            console.log("✅ Session found:", session.user.email);
            set({
              user: {
                id: session.user.id,
                email: session.user.email || "",
                full_name: session.user.user_metadata?.full_name || "",
                avatar_url: session.user.user_metadata?.avatar_url || "",
              },
              initialized: true,
            });
            // Start listening for notifications
            NotificationService.listenForInteractions(session.user.id);
          } else {
            console.log("ℹ️ No active session");
            set({ user: null, initialized: true });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            console.log("🔔 Auth state changed:", event);

            if (session?.user) {
              set({
                user: {
                  id: session.user.id,
                  email: session.user.email || "",
                  full_name: session.user.user_metadata?.full_name || "",
                  avatar_url: session.user.user_metadata?.avatar_url || "",
                },
              });
              // Start listening for notifications
              NotificationService.listenForInteractions(session.user.id);
            } else {
              set({ user: null });
              // Stop listening
              NotificationService.stopListening();
            }
          });
        } catch (error) {
          console.error("❌ Initialize error:", error);
          set({ user: null, initialized: true });
        }
      },

      signUp: async (email, password, full_name) => {
        try {
          set({ loading: true });

          console.log("📝 Attempting signup for:", email);

          const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: { full_name },
              emailRedirectTo: undefined, // Disable email confirmation redirect for mobile
            },
          });

          if (error) {
            console.error("❌ Signup error:", error.message);
            throw new Error(error.message);
          }

          if (!data.user) {
            throw new Error("Signup failed - no user data returned");
          }

          console.log("✅ Signup successful:", data.user.email);

          // Check if email confirmation is required
          if (!data.session) {
            console.log("📧 Email confirmation required");
            throw new Error("Please check your email to confirm your account");
          }

          // Auto-signed in
          set({
            user: {
              id: data.user.id,
              email: data.user.email || "",
              full_name: full_name || "",
            },
            loading: false,
          });

          // Start listening
          NotificationService.listenForInteractions(data.user.id);

        } catch (error: any) {
          console.error("❌ Sign-up error:", error);
          set({ loading: false });
          throw error;
        }
      },

      signIn: async (email, password) => {
        try {
          set({ loading: true });

          console.log("🔐 Attempting login for:", email);

          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) {
            console.error("❌ Login error:", error.message);
            throw new Error(error.message);
          }

          if (!data.user) {
            throw new Error("Login failed - no user data returned");
          }

          if (!data.user.id) {
            console.error("❌ User ID not found — user may not be logged in");
            throw new Error("Login failed - invalid user data");
          }

          console.log("✅ Login successful:", data.user.email);

          set({
            user: {
              id: data.user.id,
              email: data.user.email || "",
              full_name: data.user.user_metadata?.full_name || "",
              avatar_url: data.user.user_metadata?.avatar_url || "",
            },
            loading: false,
          });

          // Start listening
          NotificationService.listenForInteractions(data.user.id);

        } catch (error: any) {
          console.error("❌ Sign-in error:", error);
          set({ loading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          console.log("👋 Signing out...");
          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error("❌ Signout error:", error);
            throw error;
          }

          set({ user: null });
          NotificationService.stopListening();
          console.log("✅ Signed out successfully");
        } catch (error) {
          console.error("❌ Sign-out error:", error);
          throw error;
        }
      },

      fetchUser: async () => {
        try {
          console.log("🔍 Fetching user...");

          const { data, error } = await supabase.auth.getUser();

          if (error || !data?.user) {
            console.log("ℹ️ No user found");
            set({ user: null });
            return;
          }

          const user = data.user;

          if (!user.id) {
            console.error("❌ User ID not found");
            set({ user: null });
            return;
          }

          console.log("✅ User fetched:", user.email);

          set({
            user: {
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || "",
              avatar_url: user.user_metadata?.avatar_url || "",
            },
          });

          // Start listening
          NotificationService.listenForInteractions(user.id);

        } catch (error) {
          console.error("❌ Fetch user error:", error);
          set({ user: null });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);