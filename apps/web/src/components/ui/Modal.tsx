import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1000]"
                    />

                    {/* Content */}
                    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full ${sizeClasses[size]} bg-white rounded-[3rem] shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]`}
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight font-outfit uppercase tracking-widest">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
