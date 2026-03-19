import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Polyfill ResizeObserver for JSDOM
(globalThis as any).ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

// Membersihkan DOM setelah setiap pengujian selesai
afterEach(() => {
  cleanup();
});
