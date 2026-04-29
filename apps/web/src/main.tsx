import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './providers/AuthProvider'
import App from './App'
import './index.css'

// CTO SECURITY: Global Production Log Silencer
if (import.meta.env.PROD) {
    console.log = () => { };
    console.debug = () => { };
    console.info = () => { };
    console.warn = () => { };
    const originalError = console.error;
    console.error = (...args) => {
        if (args[0]?.includes?.('Hydration') || args[0]?.includes?.('React')) return;
        originalError('[ERROR]', args[0]);
    };
}

// ASSET RECOVERY: Handle chunk load failures (Vite hashed assets missing after new deploy)
window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Tamuu Recovery] Asset load failed, force reloading...');
    window.location.reload();
});

// Generic Global Error Handler for Script Loading
window.addEventListener('error', (e) => {
    if (e.target && (e.target as any).tagName === 'SCRIPT' && (e.target as any).src.includes('/assets/')) {
        console.warn('[Tamuu Recovery] Script failed to load:', (e.target as any).src);
        window.location.reload();
    }
}, true);

// REGISTER SERVICE WORKER (Enterprise Push Notification Phase 2.3)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <App />
                </AuthProvider>
                {/* DevTools only in development - auto-excluded in production builds */}
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
            </QueryClientProvider>
        </HelmetProvider>
    </React.StrictMode>,
)
