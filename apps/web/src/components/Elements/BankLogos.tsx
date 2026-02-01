import React from 'react';

export const BankLogos: Record<string, React.FC<{ className?: string }>> = {
    // --- Major Banks (Using Veritrans Assets) ---
    bca: ({ className }) => (
        <img src="/images/logos/banks/bca.png" alt="BCA" className={`${className} h-full w-auto object-contain`} />
    ),
    bni: ({ className }) => (
        <img src="/images/logos/banks/bni.png" alt="BNI" className={`${className} h-full w-auto object-contain`} />
    ),
    bri: ({ className }) => (
        <img src="/images/logos/banks/bri.png" alt="BRI" className={`${className} h-full w-auto object-contain`} />
    ),
    mandiri: ({ className }) => (
        <img src="/images/logos/banks/mandiri.png" alt="Mandiri" className={`${className} h-full w-auto object-contain`} />
    ),
    danamon: ({ className }) => (
        <img src="/images/logos/banks/danamon.png" alt="Danamon" className={`${className} h-full w-auto object-contain`} />
    ),
    permata: ({ className }) => (
        <img src="/images/logos/banks/permata.png" alt="Permata" className={`${className} h-full w-auto object-contain`} />
    ),
    cimb: ({ className }) => (
        <img src="/images/logos/banks/cimb.png" alt="CIMB" className={`${className} h-full w-auto object-contain`} />
    ),
    maybank: ({ className }) => (
        <img src="/images/logos/banks/maybank.png" alt="Maybank" className={`${className} h-full w-auto object-contain`} />
    ),
    mega: ({ className }) => (
        <img src="/images/logos/banks/mega.png" alt="Bank Mega" className={`${className} h-full w-auto object-contain`} />
    ),

    // --- Payment Gateways & E-Money (Using Veritrans Assets) ---
    gopay: ({ className }) => (
        <img src="/images/logos/payment-gateways/gopay.svg" alt="GoPay" className={`${className} h-full w-auto object-contain`} />
    ),
    shopeepay: ({ className }) => (
        <img src="/images/logos/payment-gateways/shopeepay.png" alt="ShopeePay" className={`${className} h-full w-auto object-contain`} />
    ),
    akulaku: ({ className }) => (
        <img src="/images/logos/payment-gateways/akulaku.svg" alt="Akulaku" className={`${className} h-full w-auto object-contain`} />
    ),
    kredivo: ({ className }) => (
        <img src="/images/logos/payment-gateways/kredivo.svg" alt="Kredivo" className={`${className} h-full w-auto object-contain`} />
    ),

    // --- Existing SVG Fallbacks (Keeping for Coverage) ---
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
