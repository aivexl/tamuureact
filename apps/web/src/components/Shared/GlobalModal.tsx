import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertOctagon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ModalType } from '../../store/modalSlice';

const GlobalModal: React.FC = () => {
    const { modal, hideModal } = useStore();
    const { isOpen, config } = modal;

    if (!isOpen || !config) return null;

    const {
        title,
        message,
        type = 'info',
        confirmText = 'OK',
        cancelText,
        onConfirm,
        onCancel
    } = config;

    const getTypeStyles = (type: ModalType) => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
                    bg: 'bg-emerald-50',
                    button: 'bg-emerald-500 hover:bg-emerald-600'
                };
            case 'error':
                return {
                    icon: <AlertOctagon className="w-8 h-8 text-rose-500" />,
                    bg: 'bg-rose-50',
                    button: 'bg-rose-500 hover:bg-rose-600'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
                    bg: 'bg-amber-50',
                    button: 'bg-[#FFBF00] hover:bg-amber-500 text-[#0A1128]'
                };
            default:
                return {
                    icon: <Info className="w-8 h-8 text-indigo-500" />,
                    bg: 'bg-indigo-50',
                    button: 'bg-indigo-600 hover:bg-indigo-700'
                };
        }
    };

    const styles = getTypeStyles(type);

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        hideModal();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        hideModal();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#0A1128]/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 transition-all"
                onClick={handleCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-sm w-full p-8 relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative Background Element */}
                    <div className={`absolute top-0 left-0 w-full h-2 ${styles.bg}`} />

                    {/* Close Button */}
                    <button
                        onClick={handleCancel}
                        className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    <div className={`w-16 h-16 ${styles.bg} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                        {styles.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black text-[#0A1128] text-center mb-3 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 text-center text-sm leading-relaxed mb-8 px-2 font-medium">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {cancelText && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={handleConfirm}
                            className={`flex-1 px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg shadow-current/20 transition-all active:scale-95 ${styles.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GlobalModal;
