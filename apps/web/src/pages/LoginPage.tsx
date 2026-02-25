import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { AuthForm } from '../components/Auth/AuthForm';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSEO } from '../hooks/useSEO';
import { m, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, isLoading } = useAuth();
    const [loginError, setLoginError] = useState<string | null>(null);

    useSEO({
        title: 'Masuk ke Tamuu - Platform Undangan Digital Premium',
        description: 'Masuk ke akun Tamuu Anda untuk mengelola undangan digital eksklusif Anda.'
    });

    const handleLogin = async (data: any) => {
        setLoginError(null);
        const { error } = await signIn(data.email, data.password);

        if (error) {
            // Localize or format standard Supabase error for Tamuu Elite UX
            if (error.includes('Invalid login credentials')) {
                setLoginError('Email atau password yang Anda masukkan salah. Silakan periksa kembali.');
            } else {
                setLoginError(error);
            }
        } else {
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
            <AnimatePresence mode="wait">
                {loginError && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Akses Ditolak</p>
                            <p className="text-xs text-rose-200/70 font-medium leading-relaxed">
                                {loginError}
                            </p>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

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
