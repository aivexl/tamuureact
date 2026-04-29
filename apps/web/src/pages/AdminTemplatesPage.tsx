import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { templates as templatesApi, storage, safeFetch, API_BASE } from '@/lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Smartphone,
    Monitor,
    Plus,
    Search,
    Edit3,
    Trash2,
    X,
    FolderOpen,
    Image as ImageIcon,
    LayoutTemplate,
    UploadCloud,
    Globe,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { useStore } from '@/store/useStore';
import { toast } from 'react-hot-toast';
import { compressImageToFile, shouldCompress } from '@/lib/image-compress';

interface Template {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    category?: string;
    updated_at: string;
    type?: 'invitation' | 'display';
    sourceTable: 'templates' | 'invitations';
}

export const AdminTemplatesPage: React.FC = () => {
    const { showModal } = useStore();
    const navigate = useNavigate();
    const { type } = useParams<{ type: string }>();

    // State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const activeTab = (type === 'display' ? 'display' : 'invitation') as 'invitation' | 'display';
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Sub-tab state for Invitation Templates
    const [subTab, setSubTab] = useState<'all' | 'carousel'>('all');

    // Carousel State
    const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
    const [loadingCarousel, setLoadingCarousel] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newSlide, setNewSlide] = useState({ image_url: '', link_url: '', alt_text: '', is_active: 1, order_index: 1 });

    // Update order_index when carouselSlides changes
    useEffect(() => {
        setNewSlide(prev => ({ ...prev, order_index: carouselSlides.length + 1 }));
    }, [carouselSlides.length]);

    // Initial Fetch
    useEffect(() => {
        fetchTemplates();
        fetchCarousel();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await templatesApi.list();
            const processed = (data || []).map((t: any) => ({
                ...t,
                sourceTable: 'templates' as const,
                type: t.type || 'invitation' // Default to invitation if missing
            }));
            setTemplates(processed);
        } catch (err) {
            console.error('[Admin] Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCarousel = async () => {
        setLoadingCarousel(true);
        try {
            const res = await safeFetch(`${API_BASE}/api/invitations/carousel`);
            if (res.ok) {
                const data = await res.json();
                setCarouselSlides(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCarousel(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // OPTIMIZATION: Enterprise Image Compression
            let fileToUpload = file;
            if (shouldCompress(file)) {
                toast.loading('Optimizing image...', { id: 'img-opt' });
                try {
                    fileToUpload = await compressImageToFile(file, { quality: 0.8, maxWidth: 1600 });
                    toast.success('Image optimized!', { id: 'img-opt' });
                } catch (err) {
                    console.warn('Compression failed, using original', err);
                    toast.dismiss('img-opt');
                }
            }

            const result = await storage.upload(fileToUpload, 'gallery');
            if (result.url) {
                setNewSlide(prev => ({ ...prev, image_url: result.url }));
                toast.success('Image uploaded successfully');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateTemplate = async (createType: 'invitation' | 'display') => {
        setIsCreating(true);
        try {
            const newTemplate = {
                name: createType === 'display' ? 'New Display Template' : 'New Invitation Template',
                type: createType, // KEY DIFFERENCE
                category: 'Premium',
                sections: [],
            };

            const data = await templatesApi.create(newTemplate);
            if (data) {
                // Navigate to the correct editor based on type
                const editorPath = createType === 'display'
                    ? `/admin/display-editor/${data.slug || data.id}`
                    : `/admin/editor/${data.slug || data.id}`;
                navigate(editorPath);
            }
        } catch (err: any) {
            console.error('Create error:', err);
            showModal({
                title: 'Gagal Membuat',
                message: err.message || 'Gagal membuat template baru. Silakan coba lagi.',
                type: 'error'
            });
        } finally {
            setIsCreating(false);
            setIsCreateModalOpen(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        showModal({
            title: 'Hapus Template?',
            message: 'Apakah Anda yakin ingin menghapus template ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            onConfirm: async () => {
                try {
                    await templatesApi.delete(id);
                    setTemplates(prev => prev.filter(t => t.id !== id));
                    showModal({
                        title: 'Berhasil',
                        message: 'Template telah dihapus.',
                        type: 'success'
                    });
                } catch (err: any) {
                    console.error('Delete error:', err);
                    showModal({
                        title: 'Gagal Menghapus',
                        message: err.message || 'Terjadi kesalahan saat menghapus template.',
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleSaveCarousel = async (item: any, action: 'create' | 'update' | 'delete') => {
        try {
            const res = await safeFetch(`${API_BASE}/api/admin/invitations/carousel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, item })
            });
            if (res.ok) {
                toast.success(`Slide berhasil di${action === 'create' ? 'tambahkan' : action === 'update' ? 'perbarui' : 'hapus'}`);
                fetchCarousel();
            } else {
                throw new Error('Failed to save carousel');
            }
        } catch (err) {
            toast.error('Gagal menyimpan slide');
        }
    };

    const handleMoveCarouselSlide = async (index: number, direction: 'up' | 'down') => {
        const newSlides = [...carouselSlides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newSlides.length) return;

        // Swap
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

        // Update order indices (1-based)
        const reorderPayload = newSlides.map((s, idx) => ({
            id: s.id,
            order_index: idx + 1
        }));

        // Optimistic UI update
        setCarouselSlides(newSlides.map((s, idx) => ({ ...s, order_index: idx + 1 })));

        try {
            await safeFetch(`${API_BASE}/api/admin/invitations/carousel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reorder', items: reorderPayload })
            });
            toast.success('Urutan slide diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui urutan');
            fetchCarousel(); // Rollback
        }
    };

    // Filter Logic
    const filteredTemplates = templates.filter(t =>
        (t.type || 'invitation') === activeTab &&
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCarouselTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 h-fit">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Tambah Slide</h3>
                <div className="space-y-4">
                    <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5 relative group mb-2">
                        {newSlide.image_url ? (
                            <img src={newSlide.image_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Upload Banner Preview</span>
                            </div>
                        )}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white"
                        >
                            <UploadCloud className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                        </button>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Manual URL (Optional)</label>
                        <input 
                            type="text" 
                            value={newSlide.image_url}
                            onChange={e => setNewSlide({ ...newSlide, image_url: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                            <Globe className="w-3 h-3" /> Alt Text (SEO)
                        </label>
                        <input 
                            type="text" 
                            value={newSlide.alt_text}
                            onChange={e => setNewSlide({ ...newSlide, alt_text: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                            placeholder="Contoh: Undangan Pernikahan Digital Elegant"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Link URL</label>
                        <input 
                            type="text" 
                            value={newSlide.link_url}
                            onChange={e => setNewSlide({ ...newSlide, link_url: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm"
                            placeholder="/preview/judul-undangan"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Urutan (Auto-Increment)</label>
                        <input 
                            type="number" 
                            value={newSlide.order_index}
                            readOnly
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-500 text-sm font-bold"
                        />
                    </div>
                    <button 
                        disabled={isUploading || !newSlide.image_url}
                        onClick={() => {
                            handleSaveCarousel(newSlide, 'create');
                            setNewSlide({ image_url: '', link_url: '', alt_text: '', is_active: 1, order_index: carouselSlides.length + 2 });
                        }} 
                        className="w-full py-4 bg-teal-500 text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-teal-400 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Menunggu Upload...' : 'Tambah Slide'}
                    </button>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {carouselSlides.length === 0 && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                        <LayoutTemplate className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-slate-400">Belum ada slide di Carousel Invitations</p>
                    </div>
                )}
                {carouselSlides.map((slide, idx) => (
                    <InvitationCarouselRow 
                        key={slide.id || idx} 
                        slide={slide} 
                        index={idx}
                        totalSlides={carouselSlides.length}
                        onMove={handleMoveCarouselSlide}
                        onSave={(item) => handleSaveCarousel(item, 'update')}
                        onDelete={(item) => {
                            if (window.confirm('Hapus slide ini?')) handleSaveCarousel(item, 'delete');
                        }}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="min-h-[calc(100vh-100px)]">
                {/* Header Action Area */}
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-5">
                    <div className="w-full md:w-auto text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${activeTab === 'invitation' ? 'bg-teal-50 shadow-teal-500/20' : 'bg-purple-50 shadow-purple-500/20'}`}>
                                {activeTab === 'invitation' ? (
                                    <Smartphone className="w-6 h-6 text-teal-600" />
                                ) : (
                                    <Monitor className="w-6 h-6 text-purple-600" />
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-outfit">
                                {activeTab === 'invitation' ? 'Template Undangan' : 'Template Display'}
                            </h2>
                        </div>
                        <p className="text-slate-400 text-sm sm:text-lg">
                            {activeTab === 'invitation'
                                ? 'Kelola desain master untuk undangan digital format portrait.'
                                : 'Kelola desain master untuk layar sapaan format landscape.'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {subTab === 'all' && (
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Cari template..."
                                    className="w-full sm:w-auto pl-12 pr-6 py-3.5 bg-[#111] border border-white/10 text-white rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none shadow-sm"
                                />
                            </div>
                        )}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 text-slate-900 font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Create New
                        </button>
                    </div>
                </div>

                {activeTab === 'invitation' && (
                    <div className="flex gap-2 border-b border-white/10 pb-1 mb-5 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setSubTab('all')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                                subTab === 'all' ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <FolderOpen className="w-4 h-4" /> Semua Template
                        </button>
                        <button
                            onClick={() => setSubTab('carousel')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                                subTab === 'carousel' ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <ImageIcon className="w-4 h-4" /> Carousel Store
                        </button>
                    </div>
                )}

                {/* Content Grid */}
                {subTab === 'carousel' && activeTab === 'invitation' ? (
                    renderCarouselTab()
                ) : (
                    isLoading ? (
                        <PremiumLoader showLabel label="Memuat Template..." />
                    ) : filteredTemplates.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                            <FolderOpen className="w-12 h-12 text-slate-500 mb-4" />
                            <p className="text-slate-400 font-medium">No templates created yet.</p>
                            <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 text-teal-400 font-bold hover:underline">Create One</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                            {filteredTemplates.map(template => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={template.id}
                                    className="group bg-[#0D0D0D] rounded-xl border border-white/5 overflow-hidden hover:border-teal-500/40 transition-all duration-300 flex flex-col"
                                >
                                    {/* Compact Thumbnail */}
                                    <div className={`relative overflow-hidden bg-[#151515] ${template.type === 'display' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                                        {template.thumbnail_url ? (
                                            <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-20">
                                                {template.type === 'display' ? <Monitor className="w-8 h-8 text-white" /> : <Smartphone className="w-8 h-8 text-white" />}
                                            </div>
                                        )}

                                        {/* Type Badge (Floating Top Right) */}
                                        <div className="absolute top-2 right-2">
                                            <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white/60 border border-white/10">
                                                {template.type === 'display' ? 'TV' : 'MOB'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                                        <div className="mb-3">
                                            <h3 className="text-xs sm:text-sm font-bold text-white/90 truncate leading-tight mb-3" title={template.name}>
                                                {template.name}
                                            </h3>

                                            {/* Persistent Sharp Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const editorPath = template.type === 'display'
                                                            ? `/admin/display-editor/${template.slug || template.id}`
                                                            : `/admin/editor/${template.slug || template.id}`;
                                                        navigate(editorPath);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-slate-900 transition-all duration-200 rounded-lg text-[10px] font-black uppercase tracking-wider"
                                                >
                                                    <Edit3 className="w-3 h-3" /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(template.id, e)}
                                                    className="w-10 flex items-center justify-center py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-200 rounded-lg"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Ultra Muted Footer Info */}
                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-white/20 uppercase tracking-[0.1em]">
                                            <span>ID: {template.id.substring(0, 6)}</span>
                                            <span>{new Date(template.updated_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111] rounded-3xl max-w-sm w-full overflow-hidden border border-white/10"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Buat Template Baru</h3>
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleCreateTemplate('invitation')}
                                        disabled={isCreating}
                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-teal-500/10 hover:border-teal-500/50 border border-transparent transition-all group disabled:opacity-50"
                                    >
                                        <Smartphone className="w-8 h-8 text-slate-400 group-hover:text-teal-400" />
                                        <span className="text-sm font-bold text-white">Undangan</span>
                                    </button>
                                    <button
                                        onClick={() => handleCreateTemplate('display')}
                                        disabled={isCreating}
                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/50 border border-transparent transition-all group disabled:opacity-50"
                                    >
                                        <Monitor className="w-8 h-8 text-slate-400 group-hover:text-purple-400" />
                                        <span className="text-sm font-bold text-white">Display</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

const InvitationCarouselRow: React.FC<{ 
    slide: any, 
    index: number,
    totalSlides: number,
    onMove: (idx: number, dir: 'up' | 'down') => void,
    onSave: (slide: any) => void, 
    onDelete: (slide: any) => void 
}> = ({ slide, index, totalSlides, onMove, onSave, onDelete }) => {
    const [localSlide, setLocalSlide] = useState(slide);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalSlide(slide);
        setHasChanges(false);
    }, [slide]);

    const updateField = (field: string, value: any) => {
        setLocalSlide({ ...localSlide, [field]: value });
        setHasChanges(true);
    };

    return (
        <div className="bg-[#111] border border-white/5 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 group">
            <div className="w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-white/5">
                <img src={localSlide.image_url} alt="Slide" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 w-full space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 block">Alt Text (SEO)</label>
                        <input 
                            type="text" 
                            value={localSlide.alt_text || ''}
                            onChange={e => updateField('alt_text', e.target.value)}
                            className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-white text-[10px]"
                            placeholder="Alt text..."
                        />
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 block">Link URL</label>
                        <input 
                            type="text" 
                            value={localSlide.link_url || ''}
                            onChange={e => updateField('link_url', e.target.value)}
                            className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-slate-400 text-[10px]"
                            placeholder="Link..."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-2">
                        <span className="uppercase tracking-widest text-[8px] font-black text-slate-600">Urutan (Auto):</span>
                        <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="uppercase tracking-widest text-[8px] font-black text-slate-600">Status:</span>
                        <button 
                            onClick={() => updateField('is_active', localSlide.is_active ? 0 : 1)}
                            className={localSlide.is_active ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}
                        >
                            {localSlide.is_active ? 'AKTIF' : 'NONAKTIF'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                <div className="flex gap-1 mb-1 justify-center sm:justify-start">
                    <button 
                        onClick={() => onMove(index, 'up')}
                        disabled={index === 0}
                        className={`p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors ${index === 0 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onMove(index, 'down')}
                        disabled={index === totalSlides - 1}
                        className={`p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors ${index === totalSlides - 1 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                </div>
                <button 
                    onClick={() => {
                        onSave(localSlide);
                        setHasChanges(false);
                    }}
                    disabled={!hasChanges}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${hasChanges ? 'bg-teal-500 text-slate-900' : 'bg-white/5 text-slate-600 opacity-50 cursor-not-allowed'}`}
                >
                    Simpan
                </button>
                <button 
                    onClick={() => onDelete(localSlide)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Hapus
                </button>
            </div>
        </div>
    );
};