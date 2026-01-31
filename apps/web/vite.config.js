import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
var __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            // Proxy /api requests to production API to bypass CORS during development
            '/api': {
                target: 'https://tamuu-api.shafania57.workers.dev',
                changeOrigin: true,
                secure: true,
            },
        },
        headers: {
            // Enable Cross-Origin Isolation for WASM multi-threading
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'credentialless',
        },
    },
    build: {
        // Enable minification (default is esbuild, which is safer if terser isn't installed)
        minify: true,
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes('node_modules')) {
                        // Core React
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                            return 'vendor-react';
                        }
                        // 3D Graphics (Heavy)
                        if (id.includes('@react-three') || id.includes('three')) {
                            return 'vendor-three';
                        }
                        // Editor Libs (Heavy)
                        if (id.includes('@tiptap') || id.includes('prosemirror')) {
                            return 'vendor-editor';
                        }
                        // AI & Media Processing (Very Heavy - keep out of main bundle)
                        if (id.includes('@ffmpeg') || id.includes('html5-qrcode')) {
                            return 'vendor-media';
                        }
                        if (id.includes('@huggingface') || id.includes('onnxruntime-web')) {
                            return 'vendor-ai';
                        }
                        // UI Libraries
                        if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('@headlessui')) {
                            return 'vendor-ui';
                        }
                        // State Management
                        if (id.includes('zustand') || id.includes('zundo')) {
                            return 'vendor-state';
                        }
                        // Everything else
                        return 'vendor';
                    }
                },
            },
        },
    },
});
