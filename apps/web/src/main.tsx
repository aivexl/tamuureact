import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './providers/AuthProvider'
import App from './App'
import './index.css'

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
