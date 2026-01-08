import React, { useState } from 'react';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { m, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useSEO({
        title: 'Lupa Password - Tamuu Platform',
        description: 'Pulihkan akses ke akun Tamuu Anda dengan mudah dan aman.'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Silakan masukkan alamat email Anda');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Format email tidak valid');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Mock API Call
            console.log('[Auth] Password reset requested for:', email);
            await new Promise(resolve => setTimeout(resolve, 1800));
            setIsSent(true);
        } catch (err) {
            setError('Gagal mengirim email pemulihan. Silakan coba lagi nanti.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Pulihkan Akun"
            subtitle="Jangan khawatir, kami akan membantu Anda kembali ke dalam perjalanan eksklusif Anda."
        >
            <AnimatePresence mode="wait">
                {!isSent ? (
                    <m.form
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="email"
                                placeholder="Alamat Email Anda"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-white/5 border ${error ? 'border-rose-500/50' : 'border-white/10'} rounded-2xl px-12 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-premium-accent/20 focus:border-premium-accent/50 transition-all duration-300 placeholder:text-white/20`}
                            />
                            {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{error}</p>}
                        </div>

                        <m.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-slate-50 transition-all disabled:opacity-50 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Kirim Instruksi Pemulihan
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </m.button>

                        <div className="text-center">
                            <Link to="/login" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
                                Kembali ke Login
                            </Link>
                        </div>
                    </m.form>
                ) : (
                    <m.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                    >
                        <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-teal-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">Email Terkirim!</h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-10">
                            Kami telah mengirimkan instruksi pemulihan password ke <span className="text-white font-bold">{email}</span>. Silakan periksa kotak masuk atau folder spam Anda.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Kembali ke Login
                        </Link>
                    </m.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};
