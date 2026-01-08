import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AuthForm } from '../Auth/AuthForm';
import { useStore } from '../../store/useStore';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode = 'login' }) => {
    const { setLoading, isLoading, setUser, setError } = useStore();
    const [internalMode, setInternalMode] = React.useState<'login' | 'signup'>(mode);

    // Sync internal mode if prop changes
    React.useEffect(() => {
        setInternalMode(mode);
    }, [mode, isOpen]);

    const handleAuth = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            // Mock auth logic
            await new Promise(resolve => setTimeout(resolve, 1500));
            setUser({
                id: '1',
                email: data.email,
                name: 'Demo User',
                role: 'user',
                tier: 'free',
                maxInvitations: 1,
                invitationCount: 0
            });
            onClose();
        } catch (err) {
            setError('Autentikasi gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0A1128]/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-premium-accent/50 to-transparent" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-10 mt-4">
                            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 mx-auto mb-6">
                                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                                {internalMode === 'login' ? 'Masuk ke Tamuu' : 'Gabung Bersama Kami'}
                            </h3>
                            <p className="text-white/40 text-sm font-medium">
                                Silakan {internalMode === 'login' ? 'masuk' : 'daftar'} untuk melanjutkan.
                            </p>
                        </div>

                        <AuthForm mode={internalMode} onSubmit={handleAuth} isLoading={isLoading} />

                        <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-4">
                            <button
                                onClick={() => setInternalMode(internalMode === 'login' ? 'signup' : 'login')}
                                className="text-xs font-bold text-white/40 hover:text-premium-accent transition-colors uppercase tracking-[0.2em]"
                            >
                                {internalMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
                            </button>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest block">
                                Premium Digital Invitation Platform
                            </p>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
