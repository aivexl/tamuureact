import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    Search,
    Sparkles,
    Eye,
    Loader2,
    Heart,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Template {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    category?: string;
    price?: number;
}

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Event', 'Classic', 'Floral'];

export const InvitationsStorePage: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('templates')
                .select('id, name, slug, thumbnail_url, category')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error('Failed to fetch store templates:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
            const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [templates, selectedCategory, searchQuery]);

    const handleUseTemplate = (templateId: string) => {
        // Redirect to editor with templateId
        navigate(`/editor/template/${templateId}`);
    };

    const previewTemplate = (slug: string | undefined, id: string) => {
        window.open(`/preview/${slug || id}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* Mesh Gradient Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Hero Header */}
                <header className="pt-32 pb-16 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-slate-200 rounded-full shadow-sm mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-[#FFBF00]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Koleksi Desain Mahakarya</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black tracking-tighter mb-10 text-slate-900"
                        >
                            Pilih Desain <span className="text-[#FFBF00]">Terbaik</span> Untuk Momen Anda
                        </motion.h1>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative max-w-2xl mx-auto mb-12 group"
                        >
                            <div className="absolute inset-0 bg-[#FFD700]/10 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-100 overflow-hidden flex items-center p-2 focus-within:ring-4 focus-within:ring-[#FFBF00]/10 transition-all duration-500">
                                <Search className="w-6 h-6 text-slate-400 ml-6" />
                                <input
                                    type="text"
                                    placeholder="Cari tema atau kategori..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-lg font-medium text-slate-700 placeholder:text-slate-300"
                                />
                                <button className="bg-slate-900 text-white p-4 rounded-[1.5rem] hover:bg-[#FFBF00] hover:text-slate-900 transition-all shadow-lg">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>

                        {/* Categories */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-3"
                        >
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedCategory === cat
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10'
                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </motion.div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 pb-32">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="w-12 h-12 text-[#FFBF00] animate-spin mb-6" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyiapkan Galeri Digital...</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-slate-100">
                            <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Desain Tidak Ditemukan</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto">Kami tidak dapat menemukan desain yang sesuai dengan kata kunci Anda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredTemplates.map((template) => (
                                    <motion.div
                                        key={template.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#FFBF00]/30 transition-all duration-500"
                                    >
                                        {/* Thumbnail Area */}
                                        <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                                            {template.thumbnail_url ? (
                                                <img
                                                    src={template.thumbnail_url}
                                                    alt={template.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                                                    <Sparkles className="w-12 h-12" />
                                                </div>
                                            )}

                                            {/* Hover Like Overlay (Optional) */}
                                            <div className="absolute top-4 right-4">
                                                <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                                                    <Heart className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Category Tag */}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                    {template.category || 'Premium'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info & Actions */}
                                        <div className="p-6">
                                            <div className="mb-6">
                                                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#FFBF00] transition-colors">{template.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[#FFBF00] rounded-full" />
                                                    High-Quality Template
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                <button
                                                    onClick={() => handleUseTemplate(template.id)}
                                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FFBF00] hover:text-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                                >
                                                    Gunakan Desain
                                                </button>
                                                <button
                                                    onClick={() => previewTemplate(template.slug, template.id)}
                                                    className="w-full py-3 bg-white text-slate-500 border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" /> Live Preview
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
