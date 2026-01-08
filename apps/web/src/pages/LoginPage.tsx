import React from 'react';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { AuthForm } from '../components/Auth/AuthForm';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSEO } from '../hooks/useSEO';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { setLoading, isLoading, setUser, setError } = useStore();

    useSEO({
        title: 'Masuk ke Tamuu - Platform Undangan Digital Premium',
        description: 'Masuk ke akun Tamuu Anda untuk mengelola undangan digital eksklusif Anda.'
    });

    const handleLogin = async (data: any) => {
        setLoading(true);
        setError(null);

        try {
            // Mock authentication for demonstration
            // In production, this would call your backend API
            console.log('[Auth] Attempting login for:', data.email);

            await new Promise(resolve => setTimeout(resolve, 1500));

            setUser({
                id: 'user-new',
                email: data.email,
                name: data.name,
                role: 'user',
                tier: 'free',
                maxInvitations: 1,
                invitationCount: 0
            });

            navigate('/dashboard');
        } catch (err) {
            setError('Email atau password salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Selamat Datang Kembali"
            subtitle="Masuk untuk melanjutkan perjalanan eksklusif Anda bersama Tamuu."
        >
            <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />

            <p className="mt-8 text-center text-sm text-white/40 font-medium">
                Belum punya akun?{' '}
                <Link to="/signup" className="text-white font-black hover:text-premium-accent transition-colors">
                    Daftar di sini
                </Link>
            </p>
        </AuthLayout>
    );
};
