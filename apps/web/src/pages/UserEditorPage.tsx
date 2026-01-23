import React, { useEffect, useState } from 'react';
import { motion as m } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { UserEditorLayout } from '../components/Layout/UserEditorLayout';
import { EditorLayout } from '@/components/Layout/EditorLayout';
import { IconGridMenu } from '../components/UserEditor/IconGridMenu';
import { TemplateEditArea } from '../components/UserEditor/TemplateEditArea';
import { InvitationInfoCard } from '../components/UserEditor/InvitationInfoCard';
import { Modal } from '@/components/ui/Modal';
import { MusicPanel } from '@/components/UserEditor/Panels/MusicPanel';
import { PremiumLoader } from '../components/ui/PremiumLoader';

import { SharePanel } from '@/components/UserEditor/Panels/SharePanel';
import { ExportPanel } from '@/components/UserEditor/Panels/ExportPanel';
import { OrbitPanel } from '@/components/UserEditor/Panels/OrbitPanel';
import { TemplateStorePanel } from '@/components/UserEditor/Panels/TemplateStorePanel';
import { SmartFontInjector } from '@/components/ui/SmartFontInjector';
import { DisplayStorePanel } from '@/components/UserEditor/Panels/DisplayStorePanel';
import { WishesPanel } from '@/components/UserEditor/Panels/WishesPanel';
import { AnalyticsPanel } from '@/components/UserEditor/Panels/AnalyticsPanel';
import { EventDatePanel } from '@/components/UserEditor/Panels/EventDatePanel';
import { LocationPanel } from '@/components/UserEditor/Panels/LocationPanel';
import { GiftPanel } from '@/components/UserEditor/Panels/GiftPanel';
import { SEOPanel } from '@/components/UserEditor/Panels/SEOPanel';
import { GalleryPanel } from '@/components/UserEditor/Panels/GalleryPanel';
import { LiveStreamPanel } from '@/components/UserEditor/Panels/LiveStreamPanel';
import { LoveStoryPanel } from '@/components/UserEditor/Panels/LoveStoryPanel';
import { QuotesPanel } from '@/components/UserEditor/Panels/QuotesPanel';
import { LuckyDrawPanel } from '@/components/UserEditor/Panels/LuckyDrawPanel';
import { AnimatedLayer } from '@/components/Preview/AnimatedLayer';
import { useStore } from '@/store/useStore';
import { invitations as invitationsApi } from '@/lib/api';
import { Sparkles, AlertCircle, Clock } from 'lucide-react';
import { useRef } from 'react';
import { useSubscriptionTimer } from '../hooks/useSubscriptionTimer';
import { useProfileStore } from '../store/useProfileStore';

import { SubscriptionStatusWidget } from '../components/ui/SubscriptionStatusWidget';

interface UserEditorPageProps {
    mode?: 'invitation' | 'welcome';
}

