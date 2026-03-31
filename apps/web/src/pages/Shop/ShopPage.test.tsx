import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mocks to prevent actual API calls and complex hooks from crashing the isolated test
vi.mock('@/lib/api', () => ({
  blog: { list: vi.fn().mockResolvedValue([]), getCategories: vi.fn().mockResolvedValue([]) },
  shop: { list: vi.fn().mockResolvedValue([]), getCategories: vi.fn().mockResolvedValue([]) },
  templates: { list: vi.fn().mockResolvedValue([]) },
  invitations: { create: vi.fn() }
}));

vi.mock('../../hooks/queries/useShop', () => ({
  useProductDiscovery: () => ({ data: [], isLoading: false }),
  useShopDirectory: () => ({ data: [], isLoading: false }),
  useShopCarousel: () => ({ data: [], isLoading: false }),
  useSpecialProducts: () => ({ data: [], isLoading: false }),
  useFeaturedProducts: () => ({ data: [], isLoading: false }),
  useRandomProducts: () => ({ data: [], isLoading: false }),
  useFeaturedVendors: () => ({ data: [], isLoading: false }),
  useTrackAdClick: () => vi.fn()
}));

vi.mock('../../hooks/queries', () => ({
  useCategories: () => ({ data: [] }),
  useWishlist: () => ({ data: [] }),
  useToggleWishlist: () => ({ mutate: vi.fn() }),
  useTemplates: () => ({ data: [], isLoading: false })
}));

vi.mock('../../store/useStore', () => ({
  useStore: () => ({ user: null, isAuthenticated: false, showModal: vi.fn() })
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: null })
}));

import { ShopPage } from './ShopPage';

describe('ShopPage SEO Nexus Suite', () => {
    it('should render the main Shop Page without crashing', () => {
        render(
            <MemoryRouter initialEntries={['/shop']}>
                <ShopPage />
            </MemoryRouter>
        );
        // Verify UI elements, using getAllByText since multiple matches might exist
        expect(screen.getAllByText(/Products/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Stores/i).length).toBeGreaterThan(0);
    });
});
