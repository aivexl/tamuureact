import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { templates as templatesApi } from '@/lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Smartphone,
    Monitor,
    Plus,
    Search,
    Edit3,
    Trash2,
    X,
    FolderOpen
} from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { useStore } from '@/store/useStore';

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

    // Initial Fetch
    useEffect(() => {
        fetchTemplates();
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

    // Filter Logic
    const filteredTemplates = templates.filter(t =>
        (t.type || 'invitation') === activeTab &&
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="min-h-[calc(100vh-100px)]">
                {/* Header Action Area */}
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-10">
                    <div className="w-full md:w-auto text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
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
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 text-slate-900 font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Create New
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
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
                )/* Content Grid */}
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-3xl w-full shadow-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            <div className="text-center mb-8 sm:mb-10">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Pilih Tipe Template</h2>
                                <p className="text-slate-500 text-base sm:text-lg">Format apa yang ingin Anda buat hari ini?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Option 1: Mobile */}
                                <button
                                    onClick={() => handleCreateTemplate('invitation')}
                                    disabled={isCreating}
                                    className="group relative flex flex-col bg-white/5 rounded-3xl border-2 border-white/5 p-6 sm:p-8 hover:border-teal-500 hover:bg-teal-500/5 transition-all duration-300 text-left"
                                >
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 shadow-sm flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                                        <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Undangan Digital</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                        Standard mobile invitation (390x844). Cocok untuk disebar via WhatsApp ke tamu undangan.
                                    </p>
                                </button>

                                {/* Option 2: Display */}
                                <button
                                    onClick={() => handleCreateTemplate('display')}
                                    disabled={isCreating}
                                    className="group relative flex flex-col bg-white/5 rounded-3xl border-2 border-white/5 p-6 sm:p-8 hover:border-purple-500 hover:bg-purple-500/5 transition-all duration-300 text-left"
                                >
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 shadow-sm flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                                        <Monitor className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Layar Sapaan (TV)</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                        Widescreen display (1920x1080). Cocok untuk layar Welcome Screen di pintu masuk venue.
                                    </p>
                                </button>
                            </div>

                            {isCreating && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                                    <PremiumLoader showLabel label="Sedang Membuat Template..." color="#ffffff" />
                                </div>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};