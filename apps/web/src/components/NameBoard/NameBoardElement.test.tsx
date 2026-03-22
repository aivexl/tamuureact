import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NameBoardElement } from './NameBoardElement';
import React from 'react';

// Mock the store
vi.mock('@/store/useStore', () => ({
    useStore: (selector: any) => {
        const state = {
            guestData: { name: 'John Doe', tier: 'vip' },
            greetingName: 'John Doe',
            greetingTier: 'vip'
        };
        return selector(state);
    }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    m: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('NameBoardElement', () => {
    const mockLayer: any = {
        id: 'layer-1',
        type: 'name_board',
        name: 'Guest Name',
        x: 0,
        y: 0,
        width: 400,
        height: 120,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        nameBoardConfig: {
            variant: 1,
            displayText: 'Guest Name',
            fontFamily: 'Playfair Display',
            fontSize: 48,
            textColor: '#f8f9fa',
            backgroundColor: '#1a1a2e',
            borderColor: '#f8f9fa40',
            borderWidth: 2,
            borderRadius: 16,
            shadowEnabled: true
        }
    };

    it('renders the guest name and tier', () => {
        render(<NameBoardElement layer={mockLayer} />);
        
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText(/TAMUU VIP/i)).toBeDefined();
    });

    it('renders correctly in editor mode', () => {
        render(<NameBoardElement layer={mockLayer} isEditor={true} />);
        
        expect(screen.getByText('Guest Name')).toBeDefined();
        // Tier should NOT be rendered in editor mode according to code logic
        expect(screen.queryByText(/TAMUU VIP/i)).toBeNull();
    });
});
