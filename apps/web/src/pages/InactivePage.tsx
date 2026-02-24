import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as m } from 'framer-motion';
import { AlertCircle, Home } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

export const InactivePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    useSEO({
        title: 'Invitation Inactive - Tamuu',
        description: 'This invitation is currently inactive.',
        noindex: true
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative font-inter">
            {/* Soft Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px]" />

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full relative z-10"
            >
                {/* Icon Container */}
                <div className="mb-8 relative">
                    <m.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto backdrop-blur-xl shadow-2xl"
                    >
                        <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
                    </m.div>
                </div>

                {/* Content */}
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-[0.3em] uppercase mb-4 px-2">
                    Undangan Inaktif
                </h1>

                <p className="text-sm sm:text-base text-slate-500 font-medium mb-10 leading-relaxed max-w-xs mx-auto px-4">
                    Mohon maaf, masa aktif undangan <span className="text-indigo-400 font-bold">/{slug}</span> telah berakhir dan tidak tersedia untuk publik saat ini.
                </p>

                {/* Decorative Line */}
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-10" />

                {/* Action */}
                <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="group mx-auto flex items-center justify-center gap-3 px-10 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-white/5 transition-all"
                >
                    <Home className="w-4 h-4" />
                    Back to Tamuu
                </m.button>

                {/* Subtle Branding */}
                <div className="mt-20">
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
                        Tamuu Precision Engine v5.0
                    </p>
                </div>
            </m.div>
        </div>
    );
};

export default InactivePage;