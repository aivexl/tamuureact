import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
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
import { LuckyDrawPanel } from '@/components/UserEditor/Panels/LuckyDrawPanel';
import { SettingsPanel } from '@/components/UserEditor/Panels/SettingsPanel';
import { LoveStoryPanel } from '@/components/UserEditor/Panels/LoveStoryPanel';
import { QuotesPanel } from '@/components/UserEditor/Panels/QuotesPanel';
import { ProfilePhotoPanel } from '@/components/UserEditor/Panels/ProfilePhotoPanel';
import { AnimatedLayer } from '@/components/Preview/AnimatedLayer';
import { useStore } from '@/store/useStore';
import { invitations as invitationsApi } from '@/lib/api';
import { Sparkles, AlertCircle, Clock, ChevronRight, ChevronLeft, X, Info, Layout as LayoutIcon, Eye } from 'lucide-react';
import { useSubscriptionTimer } from '../hooks/useSubscriptionTimer';


import { SubscriptionStatusWidget } from '../components/ui/SubscriptionStatusWidget';

// ============================================
// TUTORIAL SYSTEM (INDONESIAN - ENTERPRISE V3)
// ============================================

const TUTORIAL_STEPS = [
    {
        targetId: 'tutorial-info-card',
        title: 'Info Undangan',
        description: 'Kelola status publikasi dan bagikan link undangan Anda di sini.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-music',
        title: 'Musik Latar',
        description: 'Pilih lagu romantis untuk mengiringi tamu saat membuka undangan.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-luckydraw',
        title: 'Undian / Doorprize',
        description: 'Buat acara makin seru dengan fitur undian berhadiah untuk tamu.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-template',
        title: 'Ganti Template',
        description: 'Ingin suasana baru? Anda bisa mengganti desain seluruh undangan di sini.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-guests',
        title: 'Manajemen Tamu',
        description: 'Kelola daftar nama tamu dan kirim link undangan personal via WhatsApp.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-wishes',
        title: 'Ucapan & Doa',
        description: 'Lihat dan kelola semua ucapan manis dari keluarga dan teman.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-display',
        title: 'Display TV',
        description: 'Atur tampilan layar besar/TV untuk di venue acara.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-location',
        title: 'Lokasi Acara',
        description: 'Atur koordinat Google Maps agar tamu tidak tersesat.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-gift',
        title: 'Kado Digital',
        description: 'Atur nomor rekening atau dompet digital untuk mempermudah tamu memberi kado.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-gallery',
        title: 'Galeri Foto',
        description: 'Unggah foto-foto pre-wedding terbaik Anda di sini.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-livestream',
        title: 'Live Streaming',
        description: 'Bagikan link siaran langsung acara Anda untuk tamu yang berhalangan hadir.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-analytics',
        title: 'Analitik Tamu',
        description: 'Pantau berapa banyak orang yang sudah membuka undangan Anda.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-download',
        title: 'Download Aset',
        description: 'Unduh aset undangan dalam format gambar atau PDF.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-template-area',
        title: 'Area Konten',
        description: 'Scroll ke bawah untuk mengedit teks dan gambar di setiap bagian undangan.',
        position: 'top'
    },
    {
        targetId: 'tutorial-section-expand',
        title: 'Edit Detail',
        description: 'Klik ikon ini untuk membuka formulir pengeditan bagian tersebut.',
        position: 'right'
    },
    {
        targetId: 'tutorial-section-visible',
        title: 'Atur Tampilan',
        description: 'Sembunyikan bagian yang tidak ingin Anda tampilkan sementara waktu.',
        position: 'left'
    }
];

