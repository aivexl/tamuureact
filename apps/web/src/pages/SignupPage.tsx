import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { AuthForm } from '../components/Auth/AuthForm';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSEO } from '../hooks/useSEO';
import { m, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { signUp, isLoading } = useAuth();
    const [signupError, setSignupError] = useState<string | null>(null);

    useSEO({
        title: 'Daftar Tamuu - Ciptakan Undangan Digital Eksklusif',
        description: 'Mulai perjalanan Anda hari ini. Ciptakan undangan digital premium dengan fitur terlengkap.'
    });

    const handleSignup = async (data: any) => {
        setSignupError(null);
        const { error } = await signUp(data.email, data.password, data.name, data.gender, data.birthDate);

        if (!error) {
            navigate('/onboarding');
        } else {
            setSignupError(error);
        }
    };

    return (
        <AuthLayout
            title="Mulai Hari Ini"
            subtitle="Bergabunglah dengan standar baru dalam platform undangan digital dunia."
        >
            <AnimatePresence mode="wait">
                {signupError && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Pendaftaran Gagal</p>
                            <p className="text-xs text-rose-200/70 font-medium leading-relaxed">
                                {signupError}
                            </p>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

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
