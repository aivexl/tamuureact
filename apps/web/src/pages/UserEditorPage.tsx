import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
// TUTORIAL SYSTEM (INDONESIAN - ENTERPRISE V8)
// ============================================

const TUTORIAL_STEPS = [
    { targetId: 'welcome', title: 'Halo, Selamat Datang!', description: 'Mari kami pandu sebentar untuk memahami cara mengedit undangan impian Anda dengan mudah.', position: 'center' },
    { targetId: 'tutorial-info-card', title: 'Info Undangan', description: 'Kartu ini berisi ringkasan undangan Anda, termasuk link yang bisa disalin.', position: 'bottom' },
    { targetId: 'tutorial-publish-button', title: 'Tombol Publish', description: 'Klik ini jika Anda sudah siap untuk menampilkan undangan ke publik.', position: 'left' },
    { targetId: 'tutorial-draft-button', title: 'Mode Draft', description: 'Gunakan ini untuk menyembunyikan undangan sementara saat masih dalam proses edit.', position: 'left' },
    { targetId: 'tutorial-grid-item-music', title: 'Musik Latar', description: 'Atur lagu romantis yang akan otomatis berputar saat undangan dibuka.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-luckydraw', title: 'Fitur Undian', description: 'Buat tamu makin antusias dengan fitur undian berhadiah di dalam undangan.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-template', title: 'Ganti Desain', description: 'Bosan dengan desain ini? Anda bisa mengganti seluruh tema undangan di sini.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-guests', title: 'Daftar Tamu', description: 'Kelola siapa saja yang diundang dan kirim pesan personal lewat WhatsApp.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-wishes', title: 'Ucapan & Doa', description: 'Kumpulan kata-kata manis dan doa dari para tamu undangan Anda.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-display', title: 'Layar TV', description: 'Khusus untuk ditampilkan di layar besar/proyektor di gedung acara.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-location', title: 'Peta Lokasi', description: 'Pastikan titik lokasi acara Anda akurat agar tamu mudah bernavigasi.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-gift', title: 'Kado Digital', description: 'Masukan nomor rekening atau e-wallet untuk menerima kado secara digital.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-gallery', title: 'Galeri Foto', description: 'Unggah momen-momen indah Anda untuk ditampilkan kepada tamu.', position: 'bottom' },
    { targetId: 'tutorial-grid-item-analytics', title: 'Statistik', description: 'Pantau statistik jumlah pengunjung dan konfirmasi kehadiran tamu.', position: 'bottom' },
    { targetId: 'tutorial-tab-invitation', title: 'Mode Undangan', description: 'Edit konten utama undangan digital Anda di tab ini.', position: 'bottom' },
    { targetId: 'tutorial-tab-orbit', title: 'Mode Cinematic', description: 'Atur elemen cinematic atau "Orbit" untuk tampilan yang lebih mewah.', position: 'bottom' },
    { targetId: 'tutorial-template-area', title: 'Area Edit Konten', description: 'Ini adalah tempat utama Anda mengelola isi undangan secara mendetail.', position: 'top' },
    { targetId: 'tutorial-section-expand', title: 'Buka Bagian', description: 'Klik tombol ini untuk membuka formulir pengeditan isi (teks, gambar, dll).', position: 'right' },
    { targetId: 'tutorial-section-visible', title: 'Tampilkan/Sembunyikan', description: 'Gunakan ikon mata untuk mengatur bagian mana saja yang tampil di undangan.', position: 'left' },
    { targetId: 'tutorial-save-button', title: 'Simpan Perubahan', description: 'Jangan lupa klik tombol ini setelah selesai mengedit agar perubahan tersimpan.', position: 'top' }
];

