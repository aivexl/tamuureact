import React from 'react';
import { useStore } from '@/store/useStore';

interface UserKonvaPreviewProps {
    sectionId?: string;
    canvasType?: 'main' | 'orbit-left' | 'orbit-right';
}

/**
 * UserKonvaPreview
 * High-fidelity preview of a section or cinematic stage.
 */
export const UserKonvaPreview: React.FC<UserKonvaPreviewProps> = ({ sectionId, canvasType = 'main' }) => {
    const { sections } = useStore();
    const section = sectionId ? sections.find(s => s.id === sectionId) : null;

    // Dynamic import simulation / Check if Konva is available
    // In a real build, we'd use standard imports.
    const [isKonvaLoaded, setIsKonvaLoaded] = React.useState(false);

    React.useEffect(() => {
        // This is where we'd normally initialize or check Konva
        // For now, we'll provide a high-quality CSS/DOM fallback
        setIsKonvaLoaded(false);
    }, []);

    if (!section && canvasType === 'main') return null;

    const title = section ? section.title : (canvasType === 'orbit-left' ? 'Stage Kiri' : 'Stage Kanan');

    return (
        <div className="relative w-full h-full bg-white overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Fallback Rendering (High Fidelity CSS) */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col items-center text-slate-800">
                <div className="w-full h-full border-2 border-slate-50 rounded-xl flex flex-col items-center justify-between py-12 text-center">
                    <div className="space-y-4 px-4 w-full">
                        <div className="w-12 h-1 bg-teal-500/20 mx-auto rounded-full" />
                        <h5 className="text-xl font-black text-slate-900 font-outfit leading-tight">
                            {sectionId === 'opening' ? 'Walimatul Urs' : title}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Preview {section ? (section as any).type : 'Cinematic Stage'}
                        </p>
                    </div>

                    <div className="w-full px-6 space-y-3">
                        <div className="h-6 w-3/4 bg-slate-50 mx-auto rounded-lg animate-pulse" />
                        <div className="h-6 w-1/2 bg-slate-50 mx-auto rounded-lg animate-pulse delay-75" />
                        <div className="h-40 w-full bg-slate-50 rounded-2xl animate-pulse delay-150 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin opacity-20" />
                        </div>
                    </div>

                    <div className="w-full px-8">
                        <div className="h-10 w-full bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20" />
                    </div>
                </div>
            </div>

            {/* Hint for developers */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
                    High Fidelity Renderer<br />
                    <span className="text-teal-500/50">Ready to activate Konva</span>
                </p>
            </div>
        </div>
    );
};