export const UserEditorPage: React.FC<UserEditorPageProps> = ({ mode = 'invitation' }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // 1. PROJECT IDENTIFIERS
    const currentStoredId = useStore(s => s.id);
    const hasHydrated = useStore(s => s.hasHydrated);

    // 2. ATOMIC SETTERS
    const resetStore = useStore(s => s.resetStore);
    const resetSections = useStore(s => s.resetSections);
    const clearLayers = useStore(s => s.clearLayers);
    const hydrateProject = useStore(s => s.hydrateProject);
    const setSections = useStore(s => s.setSections);
    const setOrbitLayers = useStore(s => s.setOrbitLayers);
    const setActiveSection = useStore(s => s.setActiveSection);

    // 3. UI STATE
    const activeSectionId = useStore(s => s.activeSectionId);
    const sections = useStore(s => s.sections);
    const orbit = useStore(s => s.orbit);
    const exportFormat = useStore(s => s.exportFormat);
    const isPublished = useStore(s => s.isPublished);

    if (mode === 'welcome') {
        return (
            <div className="w-full h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-premium-dark overflow-hidden font-outfit">
                <EditorLayout templateId={id} isTemplate={false} isDisplayDesign={true} />
            </div>
        );
    }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<any>(null);

    const { profile } = useProfileStore();
    const subStatus = useSubscriptionTimer(profile?.expires_at || null);
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const hasAttemptedRef = useRef<string | null>(null);

    useEffect(() => {
        const loadInvitation = async () => {
            if (!id || hasAttemptedRef.current === id) return;
            hasAttemptedRef.current = id;

            console.log('[UserEditor] [v3.8-BILLIONAIRE] Starting atomic load for:', id);

            setLoading(true);
            setError(null);

            // 1. ID GUARD: Atomic check before any state changes
            if (hasHydrated && currentStoredId !== id) {
                console.log('[UserEditor] ID Sync: Wiping stale data (', currentStoredId, '->', id, ')');
                resetStore();
                resetSections();
                clearLayers();
            }

            try {
                const data = await invitationsApi.get(id);

                // 2. TRANSACTIONAL HYDRATION: Update store in one go.
                // This replaces 10+ individual setters with a single transaction.
                hydrateProject(data);

                // Deep arrays still need individual syncs if they are handled by separate slices
                setSections(data.sections || []);
                if (data.orbit_layers) setOrbitLayers(data.orbit_layers);

                // 3. UI Sync (Local Component State)
                setInvitation({
                    id: data.id,
                    title: data.name,
                    slug: data.slug,
                    is_published: !!data.is_published,
                    status: data.is_published ? "Published" : "Draft",
                    thumbnailUrl: data.thumbnail_url,
                    category: data.category
                });

                if (data.sections?.length > 0 && !activeSectionId) {
                    setActiveSection(data.sections[0].id);
                }

                console.log('[UserEditor] Hydration Successful. Engine Online.');
            } catch (err) {
                console.error('[UserEditor] Hydration Failed:', err);
                setError('Undangan tidak ditemukan atau terjadi kesalahan.');
                hasAttemptedRef.current = null; // Allow retry
            } finally {
                setLoading(false);
            }
        };

        if (hasHydrated) {
            loadInvitation();
        }
    }, [id, hasHydrated]); // MINIMAL DEPS: Only ID and Hydration status matter. Setters are stable.



    if (loading) {
        return <PremiumLoader showLabel label="Menyiapkan Editor Anda..." />;
    }

    if (subStatus.isExpired) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />

                <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative z-10"
                >
                    <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl shadow-rose-500/20">
                        <Clock className="w-10 h-10 text-white animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-widest mb-4">Masa Aktif Habis</h2>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                        Masa aktif undangan ini telah berakhir. Desain Anda tetap aman, namun akses edit dikunci sementara.
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2">Hitung Mundur Penghapusan Data</div>
                        <div className="text-4xl font-black text-white font-mono tracking-tighter">
                            {30 - subStatus.daysSinceExpiry} <span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Hari Lagi</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/billing')}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 uppercase tracking-widest text-xs"
                        >
                            Perpanjang Sekarang
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            Ke Dashboard
                        </button>
                    </div>
                </m.div>

                <p className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                    Sesuai Kebijakan Tamuu: Data dihapus permanen dalam 30 hari.
                </p>
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
            <SmartFontInjector />
            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Information Card */}
                <InvitationInfoCard
                    invitation={{
                        ...invitation,
                        is_published: isPublished,
                        status: isPublished ? "Published" : "Draft"
                    }}
                    onShare={() => setActivePanel('share')}
                    onSettings={() => setActivePanel('settings')}
                />

                {/* 2. Feature Menu */}
                <IconGridMenu onOpenPanel={(panelId: string) => {
                    if (panelId === 'guests') {
                        navigate(`/guests/${id}`);
                    } else {
                        setActivePanel(panelId);
                    }
                }} />


                {/* 4. Main Edit Area */}
                <TemplateEditArea />

                {/* Panels Modal */}
                <Modal
                    isOpen={activePanel !== null}
                    onClose={() => setActivePanel(null)}
                    title={(() => {
                        const titles: Record<string, string> = {
                            theme: 'Tema Undangan',
                            music: 'Musik Latar',
                            template: 'Koleksi Template',
                            wishes: 'Ucapan & Doa',
                            display: 'Display Desain',
                            analytics: 'Statistik & Analitik',
                            share: 'Bagikan Undangan',
                            download: 'Download Assets',
                            eventDate: 'Tanggal Acara',
                            location: 'Lokasi Acara',
                            gift: 'Kado Digital',
                            seo: 'Sosmed Preview',
                            gallery: 'Galeri Foto',
                            livestream: 'Live Streaming',
                            lovestory: 'Kisah Cinta',
                            quotes: 'Quote Undangan',
                            luckydraw: 'Lucky Draw',
                            settings: 'Pengaturan Undangan'
                        };
                        return titles[activePanel || ''] || (activePanel ? activePanel.charAt(0).toUpperCase() + activePanel.slice(1) : '');
                    })()}
                    size="lg"
                >
                    {activePanel === 'music' && <MusicPanel />}

                    {activePanel === 'display' && <DisplayStorePanel invitationId={invitation?.id} />}
                    {activePanel === 'template' && <TemplateStorePanel invitationId={invitation?.id} />}
                    {activePanel === 'wishes' && <WishesPanel />}
                    {activePanel === 'analytics' && <AnalyticsPanel />}
                    {activePanel === 'share' && <SharePanel slug={invitation?.slug} />}
                    {activePanel === 'download' && <ExportPanel previewRef={previewRef as React.RefObject<HTMLElement>} />}
                    {activePanel === 'eventDate' && <EventDatePanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {activePanel === 'location' && <LocationPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {activePanel === 'gift' && <GiftPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === 'seo' && <SEOPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {activePanel === 'gallery' && <GalleryPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {activePanel === 'livestream' && <LiveStreamPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {activePanel === 'lovestory' && <LoveStoryPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {activePanel === 'quotes' && <QuotesPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {activePanel === 'luckydraw' && <LuckyDrawPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                    {!['music', 'theme', 'display', 'template', 'share', 'download', 'wishes', 'analytics', 'eventDate', 'location', 'gift', 'seo', 'gallery', 'livestream', 'lovestory', 'quotes', 'luckydraw', 'settings', 'guests'].includes(activePanel || '') && (
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

            {/* HIDDEN EXPORT PREVIEW (Liquid Parity Engine) */}
            {exportFormat && (() => {

                // DESIGN SETTINGS
                const isDesktop = exportFormat === 'desktop';
                const EXPORT_WIDTH = isDesktop ? 1080 : 414;
                const DESIGN_HEIGHT = 896;
                const DESIGN_WIDTH = 414;

                // DYNAMIC COVER HEIGHT (Matches PreviewView logic)
                // For Mobile export, we use a fixed 960 design units ratio (approx 9:21)
                // to match modern "Tall" screens and avoid squishing.
                let formatRatio = 2500 / 1080; // 9:20.8 (approx 960 design units)
                if (exportFormat === 'desktop') formatRatio = 720 / 1280;
                else if (exportFormat === 'print') formatRatio = 1123 / 794;

                const exportCoverHeight = DESIGN_WIDTH * formatRatio;

                let cumulativeTop = 0;

                return (
                    <div className="fixed -left-[20000px] top-0 pointer-events-none overflow-hidden bg-black flex justify-start items-start" style={{ width: EXPORT_WIDTH, textAlign: 'left' }}>
                        <div
                            ref={previewRef}
                            className="relative bg-[#0a0a0a]"
                            style={{
                                width: EXPORT_WIDTH,
                                height: 'auto',
                                textAlign: 'left'
                            }}
                        >
                            {sections.map((section, sectionIdx) => {
                                const isPortrait = exportFormat === 'mobile' || exportFormat === 'print';
                                const currentSectionHeight = isPortrait ? exportCoverHeight : DESIGN_HEIGHT;
                                const sectionTop = cumulativeTop;
                                cumulativeTop += currentSectionHeight;

                                const extraHeight = currentSectionHeight - DESIGN_HEIGHT;

                                return (
                                    <div
                                        key={`export-section-${section.id}`}
                                        className="relative overflow-hidden"
                                        style={{
                                            width: EXPORT_WIDTH,
                                            height: currentSectionHeight,
                                            top: 0, // Natural stacking is fine as we use a wrapper, or we can use absolute
                                            backgroundColor: section.backgroundColor || '#0a0a0a',
                                            backgroundImage: section.backgroundUrl ? `url(${section.backgroundUrl})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    >
                                        {/* ORBIT WINGS (Desktop Only) */}
                                        {isDesktop && (
                                            <>
                                                {orbit?.left?.isVisible && orbit.left.elements?.map(element => (
                                                    <AnimatedLayer
                                                        key={`export-orbit-l-${element.id}-${sectionIdx}`}
                                                        layer={element}
                                                        adjustedY={element.y}
                                                        isOpened={true}
                                                        isExportMode={true}
                                                        forceTrigger={true}
                                                    />
                                                ))}

                                                {orbit?.right?.isVisible && orbit.right.elements?.map(element => (
                                                    <div
                                                        key={`export-orbit-r-wrap-${element.id}-${sectionIdx}`}
                                                        className="absolute top-0 right-0 h-full"
                                                        style={{ width: 800 }}
                                                    >
                                                        <AnimatedLayer
                                                            layer={element}
                                                            adjustedY={element.y}
                                                            isOpened={true}
                                                            isExportMode={true}
                                                            forceTrigger={true}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        {/* CORE INVITATION CONTENT (Centered in 1080px if Desktop, Full in 414px if Mobile) */}
                                        <div
                                            className="absolute"
                                            style={{
                                                left: isDesktop ? '50%' : 0,
                                                marginLeft: isDesktop ? -207 : 0,
                                                width: 414,
                                                height: currentSectionHeight,
                                                top: 0
                                            }}
                                        >
                                            {section.elements?.map(element => {
                                                // LIQUID STRETCH PARITY ENGINE
                                                const elAny = element as any;
                                                const elementHeight = element.height || elAny.size?.height || (elAny.textStyle?.fontSize) || 0;
                                                const maxTop = DESIGN_HEIGHT - elementHeight;

                                                let progress = maxTop > 0 ? element.y / maxTop : 0;
                                                progress = Math.max(0, Math.min(1, progress));

                                                const adjustedY = element.y + (extraHeight * progress);

                                                return (
                                                    <AnimatedLayer
                                                        key={`export-el-${element.id}`}
                                                        layer={element}
                                                        adjustedY={adjustedY}
                                                        isOpened={true}
                                                        isExportMode={true}
                                                        forceTrigger={true}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
        </UserEditorLayout>
    );
};

export default UserEditorPage;
