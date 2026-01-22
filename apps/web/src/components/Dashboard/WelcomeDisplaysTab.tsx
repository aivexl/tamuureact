/**
 * WelcomeDisplaysTab - Display Template Selection
 * Users can ONLY select from existing display templates, not create new ones.
 * Uses the same API as DisplayStorePanel for consistency.
 */

import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { templates as templatesApi, userDisplayDesigns } from '@/lib/api';
import { Monitor, Check, Sparkles, Tv, ExternalLink } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { useNavigate } from 'react-router-dom';

interface DisplayTemplate {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    thumbnail?: string;
    category?: string;
    type?: string;
}

interface UserDesign {
    id: string;
    name: string;
    source_template_id?: string;
    thumbnail_url?: string;
}

export const WelcomeDisplaysTab: React.FC = () => {
    const { user } = useStore();
    const navigate = useNavigate();

    const [templates, setTemplates] = useState<DisplayTemplate[]>([]);
    const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<DisplayTemplate | null>(null);

    // Fetch display templates and user's existing designs
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch all templates with type=display filter
                const allTemplates = await templatesApi.list();
                const displayTemplates = (allTemplates || []).filter(
                    (t: DisplayTemplate) => t.type === 'display'
                );
                setTemplates(displayTemplates);

                // Fetch user's existing display designs
                if (user?.id) {
                    const designs = await userDisplayDesigns.list({ userId: user.id });
                    setUserDesigns(designs || []);
                }
            } catch (error) {
                console.error('[WelcomeDisplaysTab] Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const handleSelectTemplate = async (template: DisplayTemplate) => {
        if (!user?.id) return;

        setSelectedTemplate(template);
        setIsApplying(true);

        try {
            // Get full template data
            const templateData = await templatesApi.get(template.id);

            // Create a new user-owned display design
            const newDesign = await userDisplayDesigns.create({
                user_id: user.id,
                name: `Display - ${template.name}`,
                thumbnail_url: template.thumbnail_url || template.thumbnail,
                source_template_id: template.id,
                content: {
                    sections: templateData.sections || [],
                    orbit_layers: templateData.orbit_layers || templateData.orbit || [],
                    music: templateData.music || null
                }
            });

            // Navigate to the editor
            navigate(`/user/display-editor/${newDesign.id}`);
        } catch (error) {
            console.error('[WelcomeDisplaysTab] Failed to apply template:', error);
            alert('Gagal memilih template. Silakan coba lagi.');
        } finally {
            setIsApplying(false);
            setSelectedTemplate(null);
        }
    };

    if (isLoading) {
        return (
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center py-20"
            >
                <PremiumLoader variant="inline" showLabel label="Memuat Display Template..." color="#6366f1" />
            </m.div>
        );
    }

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Monitor className="w-8 h-8 text-indigo-500" />
                        Desain Layar Sambutan
                    </h2>
                    <p className="text-slate-500 mt-1">Pilih tampilan layar yang memukau untuk menyambut tamu Anda.</p>
                </div>
            </div>

            {/* User's Existing Designs */}
            {userDesigns.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Desain Anda
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {userDesigns.map((design) => (
                            <div
                                key={design.id}
                                className="group bg-white rounded-2xl border border-indigo-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                                onClick={() => navigate(`/user/display-editor/${design.id}`)}
                            >
                                <div className="aspect-video relative bg-slate-100 overflow-hidden">
                                    {design.thumbnail_url ? (
                                        <img src={design.thumbnail_url} alt={design.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Monitor className="w-12 h-12 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-500 text-white text-[9px] font-bold uppercase rounded-full">
                                        Milik Anda
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-slate-800 truncate">{design.name}</h4>
                                    <p className="text-xs text-slate-400 mt-1">Klik untuk edit</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Templates */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Tv className="w-5 h-5 text-indigo-500" />
                    Pilih Template Display
                </h3>

                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <Monitor className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Template</h3>
                        <p className="text-slate-500 mb-8 max-w-md text-center">
                            Template display sedang dalam proses pembuatan. Silakan hubungi admin untuk informasi lebih lanjut.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {templates.map((template, index) => (
                            <m.button
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                onClick={() => handleSelectTemplate(template)}
                                disabled={isApplying}
                                className="group relative aspect-video bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-indigo-400 transition-all text-left disabled:opacity-50"
                            >
                                {/* Thumbnail */}
                                {template.thumbnail_url || template.thumbnail ? (
                                    <img
                                        src={template.thumbnail_url || template.thumbnail}
                                        alt={template.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
                                        <Monitor className="w-12 h-12 text-white/30" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                                {/* Info */}
                                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                                    <div className="space-y-1">
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-[8px] font-black text-white uppercase tracking-widest rounded-full inline-block">
                                            {template.category || 'Display'}
                                        </span>
                                        <h4 className="font-black text-white tracking-tight text-sm drop-shadow-lg">
                                            {template.name}
                                        </h4>
                                    </div>

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/20 backdrop-blur-sm text-white group-hover:bg-indigo-500 group-hover:scale-110`}>
                                        {isApplying && selectedTemplate?.id === template.id ? (
                                            <PremiumLoader variant="inline" color="white" />
                                        ) : (
                                            <Check className="w-5 h-5" />
                                        )}
                                    </div>
                                </div>
                            </m.button>
                        ))}
                    </div>
                )}
            </div>
        </m.div>
    );
};
