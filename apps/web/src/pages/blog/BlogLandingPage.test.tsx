import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

vi.mock('@/lib/api', () => ({
  default: {
    blog: { list: vi.fn().mockResolvedValue([]), getCategories: vi.fn().mockResolvedValue([]) },
    shop: { list: vi.fn().mockResolvedValue([]), getCategories: vi.fn().mockResolvedValue([]) },
    templates: { list: vi.fn().mockResolvedValue([]) },
    invitations: { create: vi.fn() }
  }
}));

import BlogLandingPage from './BlogLandingPage';

describe('BlogLandingPage RTM Suite', () => {
    it('should render the Blog Page without crashing', async () => {
        render(
            <MemoryRouter initialEntries={['/blog']}>
                <BlogLandingPage />
            </MemoryRouter>
        );
        // Wait for the loading state to finish
        await waitFor(() => {
            expect(screen.getAllByText(/All/i).length).toBeGreaterThan(0);
        });
    });
});