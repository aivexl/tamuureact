import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

vi.mock('@/lib/api', () => ({
  templates: { list: vi.fn().mockResolvedValue([]) },
  invitations: { create: vi.fn() },
  users: { getProfile: vi.fn() }
}));

vi.mock('../../hooks/queries', () => ({
  useTemplates: () => ({ data: [], isLoading: false }),
  useCategories: () => ({ data: [] }),
  useWishlist: () => ({ data: [] }),
  useToggleWishlist: () => ({ mutate: vi.fn() })
}));

vi.mock('@/store/useStore', () => ({
  useStore: () => ({ user: null, isAuthenticated: false, showModal: vi.fn() })
}));

import { InvitationsStorePage } from './InvitationsStorePage';

describe('InvitationsStorePage RTM Suite', () => {
    it('should render the Invitations Store Page without crashing', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/invitations']}>
                    <InvitationsStorePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
        // "All" category button should be present
        await waitFor(() => {
            expect(screen.getAllByText(/All/i).length).toBeGreaterThan(0);
        });
    });
});