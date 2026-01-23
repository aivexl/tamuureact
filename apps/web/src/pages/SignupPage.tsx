import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { AuthForm } from '../components/Auth/AuthForm';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSEO } from '../hooks/useSEO';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { signUp, isLoading } = useAuth();

    useSEO({
        title: 'Daftar Tamuu - Ciptakan Undangan Digital Eksklusif',
        description: 'Mulai perjalanan Anda hari ini. Ciptakan undangan digital premium dengan fitur terlengkap.'
    });

    const handleSignup = async (data: any) => {
        const { error } = await signUp(data.email, data.password, data.name, data.gender, data.birthDate);

        if (!error) {
            navigate('/onboarding');
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
