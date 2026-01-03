import React from 'react';
import { EditorLayout } from '@/components/Layout/EditorLayout';
import { useParams } from 'react-router-dom';
import '../styles/editor.css';

interface EditorPageProps {
    isTemplate?: boolean;
}

export const EditorPage: React.FC<EditorPageProps> = ({ isTemplate }) => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="w-full h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-premium-dark overflow-hidden font-outfit">
            <EditorLayout templateId={id} isTemplate={isTemplate} />
        </div>
    );
};
