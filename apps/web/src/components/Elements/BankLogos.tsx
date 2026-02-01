import React from 'react';

export const BankLogos: Record<string, React.FC<{ className?: string }>> = {
    bca: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M12.5 4h18.8c.8 0 1.5.7 1.5 1.5v21c0 .8-.7 1.5-1.5 1.5H12.5c-.8 0-1.5-.7-1.5-1.5V5.5c0-.8.7-1.5 1.5-1.5zm1.5 18h15.8V7H14v15zM46.8 4l-9.3 24h3.2l1.9-5h8.4l1.9 5h3.2L46.8 4zm-2.8 16l3.7-9.8 3.7 9.8H44zM70.5 4h18.8c.8 0 1.5.7 1.5 1.5v5h-3v-3.5H72v15h15.8v-3.5h3v5c0 .8-.7 1.5-1.5 1.5H70.5c-.8 0-1.5-.7-1.5-1.5V5.5c0-.8.7-1.5 1.5-1.5z" />
        </svg>
    ),
    mandiri: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 8h5v12h3V8h5v16h-5v-6h-3v6h-5V8zm22 16h-5V8h3.5l3 9 3-9h3.5v16h-5v-9.5l-2 6h-2l-2-6V24zm16 0h-5V8h5v16zm8 0h-5V8h5v16zm8 0h-5V8h5v6h2l3 10h-5.5l-1.5-6h-2v6h-3V8h5c2 0 3.5.5 3.5 3s-1.5 3-3.5 3h-2v10z" />
        </svg>
    ),
    bni: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 6h12c4 0 7 3 7 7s-3 7-7 7h-6v4h-6V6zm6 10h6c1.5 0 2.5-1 2.5-3s-1-3-2.5-3h-6v6zm18-10h6l8 12V6h5v20h-6l-8-12v12h-5V6zm22 0h6v20h-6V6z" />
        </svg>
    ),
    bri: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 6h10c4 0 7 2 7 6s-2 5-5 5c3 0 6 2 6 6s-3 6-7 6H10V6zm6 9h4c1.5 0 2.5-1 2.5-2.5S21.5 10 20 10h-4v5zm0 9h4c1.5 0 2.5-1 2.5-2.5S21.5 19 20 19h-4v5zm18-18h10c3 0 6 2 6 5s-2 4-4 5l5 8h-7l-4-7h-2v7h-6V6zm6 8h3c1 0 2-.5 2-2s-1-2-2-2h-3v4zm16-8h6v20h-6V6z" />
        </svg>
    ),
    bsi: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 6h12c3 0 5 2 5 5s-2 4-4 4c3 0 5 2 5 5s-2 5-5 5H10V6zm6 7h5c1 0 2-.5 2-2s-1-2-2-2h-5v4zm0 8h6c1 0 2-.5 2-2s-1-2-2-2h-6v4zm18 4h-6l2-2.5c-2-1-3-3-3-5.5 0-3.5 2.5-6.5 6-6.5s5 2 6 4.5l-2.5 1.5c-.5-1.5-1.5-2.5-3.5-2.5-1.5 0-2.5 1.5-2.5 3 0 1.5 1 2.5 3 2.5h3c3.5 0 6 2.5 6 6s-2.5 6.5-6 6.5c-3.5 0-5.5-2-6.5-4.5l2.5-1.5c.5 1.5 2 2.5 4 2.5 1.5 0 2.5-1 2.5-2.5 0-1.5-1-2-3-2h-3l-1.5 1.5zm18-19h6v20h-6V6z" />
        </svg>
    ),
    dana: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 6h10c5 0 9 4.5 9 10s-4 10-9 10H10V6zm6 16h4c2.5 0 4-2.5 4-6s-1.5-6-4-6h-4v12zm28-16l-8 20h-5l8-20h5zm10 0l8 14V6h5v20h-5l-8-14v14h-5V6h5zm20 0l-8 20h-5l8-20h5z" />
        </svg>
    ),
    ovo: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <circle cx="20" cy="16" r="10" />
            <path d="M40 6l-6 20h5l2.5-9 2.5 9h5l-6-20h-5zm20 0l-6 20h5l2.5-9 2.5 9h5l-6-20h-5z" />
        </svg>
    ),
    gopay: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 16c0-5.5 4.5-10 10-10 4 0 7 2.5 8.5 6l-4 2c-.5-2-2.5-3.5-4.5-3.5-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2 0 3.5-1.5 3.5-3h-4v-4h8v5c-.5 3.5-3.5 6-7.5 6-5.5 0-10-4.5-10-10zm25 0c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm15 0c0 3-2.5 5.5-5 5.5s-5-2.5-5-5.5 2.5-5.5 5-5.5 5 2.5 5 5.5zm10-10h12c3 0 5 2 5 5s-2 5-5 5h-7v6h-5V6zm5 12h6c1 0 2-1 2-2s-1-2-2-2h-6v4zm20 12l-1.5-4h-7l-1.5 4h-5l6-16h6l6 16h-5zm-5-11l-2 5h4l-2-5zm16-5l-4 10v6h-5v-6l-4-10h5.5l1.5 4 1.5-4h5.5z" />
        </svg>
    ),
    shopeepay: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 14c0 2 1.5 3 4 3 4 0 4 2 4 4s-2 4-5 4c-2 0-3.5-1-4.5-2.5L7 24c1.5 2.5 4 4 7.5 4 5 0 9-3 9-8s-3-7-8-7-5-2-5-4 2-3 4.5-3c2 0 3.5 1 4.5 2L31 6c-1.5-2-4-3-6.5-3-5 0-9 3-9 7.5v.5h-5V6h5v-.5C15.5 2.5 19 0 24 0c4.5 0 8.5 2.5 10.5 6H40v20h-5V6h-5.5z" />
            <path d="M50 6h5v7h7V6h5v20h-5v-7h-7v7h-5V6zm25 0h12c4 0 7 3 7 7s-3 7-7 7h-7v6h-5V6zm5 10h6c1.5 0 2.5-1 2.5-3s-1-3-2.5-3h-6v6zm20-10h12c4 0 7 3 7 7s-3 7-7 7h-7v6h-5V6zm5 10h6c1.5 0 2.5-1 2.5-3s-1-3-2.5-3h-6v6z" />
        </svg>
    ),
    linkaja: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M10 6h5v16h8v4H10V6zm18 0h5v20h-5V6zm10 0h5l9 12V6h5v20h-5l-9-12v12h-5V6zm22 0h5v8l6-8h6l-6 8 8 12h-6l-5-9-2 2v7h-5V6zm20 0l-8 20h-5l8-20h5z" />
        </svg>
    ),
    jenius: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M16 6h15v4h-5v16c0 1.5-1 2-2.5 2-1 0-2-.5-2.5-1l-2 3c1 1 3 2 5 2 4 0 7-2 7-6V6h5v20c0 1.5-1 2.5-2 3.5-1.5 1-3.5 1.5-5.5 1.5-6 0-10-4-10-10V6zm20 6h12v4h-7v3h6v4h-6v3h8v4h-13v-18zm18 0l8 12V12h5v18h-5l-8-12v12h-5V12h5zm16 0h5v18h-5V12zm10 0h5v12c0 2 1 3 3 3s3-1 3-3V12h5v12c0 5-4 9-8 9s-8-4-8-9V12z" />
        </svg>
    ),
    jago: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <path d="M16 8h15v4h-5v12c0 2-1.5 3-3.5 3s-3.5-1-3.5-3V16h-5v8c0 5 4 9 9 9s9-4 9-9V8h5v16c0 6-5 11-12 11S8 38 8 30V8h8zm22 16l-1.5-4h-7l-1.5 4h-5l6-16h6l6 16h-5zm-5-11l-2 5h4l-2-5zm18-5h14v4h-9v5h8v4h-8v4.5C53 28.5 54.5 30 56 30h3v4h-5c-4 0-7.5-3.5-7.5-7.5V8zm22 0c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zm0 4c-3.5 0-6 2.5-6 6s2.5 6 6 6 6-2.5 6-6-2.5-6-6-6z" />
        </svg>
    ),
    unknown: ({ className }) => (
        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
            <rect x="5" y="4" width="90" height="24" rx="4" fillOpacity="0.1" />
            <text x="50" y="21" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="14" textAnchor="middle" fill="currentColor">BANK</text>
        </svg>
    )
};
