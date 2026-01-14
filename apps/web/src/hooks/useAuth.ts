import { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const { setUser, setToken, setError } = useStore();
    const navigate = useNavigate();

    /**
     * Enterprise-grade Login
     */
    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // Data is synced via AuthProvider listener, but we can proactively set some state
                setToken(data.session?.access_token || null);
            }

            return { data, error: null };
        } catch (err: any) {
            const message = handleSupabaseError(err);
            setError(message);
            return { data: null, error: message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Enterprise-grade Signup
     */
    const signUp = async (email: string, password: string, fullName: string, role: 'user' | 'admin' = 'user') => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            });

            if (error) throw error;

            return { data, error: null };
        } catch (err: any) {
            const message = handleSupabaseError(err);
            setError(message);
            return { data: null, error: message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Enterprise-grade Logout
     */
    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            setToken(null);
            navigate('/login');
        } catch (err) {
            handleSupabaseError(err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Password Reset
     */
    const resetPassword = async (email: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            return { success: true, error: null };
        } catch (err: any) {
            const message = handleSupabaseError(err);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    return {
        signIn,
        signUp,
        signOut,
        resetPassword,
        isLoading: loading,
    };
};
