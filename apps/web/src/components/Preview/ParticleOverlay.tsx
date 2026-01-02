import React, { useMemo } from 'react';

type ParticleType = 'none' | 'butterflies' | 'petals' | 'leaves' | 'sparkles' | 'snow' | 'bubbles' | 'flowers';

interface ParticleOverlayProps {
    type: ParticleType | string;
    count?: number;
}

const PARTICLE_ASSETS: Record<string, string> = {
    butterflies: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Cpath d="M12 5a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V12h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2v3.27c.6.34 1 .99 1 1.73a2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-.74.4-1.39 1-1.73V16H9a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2V8.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/%3E%3C/svg%3E',
    petals: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,182,193,0.6)"%3E%3Ccircle cx="12" cy="8" r="3"/%3E%3Cellipse cx="8" cy="12" rx="3" ry="4" transform="rotate(-30 8 12)"/%3E%3Cellipse cx="16" cy="12" rx="3" ry="4" transform="rotate(30 16 12)"/%3E%3C/svg%3E',
    flowers: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,182,193,0.6)"%3E%3Ccircle cx="12" cy="8" r="3"/%3E%3Cellipse cx="8" cy="12" rx="3" ry="4" transform="rotate(-30 8 12)"/%3E%3Cellipse cx="16" cy="12" rx="3" ry="4" transform="rotate(30 16 12)"/%3E%3C/svg%3E',
    leaves: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(34,139,34,0.4)"%3E%3Cpath d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.59-2.17c1.81.8 3.74 1.17 5.7 1.17 4.97 0 9-4.03 9-9 0-2.21-.8-4.23-2.12-5.78L17 8z"/%3E%3C/svg%3E',
    sparkles: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold"%3E%3Cpath d="M12 2l1.09 3.26L16 6.35l-3.26 1.09L11.65 11 10.56 7.74 7 6.65l3.56-1.09L12 2zm0 10l.72 2.17L15 14.9l-2.17.72L12.1 18l-.72-2.17L9 15.1l2.17-.72L11.28 12z"/%3E%3C/svg%3E',
    snow: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"%3E%3Ccircle cx="12" cy="12" r="8"/%3E%3C/svg%3E',
    bubbles: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Ccircle cx="8" cy="8" r="2" fill="white" fill-opacity="0.2" /%3E%3C/svg%3E'
};

export const ParticleOverlay: React.FC<ParticleOverlayProps> = ({ type, count = 12 }) => {
    const particles = useMemo(() => {
        if (!type || type === 'none') return [];
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 10,
            duration: 10 + Math.random() * 15,
            scale: 0.3 + Math.random() * 1,
            opacity: 0.2 + Math.random() * 0.5,
            width: 20 + Math.random() * 30,
        }));
    }, [type, count]);

    if (!type || type === 'none' || !PARTICLE_ASSETS[type as string]) return null;

    return (
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden select-none">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute animate-float-down"
                    style={{
                        left: `${p.left}%`,
                        top: '-10%',
                        width: `${p.width}px`,
                        height: `${p.width}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        opacity: p.opacity,
                        transform: `scale(${p.scale})`,
                        willChange: 'transform',
                    }}
                >
                    <img
                        src={PARTICLE_ASSETS[type as string]}
                        alt=""
                        className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                </div>
            ))}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float-down {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                    }
                    25% {
                        transform: translateY(25vh) translateX(15px) rotate(90deg);
                    }
                    50% {
                        transform: translateY(50vh) translateX(-15px) rotate(180deg);
                    }
                    75% {
                        transform: translateY(75vh) translateX(10px) rotate(270deg);
                    }
                    100% {
                        transform: translateY(115vh) translateX(0) rotate(360deg);
                    }
                }
                .animate-float-down {
                    animation: float-down linear infinite;
                }
            `}} />
        </div>
    );
};
