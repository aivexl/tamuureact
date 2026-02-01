import React from 'react';

export const BankLogos: Record<string, React.FC<{ className?: string }>> = {
    bca: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Professional BCA Logo Reconstruction */}
            <path d="M15 10H30C33 10 35 12 35 15V25C35 28 33 30 30 30H15C12 30 10 28 10 25V15C10 12 12 10 15 10Z" stroke="currentColor" strokeWidth="2.5" />
            <path d="M18 16L25 16L18 24L25 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="40" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="currentColor">BCA</text>
            <rect x="0" y="0" width="120" height="40" fill="transparent" />
        </svg>
    ),
    mandiri: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            {/* High-Precision Mandiri Shape */}
            <path d="M10 15L15 10L20 15V30H10V15Z" />
            <path d="M22 10H40V14H26V18H38V22H26V30H22V10Z" />
            <text x="30" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="16" fill="currentColor">mandiri</text>
        </svg>
    ),
    bni: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <text x="10" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="currentColor">BNI</text>
            <circle cx="80" cy="20" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M75 20L85 20M80 15L80 25" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    bri: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <path d="M10 10V30H25C29 30 32 27 32 23V17C32 13 29 10 25 10H10ZM15 15H25C26 15 27 16 27 17V23C27 24 26 25 25 25H15V15Z" />
            <text x="40" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="currentColor">BRI</text>
        </svg>
    ),
    bsi: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <path d="M20 10L30 30L40 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <text x="45" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="currentColor">BSI</text>
        </svg>
    ),
    dana: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <text x="40" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="currentColor">DANA</text>
        </svg>
    ),
    ovo: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <circle cx="20" cy="20" r="15" fill="currentColor" fillOpacity="0.1" />
            <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <text x="45" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="currentColor">OVO</text>
        </svg>
    ),
    gopay: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <circle cx="15" cy="20" r="8" fill="currentColor" />
            <text x="30" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="currentColor">gopay</text>
        </svg>
    ),
    shopeepay: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <rect x="5" y="10" width="25" height="20" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <text x="40" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="16" fill="currentColor">ShopeePay</text>
        </svg>
    ),
    linkaja: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <path d="M10 10H30V15H15V20H25V25H10V10Z" />
            <text x="35" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="16" fill="currentColor">LinkAja!</text>
        </svg>
    ),
    jenius: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <path d="M10 10C10 5 20 5 20 10V30" stroke="currentColor" strokeWidth="3" fill="none" />
            <text x="30" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="currentColor">Jenius</text>
        </svg>
    ),
    jago: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <path d="M10 10V25C10 28 12 30 15 30H25C28 30 30 28 30 25V10" stroke="currentColor" strokeWidth="3" fill="none" />
            <text x="40" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="currentColor">Jago</text>
        </svg>
    ),
    unknown: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <rect x="5" y="4" width="90" height="24" rx="4" fillOpacity="0.1" />
            <text x="50" y="21" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="14" textAnchor="middle" fill="currentColor">BANK</text>
        </svg>
    )
};
