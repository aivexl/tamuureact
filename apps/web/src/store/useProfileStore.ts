import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users as usersApi } from '../lib/api';

interface ProfileState {
    profile: any | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: (email: string) => Promise<void>;
    updateProfile: (updates: any) => Promise<boolean>;
    setProfile: (profile: any) => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profile: null,
            isLoading: false,
            error: null,

            setProfile: (profile) => set({ profile }),

            fetchProfile: async (email) => {
                set({ isLoading: true, error: null });
                try {
                    // Use auth/me to get the latest DB state
                    const data = await usersApi.getMe(email);
                    set({ profile: data, isLoading: false });
                } catch (err) {
                    console.error('[ProfileStore] Fetch error:', err);
                    set({ error: 'Failed to load profile', isLoading: false });
                }
            },

            updateProfile: async (updates) => {
                const currentProfile = get().profile;
                if (!currentProfile?.id) return false;

                set({ isLoading: true, error: null });
                try {
                    await usersApi.updateProfile({
                        id: currentProfile.id,
                        ...updates
                    });

                    // Re-fetch to ensure sync
                    await get().fetchProfile(currentProfile.email);
                    set({ isLoading: false });
                    return true;
                } catch (err) {
                    console.error('[ProfileStore] Update error:', err);
                    set({ error: 'Failed to update profile', isLoading: false });
                    return false;
                }
            },
        }),
        {
            name: 'tamuu-profile-storage',
        }
    )
);
