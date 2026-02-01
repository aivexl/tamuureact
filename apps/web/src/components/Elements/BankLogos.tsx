import React from 'react';

export const BankLogos: Record<string, React.FC<{ className?: string }>> = {
    // --- Major Banks (Using Veritrans Assets) ---
    bca: ({ className }) => (
        <img src="/images/logos/banks/bca.png?v=restored" alt="BCA" className={`${className} h-full w-auto object-contain`} />
    ),
    bni: ({ className }) => (
        <img src="/images/logos/banks/bni.png?v=restored" alt="BNI" className={`${className} h-full w-auto object-contain`} />
    ),
    bri: ({ className }) => (
        <img src="/images/logos/banks/bri.png?v=restored" alt="BRI" className={`${className} h-full w-auto object-contain`} />
    ),
    mandiri: ({ className }) => (
        <img src="/images/logos/banks/mandiri.png?v=restored" alt="Mandiri" className={`${className} h-full w-auto object-contain`} />
    ),
    danamon: ({ className }) => (
        <img src="/images/logos/banks/danamon.png?v=restored" alt="Danamon" className={`${className} h-full w-auto object-contain`} />
    ),
    permata: ({ className }) => (
        <img src="/images/logos/banks/permata.png?v=restored" alt="Permata" className={`${className} h-full w-auto object-contain`} />
    ),
    cimb: ({ className }) => (
        <img src="/images/logos/banks/cimb.png?v=restored" alt="CIMB" className={`${className} h-full w-auto object-contain`} />
    ),
    maybank: ({ className }) => (
        <img src="/images/logos/banks/maybank.png?v=restored" alt="Maybank" className={`${className} h-full w-auto object-contain`} />
    ),
    mega: ({ className }) => (
        <img src="/images/logos/banks/mega.png?v=restored" alt="Bank Mega" className={`${className} h-full w-auto object-contain`} />
    ),

    // --- Payment Gateways & E-Money (Using Veritrans Assets) ---
    gopay: ({ className }) => (
        <img src="/images/logos/payment-gateways/gopay.png?v=restored" alt="GoPay" className={`${className} h-full w-auto object-contain`} />
    ),
    shopeepay: ({ className }) => (
        <img src="/images/logos/payment-gateways/shopeepay.png?v=restored" alt="ShopeePay" className={`${className} h-full w-auto object-contain`} />
    ),
    akulaku: ({ className }) => (
        <img src="/images/logos/payment-gateways/akulaku.png?v=restored" alt="Akulaku" className={`${className} h-full w-auto object-contain`} />
    ),
    kredivo: ({ className }) => (
        <img src="/images/logos/payment-gateways/kredivo.png?v=restored" alt="Kredivo" className={`${className} h-full w-auto object-contain`} />
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
