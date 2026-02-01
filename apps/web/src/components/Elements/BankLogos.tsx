import React from 'react';

export const BankLogos: Record<string, React.FC<{ className?: string }>> = {
    bca: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 10H28.5C30.5 10 32 11.5 32 13.5V26.5C32 28.5 30.5 30 28.5 30H12.5C10.5 30 9 28.5 9 26.5V13.5C9 11.5 10.5 10 12.5 10Z" fillOpacity="0.1" />
            <path d="M12 12H20C22.5 12 24.5 13.5 24.5 16S22.5 20 20 20H15V24H12V12ZM15 15V17.5H20C21 17.5 21.5 17 21.5 16.25S21 15 20 15H15Z" />
            <path d="M35 24C32 24 30 22 30 18S32 12 35 12C37.5 12 39 13.5 39.5 15.5L36.5 16C36.3 15.3 35.8 14.8 35 14.8C34 14.8 33.2 15.8 33.2 18S34 21.2 35 21.2C35.8 21.2 36.3 20.7 36.5 20L39.5 20.5C39 22.5 37.5 24 35 24Z" />
            <path d="M48 12L42 24H45L46.2 21.2H51.8L53 24H56L50 12H48ZM47 19.5L49 14.5L51 19.5H47Z" />
        </svg>
    ),
    mandiri: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <path d="M10 24L12 21L14 24H10Z" />
            <path d="M16 12C12 12 10 14 10 17V24H13.5V17C13.5 15.5 14.3 14.8 15.5 14.8C16.7 14.8 17.5 15.5 17.5 17V24H21V17C21 14 19 12 16 12Z" />
            <path d="M28 24C25.5 24 24 22.5 24 19.5V12.5H27.5V19C27.5 20.2 28.2 20.8 29.2 20.8C30.2 20.8 31 20.2 31 19V12.5H34.5V19.5C34.5 22.5 33 24 30.5 24H28Z" />
            <text x="38" y="22" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="14">mandiri</text>
            <path d="M80 18C85 18 90 12 90 12H100C100 12 95 24 85 24H75L80 18Z" opacity="0.4" />
        </svg>
    ),
    bni: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <text x="5" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="28">BNI</text>
            <circle cx="85" cy="18" r="10" />
            <path d="M85 13V23M80 18H90" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    bri: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <path d="M5 8H18C22 8 23.5 10 23.5 13C23.5 15 22.5 16.5 20.5 17C23 18 24.5 19.5 24.5 22.5C24.5 26.5 22 28 18 28H5V8ZM10.5 12V16.5H16.5C18 16.5 18.5 16 18.5 14.25C18.5 12.5 18 12 16.5 12H10.5ZM10.5 20.5V24.5H18.5C20 24.5 20.5 24 20.5 22.5C20.5 21 20 20.5 18.5 20.5H10.5Z" />
            <text x="30" y="27" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="26">BRI</text>
        </svg>
    ),
    dana: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <text x="10" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24">DANA</text>
        </svg>
    ),
    ovo: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <circle cx="15" cy="20" r="12" fillOpacity="0.2" />
            <circle cx="15" cy="20" r="8" stroke="currentColor" strokeWidth="3" fill="none" />
            <text x="35" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24">OVO</text>
        </svg>
    ),
    gopay: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <circle cx="15" cy="20" r="8" />
            <text x="30" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24">gopay</text>
        </svg>
    ),
    shopeepay: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <text x="5" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20">ShopeePay</text>
        </svg>
    ),
    linkaja: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <text x="5" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20">LinkAja!</text>
        </svg>
    ),
    jenius: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <text x="5" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24">Jenius</text>
        </svg>
    ),
    jago: ({ className }) => (
        <svg viewBox="0 0 120 40" className={className} fill="currentColor">
            <text x="5" y="26" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24">Jago</text>
        </svg>
    ),
    unknown: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <rect x="5" y="4" width="90" height="24" rx="4" fillOpacity="0.1" />
            <text x="50" y="21" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="14" textAnchor="middle">BANK</text>
        </svg>
    )
};
