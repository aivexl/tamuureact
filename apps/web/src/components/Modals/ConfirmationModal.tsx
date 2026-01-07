import React from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'danger',
    isLoading = false
}) => {
    // Styling based on type
    const confirmButtonClass = {
        danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200',
        info: 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-200',
    };

    const iconClass = {
        danger: 'bg-rose-100 text-rose-500',
        warning: 'bg-amber-100 text-amber-500',
        info: 'bg-teal-100 text-teal-500',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Content */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 text-center">
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${iconClass[type]}`}>
                                {type === 'danger' && (
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" />
                                    </svg>
                                )}
                                {type === 'warning' && (
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                )}
                                {type === 'info' && (
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                                    </svg>
                                )}
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">{message}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors uppercase tracking-wider text-xs"
                                    disabled={isLoading}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 ${confirmButtonClass[type]} ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading && (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
