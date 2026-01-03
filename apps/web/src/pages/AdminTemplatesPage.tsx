import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { templates as templatesApi, invitations as invitationsApi } from '@/lib/api';
import { Plus, Search, Edit2, Trash2, Layout, ExternalLink, Loader2, Sparkles, FolderOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Template {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    category?: string;
    updated_at: string;
    sourceTable: 'templates' | 'invitations'; // Track origin table for correct deletion
}

export const AdminTemplatesPage: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            // Fetch from both tables
            const [templatesData, invitationsData] = await Promise.all([
                templatesApi.list(),
                invitationsApi.list()
            ]);

            const templateData = (templatesData || []).map((d: any) => ({
                ...d,
                sourceTable: 'templates' as const
            }));
            const invitationData = (invitationsData || []).map((d: any) => ({
                ...d,
                category: d.category || 'Invitation',
                sourceTable: 'invitations' as const
            }));

            // Merge and de-duplicate by ID
            const merged = [...templateData, ...invitationData];
            const uniqueMap = new Map<string, Template>();

            merged.forEach(item => {
                const existing = uniqueMap.get(item.id);
                if (!existing || (!existing.thumbnail_url && item.thumbnail_url)) {
                    uniqueMap.set(item.id, item as Template);
                }
            });

            setTemplates(Array.from(uniqueMap.values()).sort((a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            ));

        } catch (err) {
            console.error('[Admin] Unified Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        setIsLoading(true);
        const randomSlug = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Default sections for new template
        const defaultSections = [
            { id: crypto.randomUUID(), key: 'opening', title: 'Opening', order: 0, isVisible: true, backgroundColor: '#0a0a0a', elements: [] },
            { id: crypto.randomUUID(), key: 'couple', title: 'Couple', order: 1, isVisible: true, backgroundColor: '#0a0a0a', elements: [] },
            { id: crypto.randomUUID(), key: 'event', title: 'Event', order: 2, isVisible: true, backgroundColor: '#0a0a0a', elements: [] }
        ];

        const newTemplate = {
            name: 'New Premium Template',
            slug: randomSlug,
            sections: defaultSections,
            layers: [],
            zoom: 1,
            pan: { x: 0, y: 0 },
            updated_at: new Date().toISOString()
        };

        try {
            const data = await templatesApi.create(newTemplate);
            if (data) navigate(`/editor/template/${data.id}`);
        } catch (err) {
            console.error('[Admin] Create error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTemplate = async (id: string, category: string | undefined, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const template = templates.find(t => t.id === id);
            if (template?.sourceTable === 'invitations') {
                await invitationsApi.delete(id);
            } else {
                await templatesApi.delete(id);
            }
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('[Admin] Delete error:', err);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-outfit">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-premium-accent/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-premium-accent" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
                        </div>
                        <p className="text-white/40 text-sm">Create and organize premium invitation starting points</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-premium-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-premium-accent/50 w-64 transition-all"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCreateTemplate}
                            className="bg-premium-accent text-premium-dark px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-premium-accent/20 hover:shadow-premium-accent/40 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Template</span>
                        </motion.button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-premium-accent animate-spin" />
                        <p className="text-white/20 uppercase tracking-widest text-xs font-bold">Syncing Records...</p>
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                            <FolderOpen className="w-8 h-8 text-white/10" />
                        </div>
                        <h3 className="text-lg font-medium text-white/40">No templates found</h3>
                        <p className="text-white/20 text-sm mt-1">Start by creating your first premium template</p>
                        <button
                            onClick={handleCreateTemplate}
                            className="mt-6 text-premium-accent hover:underline text-sm font-medium"
                        >
                            Create New Template
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTemplates.map((template) => (
                            <motion.div
                                key={template.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-premium-accent/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black"
                            >
                                {/* Thumbnail Placeholder */}
                                <div className="aspect-[3/4] bg-white/5 relative overflow-hidden">
                                    {template.thumbnail_url ? (
                                        <img
                                            src={template.thumbnail_url}
                                            alt={template.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Layout className="w-12 h-12 mb-2" />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">No Preview</span>
                                        </div>
                                    )}

                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Link
                                            to={`/editor/template/${template.slug || template.id}`}
                                            className="p-3 bg-premium-accent text-premium-dark rounded-xl hover:scale-110 transition-transform shadow-xl"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            to={`/preview/${template.slug || template.id}`}
                                            target="_blank"
                                            className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:scale-110 transition-transform shadow-xl hover:bg-white/20"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                    </div>

                                    {template.category && (
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[9px] font-bold text-premium-accent uppercase tracking-tighter">
                                            {template.category}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm group-hover:text-premium-accent transition-colors truncate max-w-[150px]">
                                            {template.name}
                                        </h3>
                                        <p className="text-[10px] text-white/30 font-medium">
                                            Last sync: {new Date(template.updated_at).toLocaleDateString()}
                                        </p>
                                        {template.slug && (
                                            <p className="text-[9px] text-premium-accent/60 font-mono mt-0.5">
                                                slug: {template.slug}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteTemplate(template.id, template.category, e)}
                                        className="p-2 text-white/10 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
