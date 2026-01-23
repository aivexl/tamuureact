import { StateCreator } from 'zustand';

export type ModalType = 'info' | 'error' | 'warning' | 'success';

export interface ModalConfig {
    title: string;
    message: string;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export interface ModalState {
    modal: {
        isOpen: boolean;
        config: ModalConfig | null;
    };
    showModal: (config: ModalConfig) => void;
    hideModal: () => void;
}

export const createModalSlice: StateCreator<ModalState> = (set) => ({
    modal: {
        isOpen: false,
        config: null
    },
    showModal: (config) => set({
        modal: {
            isOpen: true,
            config: {
                ...config,
                type: config.type || 'info',
                confirmText: config.confirmText || 'OK'
            }
        }
    }),
    hideModal: () => set((state) => ({
        modal: {
            ...state.modal,
            isOpen: false
        }
    })),
});
