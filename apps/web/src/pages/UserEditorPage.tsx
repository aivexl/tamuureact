import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserEditorLayout } from '../components/Layout/UserEditorLayout';
import { IconGridMenu } from '../components/UserEditor/IconGridMenu';
import { StatusToggles } from '../components/UserEditor/StatusToggles';
import { TemplateEditArea } from '../components/UserEditor/TemplateEditArea';
import { InvitationInfoCard } from '../components/UserEditor/InvitationInfoCard';
import { Modal } from '@/components/ui/Modal';
import { MusicPanel } from '@/components/UserEditor/Panels/MusicPanel';
import { ThemePanel } from '@/components/UserEditor/Panels/ThemePanel';
import { useStore } from '@/store/useStore';
import { Loader2 } from 'lucide-react';

export const UserEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        activeSectionId,
        setActiveSection,
    } = useStore();

    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<any>(null);
    const [activePanel, setActivePanel] = useState<string | null>(null);

    useEffect(() => {
        // Simulation of loading invitation data
        // In a real scenario, this would fetch from an API or use a store action
        const loadInvitation = async () => {
            setLoading(true);
            try {
                // Mock fetch
                setTimeout(() => {
                    setInvitation({
                        id,
                        title: "Undangan Pernikahan Kita",
                        slug: "wedding-kita",
                        status: "published",
                        activeUntil: "2025-12-31"
                    });
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Failed to load invitation:", error);
                setLoading(false);
            }
        };

        if (id) {
            loadInvitation();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Menyiapkan Editor Anda...</p>
            </div>
        );
    }

    return (
        <UserEditorLayout>
            <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* 1. Information Card */}
                <InvitationInfoCard invitation={invitation} />

                {/* 2. Feature Menu */}
                <IconGridMenu onOpenPanel={(id: string) => setActivePanel(id)} />

                {/* 3. Global Toggles */}
                <StatusToggles />

                {/* 4. Main Edit Area */}
                <TemplateEditArea />

                {/* Panels Modal */}
                <Modal
                    isOpen={activePanel !== null}
                    onClose={() => setActivePanel(null)}
                    title={activePanel ? activePanel : ''}
                    size="lg"
                >
                    {activePanel === 'music' && <MusicPanel />}
                    {activePanel === 'theme' && <ThemePanel />}
                    {activePanel !== 'music' && activePanel !== 'theme' && (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">
                                Panel untuk <span className="text-slate-900">{activePanel}</span> akan segera hadir
                            </p>
                        </div>
                    )}
                </Modal>
            </div>
        </UserEditorLayout>
    );
};

export default UserEditorPage;
