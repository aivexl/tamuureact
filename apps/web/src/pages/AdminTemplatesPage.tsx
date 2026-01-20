import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { templates as templatesApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    // State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'invitation' | 'display'>('invitation');
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

    const handleCreateTemplate = async (type: 'invitation' | 'display') => {
        setIsCreating(true);
        try {
            const newTemplate = {
                name: type === 'display' ? 'New Display Template' : 'New Invitation Template',
                type: type, // KEY DIFFERENCE
                category: 'Premium',
                sections: [],
            };

            const data = await templatesApi.create(newTemplate);
            if (data) {
                // Navigate to the correct editor based on type
                const editorPath = type === 'display'
                    ? `/admin/display-editor/${data.slug || data.id}`
                    : `/admin/editor/${data.slug || data.id}`;
                navigate(editorPath);
            }
        } catch (err) {
            console.error('Create error:', err);
            alert('Failed to create template');
        } finally {
            setIsCreating(false);
            setIsCreateModalOpen(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            await templatesApi.delete(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Delete error:', err);
        }
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
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => setActiveTab('invitation')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'invitation' ? 'bg-teal-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                Mobile Invitations
                            </button>
                            <button
                                onClick={() => setActiveTab('display')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'display' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                TV Displays
                            </button>
                        </div>
                        <p className="text-slate-400 text-lg">
                            {activeTab === 'invitation'
                                ? 'Kelola desain master untuk undangan digital format portrait.'
                                : 'Kelola desain master untuk layar sapaan format landscape.'}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari template..."
                                className="pl-12 pr-6 py-3.5 bg-[#111] border border-white/10 text-white rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3.5 bg-teal-500 text-slate-900 font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredTemplates.map(template => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={template.id}
                                className="group bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:shadow-2xl hover:border-teal-500/30 transition-all duration-500"
                            >
                                {/* Thumbnail */}
                                <div className={`relative overflow-hidden ${template.type === 'display' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                                    {template.thumbnail_url ? (
                                        <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            {template.type === 'display' ? <Monitor className="w-12 h-12 text-slate-700" /> : <Smartphone className="w-12 h-12 text-slate-700" />}
                                        </div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => {
                                                const editorPath = template.type === 'display'
                                                    ? `/admin/display-editor/${template.slug || template.id}`
                                                    : `/admin/editor/${template.slug || template.id}`;
                                                navigate(editorPath);
                                            }}
                                            className="p-3 bg-white rounded-xl hover:scale-110 transition-transform active:scale-90"
                                            title="Edit Template"
                                        >
                                            <Edit3 className="w-5 h-5 text-slate-900" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(template.id, e)}
                                            className="p-3 bg-white rounded-xl hover:scale-110 transition-transform active:scale-90 hover:text-rose-600"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="p-5">
                                    <h3 className="font-bold text-white truncate mb-1">{template.name}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded text-slate-400">
                                            {template.type === 'display' ? 'TV FORMAT' : 'MOBILE FORMAT'}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(template.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
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
                            className="relative bg-white rounded-[2rem] p-8 max-w-3xl w-full shadow-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-slate-900 mb-3">Pilih Tipe Template</h2>
                                <p className="text-slate-500 text-lg">Format apa yang ingin Anda buat hari ini?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Option 1: Mobile */}
                                <button
                                    onClick={() => handleCreateTemplate('invitation')}
                                    disabled={isCreating}
                                    className="group relative flex flex-col bg-slate-50 rounded-3xl border-2 border-slate-100 p-8 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 text-left"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Smartphone className="w-8 h-8 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Undangan Digital</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Standard mobile invitation (390x844). Cocok untuk disebar via WhatsApp ke tamu undangan.
                                    </p>
                                </button>

                                {/* Option 2: Display */}
                                <button
                                    onClick={() => handleCreateTemplate('display')}
                                    disabled={isCreating}
                                    className="group relative flex flex-col bg-slate-50 rounded-3xl border-2 border-slate-100 p-8 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 text-left"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Monitor className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Layar Sapaan (TV)</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Widescreen display (1920x1080). Cocok untuk layar Welcome Screen di pintu masuk venue.
                                    </p>
                                </button>
                            </div>

                            {isCreating && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                                    <PremiumLoader showLabel label="Sedang Membuat Template..." color="#0f172a" />
                                </div>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};
