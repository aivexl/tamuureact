import React from 'react';
import { EditorLayout } from '@/components/Layout/EditorLayout';
import { useParams } from 'react-router-dom';
import '../styles/editor.css';

interface EditorPageProps {
    isTemplate?: boolean;
}

export const EditorPage: React.FC<EditorPageProps> = ({ isTemplate }) => {
    // Support both :id and :slug route params
    const params = useParams<{ id?: string; slug?: string }>();
    const templateId = params.slug || params.id;

    return (
        <div className="w-full h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-premium-dark overflow-hidden font-outfit">
            <EditorLayout templateId={templateId} isTemplate={isTemplate} />
        </div>
    );
};
