"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice, AuthState } from './authSlice';
import { createUISlice, UIState } from './uiSlice';
import { createModalSlice, ModalState } from './modalSlice';

// Combined Store Type
export type StoreState = AuthState & UIState & ModalState;

export const useStore = create<StoreState>()(
    persist(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createUISlice(...a),
            ...createModalSlice(...a),
        }),
        {
            name: 'tamuu-storage',
            // Only persist essential parts
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                isSidebarOpen: state.isSidebarOpen,
                // We don't persist editor logic here as it's handled by zundo in the apps
            }),
        }
    )
);

export * from './authSlice';
export * from './uiSlice';
export * from './modalSlice';
export * from './useProfileStore';