const TutorialOverlay = ({ onComplete }: { onComplete: () => void }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [availableSteps, setAvailableSteps] = useState<any[]>([]);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [isReady, setIsReady] = useState(false);
    const retryCountRef = useRef(0);

    // ROBUST DISCOVERY LOGIC: Scan DOM until elements are actually painted
    useEffect(() => {
        const scan = () => {
            const filtered = TUTORIAL_STEPS.filter(s => {
                const el = document.getElementById(s.targetId);
                // On Enterprise level, we check visibility and existence
                return el !== null;
            });

            if (filtered.length > 0) {
                setAvailableSteps(filtered);
                setIsReady(true);
            } else if (retryCountRef.current < 30) { // Retry for 3 seconds
                retryCountRef.current++;
                setTimeout(scan, 100);
            } else {
                onComplete();
            }
        };

        scan();
    }, [onComplete]);

    const currentStep = availableSteps[stepIndex];

    // Reactive coordinate tracking
    useEffect(() => {
        if (!isReady || !currentStep) return;

        const update = () => {
            const el = document.getElementById(currentStep.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setCoords({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            }
        };

        // Aggressive update for first few frames
        update();
        const timers = [
            setTimeout(update, 50),
            setTimeout(update, 200),
            setTimeout(update, 500)
        ];

        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true); // Capture scroll
        return () => {
            timers.forEach(t => clearTimeout(t));
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [stepIndex, currentStep?.targetId, isReady]);

    const handleNext = () => {
        if (stepIndex < availableSteps.length - 1) {
            setStepIndex(s => s + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(s => s - 1);
        }
    };

    if (!isReady || !currentStep) return null;

    const getCardStyle = () => {
        // Fallback style if coords not yet ready to prevent blank screen
        if (!coords) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 };

        const cardWidth = Math.min(window.innerWidth - 32, 300);
        const cardHeight = 180; 
        const padding = 16;
        
        let top = 0;
        let left = 0;

        if (currentStep.position === 'bottom') {
            top = coords.top + coords.height + 12;
            left = coords.left + (coords.width / 2) - (cardWidth / 2);
        } else if (currentStep.position === 'top') {
            top = coords.top - cardHeight - 12;
            left = coords.left + (coords.width / 2) - (cardWidth / 2);
        } else if (currentStep.position === 'right') {
            top = coords.top + (coords.height / 2) - (cardHeight / 2);
            left = coords.left + coords.width + 12;
        } else if (currentStep.position === 'left') {
            top = coords.top + (coords.height / 2) - (cardHeight / 2);
            left = coords.left - cardWidth - 12;
        }

        return {
            top: Math.max(padding, Math.min(window.innerHeight - cardHeight - padding, top)),
            left: Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, left)),
            width: cardWidth
        };
    };

    return (
        <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden">
            <AnimatePresence mode="wait">
                <m.div
                    key={currentStep.targetId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                        opacity: coords ? 1 : 0, 
                        scale: coords ? 1 : 0.9, 
                        ...getCardStyle() 
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute bg-slate-900 text-white rounded-[1.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] p-6 pointer-events-auto border border-white/10 flex flex-col"
                    style={{ position: 'fixed' }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] font-black tracking-[0.2em] uppercase text-indigo-400">
                            {currentStep.title}
                        </h4>
                        <button onClick={onComplete} className="p-1.5 hover:bg-white/10 rounded-full text-white/40 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1">
                        <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                            {currentStep.description}
                        </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {stepIndex > 0 && (
                                <button 
                                    onClick={handlePrev}
                                    className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    Back
                                </button>
                            )}
                            <button 
                                onClick={onComplete}
                                className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
                            >
                                Skip
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-600 font-mono">{stepIndex + 1}/{availableSteps.length}</span>
                            <button
                                onClick={handleNext}
                                className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
                            >
                                {stepIndex === availableSteps.length - 1 ? 'Finish' : 'Next'}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {coords && (
                        <m.div 
                            animate={{ rotate: 45 }}
                            className={`absolute w-3.5 h-3.5 bg-slate-900 border-white/10 ${
                                currentStep.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l' :
                                currentStep.position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r' :
                                currentStep.position === 'right' ? 'top-1/2 -left-1.5 -translate-y-1/2 border-b border-l' :
                                'top-1/2 -right-1.5 -translate-y-1/2 border-t border-r'
                            }`}
                        />
                    )}
                </m.div>
            </AnimatePresence>
        </div>
    );
};

interface UserEditorPageProps {
    mode?: 'invitation' | 'welcome';
}

export const UserEditorPage: React.FC<UserEditorPageProps> = ({ mode = 'invitation' }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentStoredId = useStore(s => s.id);
    const hasHydrated = useStore(s => s.hasHydrated);

    const resetStore = useStore(s => s.resetStore);
    const resetSections = useStore(s => s.resetSections);
    const clearLayers = useStore(s => s.clearLayers);
    const hydrateProject = useStore(s => s.hydrateProject);
    const setSections = useStore(s => s.setSections);
    const setOrbitLayers = useStore(s => s.setOrbitLayers);
    const setActiveSection = useStore(s => s.setActiveSection);

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
    const [showTutorial, setShowTutorial] = useState(false);

    const user = useStore(s => s.user);
    const subStatus = useSubscriptionTimer(invitation?.expires_at || user?.expiresAt || null);
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const hasAttemptedRef = useRef<string | null>(null);

    useEffect(() => {
        const loadInvitation = async () => {
            if (!id || hasAttemptedRef.current === id) return;
            hasAttemptedRef.current = id;

            setLoading(true);
            setError(null);

            if (hasHydrated && currentStoredId !== id) {
                resetStore();
                resetSections();
                clearLayers();
            }

            try {
                const data = await invitationsApi.get(id);
                hydrateProject(data);
                setSections(data.sections || []);
                if (data.orbit_layers) setOrbitLayers(data.orbit_layers);

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

                // Check tutorial visibility - Force Enterprise Reset V3
                const hasSeenTutorial = localStorage.getItem(`tutorial_seen_v3_${id}`);
                if (!hasSeenTutorial) {
                    setShowTutorial(true); 
                }
            } catch (err) {
                setError('Undangan tidak ditemukan.');
                hasAttemptedRef.current = null;
            } finally {
                setLoading(false);
            }
        };

        if (hasHydrated) {
            loadInvitation();
        }
    }, [id, hasHydrated]);

    const completeTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem(`tutorial_seen_v3_${id}`, 'true');
    };

    if (loading) {
        return <PremiumLoader showLabel label="Menyiapkan Editor Anda..." />;
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-slate-600 font-medium">{error || 'Undangan tidak ditemukan'}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    return (
        <UserEditorLayout>
            <SmartFontInjector />
            <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <InvitationInfoCard
                    invitation={{ ...invitation, is_published: isPublished, status: isPublished ? "Published" : "Draft" }}
                    onShare={() => setActivePanel('share')}
                    onSettings={() => setActivePanel('settings')}
                />
                <IconGridMenu onOpenPanel={(panelId: string) => {
                    if (panelId === 'guests') window.location.href = `/guests/${id}`;
                    else setActivePanel(panelId);
                }} />
                <TemplateEditArea />
            </div>

            {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}

            <Modal
                isOpen={activePanel !== null}
                onClose={() => setActivePanel(null)}
                title={(() => {
                    const titles: Record<string, string> = {
                        music: 'Musik Latar', template: 'Template', wishes: 'Ucapan',
                        display: 'Display', analytics: 'Analitik', share: 'Bagikan',
                        download: 'Download', eventDate: 'Tanggal', location: 'Lokasi',
                        gift: 'Kado', seo: 'Sosmed', gallery: 'Galeri',
                        livestream: 'Live', lovestory: 'Kisah', quotes: 'Quote',
                        luckydraw: 'Undian', settings: 'Pengaturan', profile_photo: 'Profil'
                    };
                    return titles[activePanel || ''] || '';
                })()}
                size="lg"
            >
                {activePanel === 'music' && <MusicPanel />}
                {activePanel === 'display' && <DisplayStorePanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'template' && <TemplateStorePanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'wishes' && <WishesPanel />}
                {activePanel === 'analytics' && <AnalyticsPanel />}
                {activePanel === 'share' && <SharePanel slug={invitation?.slug} />}
                {activePanel === 'download' && <ExportPanel previewRef={previewRef as React.RefObject<HTMLElement>} />}
                {activePanel === 'seo' && <SEOPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'gallery' && <GalleryPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'livestream' && <LiveStreamPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'luckydraw' && <LuckyDrawPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'eventDate' && <EventDatePanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'location' && <LocationPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'gift' && <GiftPanel onClose={() => setActivePanel(null)} />}
                {activePanel === 'lovestory' && <LoveStoryPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'quotes' && <QuotesPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'profile_photo' && <ProfilePhotoPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'settings' && (
                    <SettingsPanel
                        invitationId={invitation?.id}
                        invitation={invitation}
                        onClose={() => setActivePanel(null)}
                        onUpdated={(updates) => setInvitation((prev: any) => ({ ...prev, ...updates }))}
                    />
                )}
            </Modal>
        </UserEditorLayout>
    );
};

export default UserEditorPage;
