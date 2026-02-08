import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
    Settings, Palette, Image, Upload, Link as LinkIcon,
    Trash2, Zap, Tag, Plus, ChevronDown, Pencil, X, Check
} from 'lucide-react';
import { PremiumLoader } from '../ui/PremiumLoader';
import { storage, categories as categoriesApi, Category } from '@/lib/api';
import { ThumbnailSelectionModal } from '../Modals/ThumbnailSelectionModal';

export const SettingsSidebar: React.FC = () => {
    const {
        sections,
        activeSectionId,
        updateSection,
        slug,
        projectName,
        setSlug,
        setProjectName,
        id,
        category,
        setCategory,
        isTemplate,
        showModal
    } = useStore();

    // Category state
    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.list();
            setCategoryList(data);
        } catch (e) {
            console.error('Failed to fetch categories:', e);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const newCat = await categoriesApi.create({ name: newCategoryName.trim() });
            setCategoryList(prev => [...prev, newCat]);
            setCategory(newCat.name);
            setNewCategoryName('');
            setShowNewCategory(false);
        } catch (e) {
            console.error('Failed to create category:', e);
        }
    };

    const handleEditCategory = async (id: string) => {
        if (!editCategoryName.trim()) return;
        try {
            await categoriesApi.update(id, { name: editCategoryName.trim() });
            setCategoryList(prev => prev.map(cat =>
                cat.id === id ? { ...cat, name: editCategoryName.trim() } : cat
            ));
            // Update selected category if it was the one being edited
            const oldCat = categoryList.find(c => c.id === id);
            if (oldCat && category === oldCat.name) {
                setCategory(editCategoryName.trim());
            }
            setEditingCategoryId(null);
            setEditCategoryName('');
        } catch (e) {
            console.error('Failed to update category:', e);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        showModal({
            title: 'Hapus Kategori?',
            message: 'Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            onConfirm: async () => {
                try {
                    await categoriesApi.delete(id);
                    setCategoryList(prev => prev.filter(cat => cat.id !== id));
                    showModal({
                        title: 'Berhasil',
                        message: 'Kategori telah dihapus.',
                        type: 'success'
                    });
                } catch (e: any) {
                    console.error('Failed to delete category:', e);
                    showModal({
                        title: 'Gagal Menghapus',
                        message: e.message || 'Terjadi kesalahan saat menghapus kategori.',
                        type: 'error'
                    });
                }
            }
        });
    };

    // Get active section's background color
    const activeSection = (sections || []).find(s => s.id === activeSectionId);
    const backgroundColor = activeSection?.backgroundColor || '#0a0a0a';

    const setBackgroundColor = (color: string) => {
        if (activeSectionId) {
            updateSection(activeSectionId, { backgroundColor: color });
        }
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeSectionId) return;

        setUploading(true);
        try {
            const result = await storage.upload(file);
            updateSection(activeSectionId, { backgroundUrl: result.url });
        } catch (error: any) {
            console.error('BG Upload failed:', error);
            showModal({
                title: 'Upload Gagal',
                message: 'Gagal mengunggah background. Silakan coba beberapa saat lagi.',
                type: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    const setBackgroundUrl = (url: string) => {
        if (activeSectionId) {
            updateSection(activeSectionId, { backgroundUrl: url });
        }
    };

    const presetColors = [
        { color: '#0a0a0a', label: 'Dark' },
        { color: '#1a1a1a', label: 'Charcoal' },
        { color: '#0f172a', label: 'Navy' },
        { color: '#1e1b4b', label: 'Indigo' },
        { color: '#422006', label: 'Brown' },
        { color: '#ffffff', label: 'White' },
        { color: '#fef3c7', label: 'Cream' },
        { color: '#fce7f3', label: 'Pink' },
        { color: '#d1fae5', label: 'Mint' },
        { color: '#e0e7ff', label: 'Lavender' },
        { color: '#fed7aa', label: 'Peach' },
        { color: '#f5f5f4', label: 'Stone' }
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex border-b border-white/10 shrink-0 p-3 items-center gap-2">
                <Settings className="w-4 h-4 text-premium-accent" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Project Settings</span>
            </div>

            <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-6">
                {/* Project Settings */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/60">
                        <LinkIcon className="w-4 h-4" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">General</h4>
                    </div>
                    <div className="pt-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Project Name</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                            placeholder="My Premium Template"
                        />
                    </div>

                    {/* Category Selection (Admin Only for Templates) */}
                    {isTemplate && (
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold flex items-center gap-1.5">
                                    <Tag className="w-3 h-3" />
                                    Category
                                </label>
                                <button
                                    onClick={() => setShowCategoryManager(!showCategoryManager)}
                                    className="text-[9px] text-premium-accent hover:underline flex items-center gap-1"
                                >
                                    <Settings className="w-3 h-3" />
                                    {showCategoryManager ? 'Done' : 'Manage'}
                                </button>
                            </div>

                            {!showCategoryManager ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <select
                                            value={category || ''}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none cursor-pointer pr-10"
                                            disabled={loadingCategories}
                                        >
                                            <option value="" className="bg-slate-900">
                                                {loadingCategories ? 'Loading categories...' : 'Select category...'}
                                            </option>
                                            {categoryList.map(cat => (
                                                <option key={cat.id} value={cat.name} className="bg-slate-900">
                                                    {cat.icon} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                            {loadingCategories ? (
                                                <PremiumLoader variant="inline" size="sm" color="#bfa181" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 bg-white/5 rounded-lg p-3 border border-white/10">
                                    {/* List */}
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 premium-scroll">
                                        {categoryList.map(cat => (
                                            <div key={cat.id} className="flex items-center gap-2 group">
                                                {editingCategoryId === cat.id ? (
                                                    <div className="flex-1 flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={editCategoryName}
                                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                                            className="flex-1 bg-black/40 border border-premium-accent/50 rounded px-2 py-1 text-xs focus:outline-none"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleEditCategory(cat.id);
                                                                if (e.key === 'Escape') setEditingCategoryId(null);
                                                            }}
                                                        />
                                                        <button onClick={() => handleEditCategory(cat.id)} className="p-1 text-green-400 hover:bg-white/10 rounded"><Check className="w-3 h-3" /></button>
                                                        <button onClick={() => setEditingCategoryId(null)} className="p-1 text-red-400 hover:bg-white/10 rounded"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="flex-1 text-xs text-white/80 truncate">
                                                            {cat.icon} {cat.name}
                                                        </span>
                                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCategoryId(cat.id);
                                                                    setEditCategoryName(cat.name);
                                                                }}
                                                                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded"
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCategory(cat.id)}
                                                                className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/10 rounded"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add New */}
                                    {!showNewCategory ? (
                                        <button
                                            onClick={() => setShowNewCategory(true)}
                                            className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] text-white/40 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-1 mt-2"
                                        >
                                            <Plus className="w-3 h-3" /> Add New Category
                                        </button>
                                    ) : (
                                        <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                                            <input
                                                type="text"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                placeholder="New category..."
                                                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs focus:border-premium-accent/50 focus:outline-none"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                                            />
                                            <button
                                                onClick={handleCreateCategory}
                                                className="px-2 py-1 bg-premium-accent text-premium-dark rounded text-xs font-bold"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => setShowNewCategory(false)}
                                                className="px-2 py-1 bg-white/10 text-white rounded text-xs hover:bg-white/20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Thumbnail Selection */}
                    <div className="pt-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Thumbnail</label>
                        <ThumbnailControl />
                    </div>

                    <div className="pt-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Custom Slug (URL)</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 focus-within:border-premium-accent/50 transition-colors">
                                <span className="text-white/20 text-xs font-mono">/preview/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                                    className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 font-mono text-premium-accent"
                                    placeholder="my-awesome-link"
                                />
                            </div>
                        </div>
                        <p className="text-[8px] text-white/20 mt-2 italic">Only letters, numbers, and hyphens allowed.</p>
                    </div>
                </div>

                {/* Background Color */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/60">
                        <Palette className="w-4 h-4" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Canvas Background</h4>
                    </div>

                    {/* Preset Colors */}
                    <div className="grid grid-cols-4 gap-2">
                        {presetColors.map((preset) => (
                            <motion.button
                                key={preset.color}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setBackgroundColor(preset.color)}
                                className={`aspect-square rounded-lg border-2 transition-all ${backgroundColor === preset.color
                                    ? 'border-premium-accent ring-2 ring-premium-accent/30'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.label}
                            />
                        ))}
                    </div>

                    {/* Custom Color Picker */}
                    <div className="pt-3 border-t border-white/10">
                        <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Custom Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={/^#[0-9A-F]{6}$/i.test(backgroundColor) ? backgroundColor : '#0a0a0a'}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                            />
                            <input
                                type="text"
                                value={backgroundColor || '#0a0a0a'}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none font-mono"
                                placeholder="#0a0a0a"
                            />
                        </div>
                    </div>
                </div>

                {/* Background Image Controls */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/60">
                        <Image className="w-4 h-4" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Background Image</h4>
                    </div>

                    {/* URL Input */}
                    <div>
                        <label className="text-[8px] text-white/20 mb-1 block">Image URL</label>
                        <input
                            type="text"
                            value={activeSection?.backgroundUrl || ''}
                            onChange={(e) => setBackgroundUrl(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs focus:border-premium-accent/50 focus:outline-none"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* Manual Upload */}
                    <div>
                        <label className="text-[8px] text-white/20 mb-1 block">Upload Image</label>
                        <label className={`flex items-center justify-center w-full px-3 py-3 border border-dashed rounded-lg transition-colors ${uploading ? 'bg-premium-accent/5 border-premium-accent/30' : 'border-white/10 cursor-pointer hover:bg-white/5 hover:border-premium-accent/30'}`}>
                            <div className="flex flex-col items-center gap-1 text-center">
                                {uploading ? (
                                    <>
                                        <PremiumLoader variant="inline" showLabel label="Uploading..." color="#bfa181" />
                                    </>
                                ) : (
                                    <>
                                        <Image className="w-4 h-4 text-white/40" />
                                        <span className="text-[10px] text-white/40">Click to upload image</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    {/* Preview / Clear */}
                    {activeSection?.backgroundUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                            <img
                                src={activeSection.backgroundUrl}
                                alt="Background preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setBackgroundUrl('')}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white hover:bg-red-500/80 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Background"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Canvas Size Info */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/60">
                        <Settings className="w-4 h-4" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Canvas Info</h4>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Width</span>
                            <span className="font-mono text-white/60">414px</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Height</span>
                            <span className="font-mono text-white/60">896px</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Aspect Ratio</span>
                            <span className="font-mono text-white/60">9:19.5 (Mobile)</span>
                        </div>
                    </div>
                </div>

                {/* Host Remote Control (Scan to Trigger) */}
                {id && (
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 text-premium-accent">
                            <Zap className="w-4 h-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Host Remote Control</h4>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-premium-accent/5 to-transparent pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center text-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-xl shadow-premium-accent/10">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://app.tamuu.id/remote/${id}`)}`}
                                        alt="Remote Trigger QR"
                                        className="w-24 h-24"
                                    />
                                </div>

                                <div>
                                    <p className="text-[10px] text-white font-bold mb-1">Host Remote</p>
                                    <p className="text-[8px] text-white/30 leading-relaxed px-2">
                                        Scan this on your phone to open the remote control for this display.
                                    </p>
                                </div>

                                <div className="w-full h-px bg-white/5" />

                                <button
                                    onClick={() => window.open(`/remote/${id}`, '_blank')}
                                    className="w-full py-2 rounded-lg bg-premium-accent/10 hover:bg-premium-accent/30 border border-premium-accent/20 text-premium-accent text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    Open Remote UI
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// THUMBNAIL CONTROL
// ============================================
function ThumbnailControl() {
    const { thumbnailUrl, setThumbnailUrl, projectName, showModal } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSaveThumbnail = async (blob: Blob) => {
        try {
            setUploading(true);
            const timestamp = Date.now();
            const safeName = (projectName || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-');
            const file = new File([blob], `thumb_${safeName}_${timestamp}.jpg`, { type: 'image/jpeg' });

            const result = await storage.upload(file);
            setThumbnailUrl(result.url);
            console.log('[Thumbnail] Uploaded:', result.url);

        } catch (error: any) {
            console.error('Thumbnail upload failed:', error);
            showModal({
                title: 'Upload Gagal',
                message: 'Gagal mengunggah thumbnail. Silakan coba lagi.',
                type: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    const [manualImageSrc, setManualImageSrc] = useState<string | null>(null);

    const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Read file as Data URL
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setManualImageSrc(event.target.result as string);
                setIsModalOpen(true);
            }
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    };

    return (
        <>
            <div className="flex gap-4 items-start">
                <button
                    onClick={() => {
                        setManualImageSrc(null);
                        setIsModalOpen(true);
                    }}
                    className="flex-1 aspect-[3/5] bg-white/5 rounded-lg border border-dashed border-white/10 hover:border-premium-accent/50 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 group overflow-hidden relative"
                >
                    {thumbnailUrl ? (
                        <>
                            <img src={thumbnailUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[10px] font-bold text-white">Change</span>
                            </div>
                        </>
                    ) : (
                        <>
                            {uploading ? (
                                <PremiumLoader variant="inline" color="#bfa181" />
                            ) : (
                                <Image className="w-5 h-5 text-white/20 group-hover:text-premium-accent" />
                            )}
                            <span className="text-[10px] text-white/30 group-hover:text-white">
                                {uploading ? 'Uploading...' : 'Set Thumbnail'}
                            </span>
                        </>
                    )}
                </button>
                <div className="flex-1 py-1 space-y-3">
                    <div>
                        <p className="text-[10px] text-white/40 leading-tight mb-2">
                            Set a preview image for your template.
                        </p>
                        <button
                            onClick={() => {
                                setManualImageSrc(null);
                                setIsModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-premium-accent hover:text-premium-dark rounded text-[10px] font-bold transition-colors w-full border border-white/10 hover:border-transparent flex items-center justify-center gap-1.5"
                        >
                            <Zap className="w-3 h-3" />
                            Generate
                        </button>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <label className="text-[8px] text-white/20 mb-1 block uppercase tracking-wider">Manual Upload</label>
                        <label className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-medium transition-colors w-full border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Select Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleManualUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <label className="text-[8px] text-white/20 mb-1 block uppercase tracking-wider">Image URL</label>
                        <input
                            type="text"
                            value={thumbnailUrl || ''}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-premium-accent/50 font-mono text-premium-accent"
                        />
                    </div>
                </div>
            </div>

            <ThumbnailSelectionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setManualImageSrc(null); // Reset
                }}
                onSave={handleSaveThumbnail}
                initialImageSrc={manualImageSrc}
            />
        </>
    );
}
