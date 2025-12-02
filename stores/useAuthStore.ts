import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
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

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.log('Error fetching profile:', error);
        } else {
            set({ profile: data as Profile });
        }
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
    },
}));
