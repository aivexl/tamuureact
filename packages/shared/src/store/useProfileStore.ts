"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
    profile: any | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: (email: string, api: any) => Promise<void>;
    updateProfile: (updates: any, api: any) => Promise<boolean>;
    setProfile: (profile: any) => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profile: null,
            isLoading: false,
            error: null,

            setProfile: (profile) => set({ profile }),

            fetchProfile: async (email, api) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await api.getMe(email);
                    set({ profile: data, isLoading: false });
                } catch (err) {
                    console.error('[ProfileStore] Fetch error:', err);
                    set({ error: 'Failed to load profile', isLoading: false });
                }
            },

            updateProfile: async (updates, api) => {
                const currentProfile = get().profile;
                if (!currentProfile?.id) return false;

                set({ isLoading: true, error: null });
                try {
                    await api.updateProfile({
                        id: currentProfile.id,
                        ...updates
                    });

                    const updatedProfile = { ...currentProfile, ...updates };
                    set({ profile: updatedProfile, isLoading: false });
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
