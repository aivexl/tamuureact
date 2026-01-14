import React, { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export const GuestGreetingOverlay: React.FC = () => {
    const { greetingName, lastInteractionId, activeEffect, greetingStyle } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        if (greetingName && lastInteractionId > 0) {
            setDisplayName(greetingName);
            setIsVisible(true);

            // Auto-hide after 5 seconds to match the effect duration
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [greetingName, lastInteractionId]);

    return (
        <AnimatePresence>
            {isVisible && greetingStyle !== 'none' && (
                <m.div
                    className="fixed inset-0 z-[10001] flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="relative text-center px-12 py-8">
                        {/* Background Glow */}
                        <m.div
                            className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        />

                        {/* Welcome Label */}
                        <m.div
                            className="relative mb-2 tracking-[0.3em] uppercase text-white/50 text-sm font-medium"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Selamat Datang
                        </m.div>

                        {/* Guest Name */}
                        <m.h1
                            className={`relative text-6xl md:text-8xl font-serif text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] ${greetingStyle === 'simple' ? 'font-sans font-bold' : ''}`}
                            style={{ fontFamily: greetingStyle === 'simple' ? 'Outfit, sans-serif' : 'Playfair Display, serif' }}
                            initial={{ y: 40, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{
                                type: "spring",
                                damping: 15,
                                stiffness: 80,
                                delay: 0.3
                            }}
                        >
                            {displayName}
                        </m.h1>

                        {/* Bottom Decoration */}
                        <m.div
                            className="relative mt-8 h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.6, duration: 1 }}
                        />
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
};
