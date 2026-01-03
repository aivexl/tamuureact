import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { m } from 'framer-motion';
import { templates as templatesApi } from '@/lib/api';
import {
    Search,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

// Lazy load the grid to reduce initial payload and TBT
const InvitationsGrid = lazy(() => import('../components/Store/InvitationsGrid'));

interface Template {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    category?: string;
    price?: number;
}

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Event', 'Classic', 'Floral'];

const GridLoader = () => (
    <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#FFBF00] rounded-full animate-spin"></div>
    </div>
);

export const InvitationsStorePage: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();

    useSEO({
        title: 'Koleksi Desain Undangan Digital Premium',
        description: 'Jelajahi ratusan desain undangan digital premium dari Tamuu. Pilih tema terbaik untuk pernikahan, ulang tahun, dan acara spesial Anda.'
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await templatesApi.list();
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-slate-200 rounded-full shadow-sm mb-8">
                            <Sparkles className="w-4 h-4 text-[#FFBF00]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Koleksi Desain Mahakarya</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 text-slate-900">
                            Pilih Desain <span className="text-amber-900">Terbaik</span> Untuk Momen Anda
                        </h1>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto mb-12 group">
                            <div className="absolute inset-0 bg-[#FFD700]/10 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-100 overflow-hidden flex items-center p-2 focus-within:ring-4 focus-within:ring-[#FFBF00]/10 transition-all duration-500">
                                <Search className="w-6 h-6 text-slate-400 ml-6" />
                                <input
                                    type="text"
                                    placeholder="Cari tema atau kategori..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-lg font-medium text-slate-700 placeholder:text-slate-300"
                                    aria-label="Cari undangan"
                                />
                                <button
                                    className="bg-slate-900 text-white p-4 rounded-[1.5rem] hover:bg-[#FFBF00] hover:text-slate-900 transition-all shadow-lg"
                                    aria-label="Submit pencarian"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Categories */}
                        <m.div
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
                        </m.div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 pb-32">
                    <Suspense fallback={<GridLoader />}>
                        <InvitationsGrid
                            isLoading={isLoading}
                            filteredTemplates={filteredTemplates}
                            onUseTemplate={handleUseTemplate}
                            onPreviewTemplate={previewTemplate}
                        />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};
