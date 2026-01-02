import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EditorPage } from './pages/EditorPage';
import { PreviewPage } from './pages/PreviewPage';
import { AdminTemplatesPage } from './pages/AdminTemplatesPage';
import { HomePage } from './pages/HomePage';
import { BackgroundRemoverPage } from './pages/BackgroundRemoverPage';
import { GOOGLE_FONTS_URL } from './lib/fonts';

const App: React.FC = () => {
    useEffect(() => {
        // Dynamically inject Google Fonts for all 200 fonts
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = GOOGLE_FONTS_URL;
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Home */}
                <Route path="/" element={<HomePage />} />

                {/* Editor Routes */}
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
                <Route path="/editor/template/:id" element={<EditorPage isTemplate={true} />} />

                {/* Admin Routes */}
                <Route path="/admin/templates" element={<AdminTemplatesPage />} />

                {/* Tools */}
                <Route path="/tools/background-remover" element={<BackgroundRemoverPage />} />

                {/* Preview Routes */}
                <Route path="/preview/:slug" element={<PreviewPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
