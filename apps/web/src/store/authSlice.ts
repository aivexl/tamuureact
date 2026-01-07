import { StateCreator } from 'zustand';

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    role: 'user' | 'admin';
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
    user: null,
    isAuthenticated: false,
    token: null,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => set({ token }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    logout: () => set({ user: null, isAuthenticated: false, token: null, error: null }),
});
