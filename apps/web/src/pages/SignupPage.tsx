import React from 'react';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { AuthForm } from '../components/Auth/AuthForm';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSEO } from '../hooks/useSEO';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { setLoading, isLoading, setUser, setError } = useStore();

    useSEO({
        title: 'Daftar Tamuu - Ciptakan Undangan Digital Eksklusif',
        description: 'Mulai perjalanan Anda hari ini. Ciptakan undangan digital premium dengan fitur terlengkap.'
    });

    const handleSignup = async (data: any) => {
        setLoading(true);
        setError(null);

        try {
            // Mock registration for demonstration
            console.log('[Auth] Attempting signup for:', data.email);

            await new Promise(resolve => setTimeout(resolve, 2000));

            setUser({
                id: 'user-new',
                email: data.email,
                name: data.name,
                role: 'user',
                tier: 'free',
                maxInvitations: 1,
                invitationCount: 0
            });

            navigate('/onboarding');
        } catch (err) {
            setError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Mulai Hari Ini"
            subtitle="Bergabunglah dengan standar baru dalam platform undangan digital dunia."
        >
            <AuthForm mode="signup" onSubmit={handleSignup} isLoading={isLoading} />

            <p className="mt-8 text-center text-sm text-white/40 font-medium">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-white font-black hover:text-premium-accent transition-colors">
                    Masuk Sekarang
                </Link>
            </p>
        </AuthLayout>
    );
};
