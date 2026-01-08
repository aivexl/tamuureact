import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { userDisplayDesigns } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Loader2, Plus, Monitor, Edit3, Trash2, ExternalLink } from 'lucide-react';

export const WelcomeDisplaysTab: React.FC = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [designs, setDesigns] = useState<any[]>([]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadDesigns();
        }
    }, [user?.id]);

    const loadDesigns = async () => {
        try {
            setLoading(true);
            const res = await userDisplayDesigns.list(user?.id);
            if (Array.isArray(res)) {
                setDesigns(res);
            }
        } catch (error) {
            console.error('Failed to load designs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = async () => {
        if (!user?.id) return;
        try {
            setCreating(true);
            const newDesign = await userDisplayDesigns.create({
                user_id: user.id,
                name: 'Desain Layar Baru',
                thumbnail_url: undefined,
                sections: [], // Empty initially
                orbit_layers: [],
            });
            if (newDesign && newDesign.id) {
                navigate(`/user/display-editor/${newDesign.id}`);
            }
        } catch (error) {
            console.error('Failed to create design:', error);
            alert('Gagal membuat desain baru.');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Apakah Anda yakin ingin menghapus desain ini?')) return;

        try {
            await userDisplayDesigns.delete(id);
            setDesigns(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Gagal menghapus desain.');
        }
    };

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
                    <p className="text-slate-500 mt-1">Buat tampilan layar yang memukau untuk menyambut tamu Anda.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    disabled={creating}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Buat Desain Baru
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : designs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                        <Monitor className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Desain</h3>
                    <p className="text-slate-500 mb-8 max-w-md text-center">Anda belum memiliki desain layar sambutan. Mulai buat desain pertama Anda sekarang.</p>
                    <button
                        onClick={handleCreateNew}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Buat sekarang &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {designs.map(design => (
                        <div key={design.id} className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:border-indigo-400/30 transition-all duration-500">
                            {/* Thumbnail Area */}
                            <div className="aspect-video relative bg-slate-100 overflow-hidden">
                                {design.thumbnail_url ? (
                                    <img src={design.thumbnail_url} alt={design.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Monitor className="w-12 h-12 opacity-50" />
                                    </div>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                    <Link
                                        to={`/user/display-editor/${design.id}`}
                                        className="p-3 bg-indigo-500 text-white rounded-xl hover:scale-110 hover:bg-indigo-600 transition-all shadow-lg"
                                        title="Edit Desain"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </Link>
                                    <button
                                        className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 hover:bg-slate-100 transition-all shadow-lg"
                                        title="Preview"
                                        onClick={() => window.open(`/display/${design.id}`, '_blank')}
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-slate-900 truncate" title={design.name}>{design.name}</h3>
                                    <button
                                        onClick={(e) => handleDelete(design.id, e)}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Last Edited
                                    </span>
                                    <span className="text-xs font-mono text-slate-500">
                                        {new Date(design.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </m.div>
    );
};
