import React from 'react';
import { DisplayEditorLayout } from '@/components/Layout/DisplayEditorLayout';
import { useParams } from 'react-router-dom';
import '../styles/editor.css';

// ============================================
// DISPLAY EDITOR PAGE
// Page wrapper for display template editing
// ============================================

export const DisplayEditorPage: React.FC = () => {
    // Support both :id and :slug route params
    const params = useParams<{ id?: string; slug?: string }>();
    const templateId = params.slug || params.id;

    return (
        <div className="w-full h-screen bg-[#050505] text-white selection:bg-purple-500/50 selection:text-white overflow-hidden font-outfit">
            <DisplayEditorLayout templateId={templateId} />
        </div>
    );
};

export default DisplayEditorPage;