const TutorialOverlay = ({ onComplete }: { onComplete: () => void }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [availableSteps, setAvailableSteps] = useState<any[]>([{ targetId: 'welcome', title: 'Halo, Selamat Datang!', description: 'Mari kami pandu sebentar untuk memahami cara mengedit undangan impian Anda dengan mudah.', position: 'center' }]);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [isReady, setIsReady] = useState(false);

    // PERSISTENT DISCOVERY: Keep scanning for elements as they render
    useEffect(() => {
        let attempts = 0;
        const interval = setInterval(() => {
            const filtered = TUTORIAL_STEPS.filter(s => {
                if (s.targetId === 'welcome') return true;
                const el = document.getElementById(s.targetId);
                return el && el.offsetWidth > 0;
            });

            if (filtered.length > availableSteps.length || (attempts === 0 && filtered.length > 0)) {
                setAvailableSteps(filtered);
                setIsReady(true);
            }
            if (attempts > 100) clearInterval(interval);
            attempts++;
        }, 200);
        return () => clearInterval(interval);
    }, [availableSteps.length]);

    const currentStep = availableSteps[stepIndex];

    useEffect(() => {
        if (!currentStep || currentStep.targetId === 'welcome') {
            setCoords(null);
            return;
        }

        const update = () => {
            const el = document.getElementById(currentStep.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0) {
                    setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
                }
            }
        };

        const el = document.getElementById(currentStep.targetId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const timer = setTimeout(update, 600);
            window.addEventListener('resize', update);
            return () => { clearTimeout(timer); window.removeEventListener('resize', update); };
        }
    }, [stepIndex, currentStep]);

    if (!currentStep) return null;

    const getCardStyle = () => {
        const cardWidth = Math.min(window.innerWidth - 32, 280);
        const cardHeight = 180;
        const padding = 16;

        if (!coords || currentStep.targetId === 'welcome') {
            return { top: (window.innerHeight / 2) - (cardHeight / 2), left: (window.innerWidth / 2) - (cardWidth / 2), width: cardWidth, opacity: 1, scale: 1 };
        }
        
        let top = 0, left = 0;
        if (currentStep.position === 'bottom') { top = coords.top + coords.height + 12; left = coords.left + (coords.width / 2) - (cardWidth / 2); }
        else if (currentStep.position === 'top') { top = coords.top - cardHeight - 12; left = coords.left + (coords.width / 2) - (cardWidth / 2); }
        else if (currentStep.position === 'right') { top = coords.top + (coords.height / 2) - (cardHeight / 2); left = coords.left + coords.width + 12; }
        else if (currentStep.position === 'left') { top = coords.top + (coords.height / 2) - (cardHeight / 2); left = coords.left - cardWidth - 12; }

        return { top: Math.max(padding, Math.min(window.innerHeight - cardHeight - padding, top)), left: Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, left)), width: cardWidth, opacity: 1, scale: 1 };
    };

    const card = (
        <div className="fixed inset-0 z-[1000000] pointer-events-none overflow-hidden">
            <AnimatePresence mode="wait">
                <m.div
                    key={currentStep.targetId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={getCardStyle()}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute bg-slate-900 text-white rounded-[1.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] p-6 pointer-events-auto border border-white/10 flex flex-col"
                    style={{ position: 'fixed' }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-400">{currentStep.title}</h4>
                        <button onClick={onComplete} className="p-1.5 hover:bg-white/10 rounded-full text-white/40"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-[60px] max-h-[120px] mb-6">
                        <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{currentStep.description}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-1">
                            {stepIndex > 0 && <button onClick={() => setStepIndex(s => s - 1)} className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white transition-all">Kembali</button>}
                            <button onClick={onComplete} className="px-2 py-1 text-[10px] font-bold text-slate-500">Skip</button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-slate-600">{stepIndex + 1}/{availableSteps.length}</span>
                            <button onClick={() => stepIndex < availableSteps.length - 1 ? setStepIndex(s => s + 1) : onComplete()} className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg">
                                {stepIndex === availableSteps.length - 1 ? 'Selesai' : 'Lanjut'}
                            </button>
                        </div>
                    </div>
                    {coords && currentStep.targetId !== 'welcome' && (
                        <m.div animate={{ rotate: 45 }} className={`absolute w-3 h-3 bg-slate-900 border-white/10 ${currentStep.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l' : currentStep.position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r' : currentStep.position === 'right' ? 'top-1/2 -left-1.5 -translate-y-1/2 border-b border-l' : 'top-1/2 -right-1.5 -translate-y-1/2 border-t border-r'}`} />
                    )}
                </m.div>
            </AnimatePresence>
        </div>
    );

    return createPortal(card, document.body);
};

export const UserEditorPage: React.FC<{ mode?: 'invitation' | 'welcome' }> = ({ mode = 'invitation' }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { id: currentStoredId, hasHydrated, resetStore, resetSections, clearLayers, hydrateProject, setSections, setOrbitLayers, setActiveSection, activeSectionId, sections, orbit, exportFormat, isPublished } = useStore();

    if (mode === 'welcome') return <div className="w-full h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-premium-dark overflow-hidden font-outfit"><EditorLayout templateId={id} isTemplate={false} isDisplayDesign={true} /></div>;

    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<any>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const hasAttemptedRef = useRef<string | null>(null);

    useEffect(() => {
        const loadInvitation = async () => {
            if (!id || hasAttemptedRef.current === id) return;
            hasAttemptedRef.current = id;
            setLoading(true);
            if (hasHydrated && currentStoredId !== id) { resetStore(); resetSections(); clearLayers(); }
            try {
                const data = await invitationsApi.get(id);
                hydrateProject(data);
                setSections(data.sections || []);
                if (data.orbit_layers) setOrbitLayers(data.orbit_layers);
                setInvitation({ id: data.id, title: data.name, slug: data.slug, is_published: !!data.is_published, status: data.is_published ? "Published" : "Draft", thumbnailUrl: data.thumbnail_url, category: data.category });
                if (data.sections?.length > 0 && !activeSectionId) setActiveSection(data.sections[0].id);
                
                // FORCE RESET V8 TO GUARANTEE APPEARANCE
                if (!localStorage.getItem(`tutorial_seen_v8_${id}`)) {
                    setTimeout(() => setShowTutorial(true), 1500);
                }
            } catch (err) { hasAttemptedRef.current = null; } finally { setLoading(false); }
        };
        if (hasHydrated) loadInvitation();
    }, [id, hasHydrated]);

    const completeTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem(`tutorial_seen_v8_${id}`, 'true');
    };

    if (loading) return <PremiumLoader showLabel label="Menyiapkan Editor..." />;
    if (!invitation) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4"><AlertCircle className="w-12 h-12 text-red-400" /><p className="text-slate-600 font-medium">Undangan tidak ditemukan</p><button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium">Kembali</button></div>;

    return (
        <UserEditorLayout>
            <SmartFontInjector />
            <div className="max-w-4xl mx-auto p-2 sm:p-6 pb-24 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <InvitationInfoCard invitation={{ ...invitation, is_published: isPublished, status: isPublished ? "Published" : "Draft" }} onShare={() => setActivePanel('share')} onSettings={() => setActivePanel('settings')} />
                <IconGridMenu onOpenPanel={(panelId: string) => { if (panelId === 'guests') window.location.href = `/guests/${id}`; else setActivePanel(panelId); }} />
                <TemplateEditArea />
            </div>
            {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}
            <Modal isOpen={activePanel !== null} onClose={() => setActivePanel(null)} title={activePanel || ''} size="lg">
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
                {activePanel === 'settings' && <SettingsPanel invitationId={invitation?.id} invitation={invitation} onClose={() => setActivePanel(null)} onUpdated={(updates) => setInvitation((prev: any) => ({ ...prev, ...updates }))} />}
            </Modal>
        </UserEditorLayout>
    );
};

export default UserEditorPage;
