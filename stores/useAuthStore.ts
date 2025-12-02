import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Profile } from '../types';

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    setSession: (session: Session | null) => void;
    fetchProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    profile: null,
    loading: true,
    setSession: (session) => {
        set({ session, user: session?.user ?? null, loading: false });
        if (session?.user) {
            get().fetchProfile();
        } else {
            set({ profile: null });
        }
    },
    fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        // Try to fetch existing profile
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) {
            console.log('Error fetching profile:', error);
            return;
        }

        // If profile doesn't exist, create it
        if (!data) {
            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: user.id,
                    username: `user_${user.id.substring(0, 8)}`,
                })
                .select()
                .single();

            if (createError) {
                // If it's a duplicate key error, the profile was created by trigger - fetch it again
                if (createError.code === '23505') {
                    const { data: fetchedProfile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    if (fetchedProfile) {
                        set({ profile: fetchedProfile as Profile });
                    }
                } else {
                    console.log('Error creating profile:', createError);
                }
            } else {
                set({ profile: newProfile as Profile });
            }
        } else {
            set({ profile: data as Profile });
        }
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
    },
}));
