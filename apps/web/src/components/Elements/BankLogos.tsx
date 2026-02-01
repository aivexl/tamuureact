import React from 'react';

export const BankLogos: Record<string, React.FC<{ className?: string }>> = {
    export const BankLogos: Record<string, React.FC < { className?: string } >> = {
        bca: ({ className }) => (
            <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                {/* BCA: Simple, clean typography-focused logo */}
                <path d="M12 8h8c2 0 3 1 3 2.5s-1 2.5-3 2.5h-5v2h5c2 0 3 1 3 2.5S22 20 20 20h-8V8zm3 3v2h4c1 0 1.5-.5 1.5-1s-.5-1-1.5-1h-4zm0 4v2h5c1 0 1.5-.5 1.5-1s-.5-1-1.5-1h-5zM35 14c0-3.5 2.5-6.5 6-6.5s5 2 6 4.5l-2.5 1.5c-.5-1.5-1.5-2.5-3.5-2.5-1.5 0-2.5 1.5-2.5 3s1 3 2.5 3 3-1 3.5-2.5h3c-.5 3.5-3 6.5-6.5 6.5s-6-3-6-6.5zM65 8l-6 12h3l1.5-3h6l1.5 3h3l-6-12h-3zm-1 3l2 4h4l-2-4h-4z" />
            </svg>
        ),
            mandiri: ({ className }) => (
                <svg viewBox="0 0 120 40" className={className} fill="currentColor">
                    {/* Mandiri: Typographic with clean lines */}
                    <text x="5" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="currentColor">mandiri</text>
                </svg>
            ),
                bni: ({ className }) => (
                    <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                        <text x="5" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="26" fill="currentColor">BNI</text>
                        <circle cx="85" cy="16" r="8" fill="currentColor" fillOpacity="0.8" />
                    </svg>
                ),
                    bri: ({ className }) => (
                        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                            <text x="5" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="26" fill="currentColor">BRI</text>
                        </svg>
                    ),
                        bsi: ({ className }) => (
                            <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                                <text x="5" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="26" fill="currentColor">BSI</text>
                            </svg>
                        ),
                            dana: ({ className }) => (
                                <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                                    <text x="5" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="currentColor">DANA</text>
                                </svg>
                            ),
                                ovo: ({ className }) => (
                                    <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                                        <text x="5" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="currentColor">OVO</text>
                                    </svg>
                                ),
                                    gopay: ({ className }) => (
                                        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                                            <text x="5" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="currentColor">gopay</text>
                                        </svg>
                                    ),
                                        shopeepay: ({ className }) => (
                                            <svg viewBox="0 0 120 40" className={className} fill="currentColor">
                                                <text x="5" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="currentColor">ShopeePay</text>
                                            </svg>
                                        ),
                                            linkaja: ({ className }) => (
                                                <svg viewBox="0 0 120 40" className={className} fill="currentColor">
                                                    <text x="5" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="currentColor">LinkAja!</text>
                                                </svg>
                                            ),
                                                jenius: ({ className }) => (
                                                    <svg viewBox="0 0 120 40" className={className} fill="currentColor">
                                                        <text x="5" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="currentColor">Jenius</text>
                                                    </svg>
                                                ),
                                                    jago: ({ className }) => (
                                                        <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                                                            <text x="5" y="25" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="currentColor">Jago</text>
                                                        </svg>
                                                    ),
                                                        unknown: ({ className }) => (
                                                            <svg viewBox="0 0 100 32" className={className} fill="currentColor">
                                                                <rect x="5" y="4" width="90" height="24" rx="4" fillOpacity="0.1" />
                                                                <text x="50" y="21" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="14" textAnchor="middle" fill="currentColor">BANK</text>
                                                            </svg>
                                                        )
};
