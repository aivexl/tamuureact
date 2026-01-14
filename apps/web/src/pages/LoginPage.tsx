import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { AuthForm } from '../components/Auth/AuthForm';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSEO } from '../hooks/useSEO';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, isLoading } = useAuth();

    useSEO({
        title: 'Masuk ke Tamuu - Platform Undangan Digital Premium',
        description: 'Masuk ke akun Tamuu Anda untuk mengelola undangan digital eksklusif Anda.'
    });

    const handleLogin = async (data: any) => {
        const { error } = await signIn(data.email, data.password);

        if (!error) {
            // Handle redirect if present
            const searchParams = new URLSearchParams(window.location.search);
            const redirect = searchParams.get('redirect') || '/dashboard';
            navigate(redirect);
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
