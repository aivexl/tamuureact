import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserEditorLayout } from '../components/Layout/UserEditorLayout';
import { EditorLayout } from '@/components/Layout/EditorLayout';
import { IconGridMenu } from '../components/UserEditor/IconGridMenu';
import { StatusToggles } from '../components/UserEditor/StatusToggles';
import { TemplateEditArea } from '../components/UserEditor/TemplateEditArea';
import { InvitationInfoCard } from '../components/UserEditor/InvitationInfoCard';
import { Modal } from '@/components/ui/Modal';
import { MusicPanel } from '@/components/UserEditor/Panels/MusicPanel';
import { ThemePanel } from '@/components/UserEditor/Panels/ThemePanel';
import { SharePanel } from '@/components/UserEditor/Panels/SharePanel';
import { ExportPanel } from '@/components/UserEditor/Panels/ExportPanel';
import { OrbitPanel } from '@/components/UserEditor/Panels/OrbitPanel';
import { useStore } from '@/store/useStore';
import { invitations as invitationsApi } from '@/lib/api';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useRef } from 'react';

interface UserEditorPageProps {
    mode?: 'invitation' | 'welcome';
}

export const UserEditorPage: React.FC<UserEditorPageProps> = ({ mode = 'invitation' }) => {
    const { id } = useParams<{ id: string }>();

    if (mode === 'welcome') {
        return (
            <div className="w-full h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-premium-dark overflow-hidden font-outfit">
                <EditorLayout templateId={id} isTemplate={false} isDisplayDesign={true} />
            </div>
        );
    }

    const navigate = useNavigate();
    const {
        activeSectionId,
        setActiveSection,
        setThumbnailUrl,
        setMusic,
        isPublished,
        setIsPublished,
        // Resetters
        resetStore,
        resetSections,
        clearLayers,
        hasHydrated,
        id: currentStoredId
    } = useStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<any>(null);
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    setLoading(true);
    setError(null);

    // SUPER-ULTRA ID GUARD: If the store belongs to another invitation, WIPE it immediately
    // This prevents the 'Invite A data appearing in Invite B' persistence bug.
    if (hasHydrated && currentStoredId !== id) {
        console.log('[UserEditor] ID Mismatch (Store:', currentStoredId, '!= URL:', id, '). Wiping store for clean slate.');
        resetStore();
        resetSections();
        clearLayers();
    }

    try {
        console.log('[UserEditor] Loading invitation:', id);
        const data = await invitationsApi.get(id);
        console.log('[UserEditor] Invitation data received from API');

        // TRANSACTIONAL HYDRATION: Ensure all store updates are atomic before UI mount
        // We do this BEFORE setting the local invitation state to avoid race conditions.

        // 1. Content
        if (data.sections && Array.isArray(data.sections)) {
            setSections(data.sections);
            if (data.sections.length > 0 && !activeSectionId) {
                setActiveSection(data.sections[0].id);
            }
        }
        if (data.orbit_layers) setOrbitLayers(data.orbit_layers);

        // 2. Metadata (Parity)
        setSlug(data.slug || '');
        setId(data.id);
        setProjectName(data.name || 'Untitled Design');
        setCategory(data.category || 'Wedding');
        setThumbnailUrl(data.thumbnail_url);
        if (data.music) setMusic(data.music);
        setIsPublished(!!data.is_published);
        setIsTemplate(false);

        // 3. Local State UI Parity
        setInvitation({
            id: data.id,
            title: data.name,
            slug: data.slug,
            is_published: !!data.is_published,
            status: data.is_published ? "Published" : "Draft",
            thumbnailUrl: data.thumbnail_url,
            category: data.category
        });

        console.log('[UserEditor] Store fully synchronized with API. UI Unlocked.');

    } catch (err) {
        console.error('[UserEditor] Failed to load invitation:', err);
        setError('Undangan tidak ditemukan atau terjadi kesalahan.');
    } finally {
        setLoading(false);
    }
};

// Only start loading after localStorage rehydration is confirmed
if (hasHydrated) {
    loadInvitation();
}
    }, [id, hasHydrated, currentStoredId]);


if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Menyiapkan Editor Anda...</p>
        </div>
    );
}

if (error || !invitation) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-slate-600 font-medium">{error || 'Undangan tidak ditemukan'}</p>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
            >
                Kembali ke Dashboard
            </button>
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
            <StatusToggles
                invitation={invitation}
                onUpdate={(updates) => setInvitation(updates)}
            />


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
                {activePanel === 'orbit' && <OrbitPanel />}
                {activePanel === 'share' && <SharePanel slug={invitation.slug} />}
                {activePanel === 'download' && <ExportPanel previewRef={previewRef as React.RefObject<HTMLElement>} />}
                {!['music', 'theme', 'orbit', 'share', 'download'].includes(activePanel || '') && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 tracking-tight text-xl uppercase tracking-widest">Segera Hadir</h4>
                            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Fitur <span className="text-teal-600 font-bold">{activePanel?.toUpperCase()}</span> sedang dalam tahap pengembangan premium.</p>
                        </div>
                        <button onClick={() => setActivePanel(null)} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                            Tutup
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    </UserEditorLayout>
);
};

export default UserEditorPage;
