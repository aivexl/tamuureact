import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Eye,
    Image as ImageIcon,
    Edit3,
    Trash2,
    CheckCircle2,
    ExternalLink,
    ArrowLeft,
    Star,
    Layers,
    LayoutTemplate,
    UploadCloud
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { getPublicDomain } from '@/lib/utils';
import { compressImageToFile, shouldCompress } from '../../lib/image-compress';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    featured_image?: string;
    category?: string;
    status: 'draft' | 'pending' | 'published';
    is_featured: number | boolean;
    view_count: number;
    created_at: string;
    published_at?: string;
}

type TabType = 'articles' | 'categories' | 'carousel';
type StatusFilter = 'all' | 'published' | 'pending' | 'draft';

export const AdminBlogListPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('articles');
    
    // Articles State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    
    // Categories State
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '' });

    // Carousel State
    const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
    const [loadingCarousel, setLoadingCarousel] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            const result = await api.storage.upload(fileToUpload, 'gallery');
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

    const { user } = useStore();
    const navigate = useNavigate();

    const isSuperAdmin = user?.email === 'admin@tamuu.id';

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await api.blog.adminList();
            setPosts(data);
        } catch (err) {
            toast.error('Gagal mengambil data artikel');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const data = await api.blog.getCategories();
            if (Array.isArray(data)) setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchCarousel = async () => {
        try {
            setLoadingCarousel(true);
            const res = await api.safeFetch(`${api.API_BASE}/api/blog/carousel`);
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

    useEffect(() => {
        if (activeTab === 'articles') fetchPosts();
        if (activeTab === 'categories') fetchCategories();
        if (activeTab === 'carousel') fetchCarousel();
    }, [activeTab]);

    // ==========================================
    // ARTICLE HANDLERS
    // ==========================================
    const handleApprove = async (id: string) => {
        try {
            await api.blog.adminUpdate(id, { status: 'published', author_email: user?.email });
            toast.success('Artikel dipublikasi!');
            fetchPosts();
        } catch (err) {
            toast.error('Gagal mempublikasi');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Hapus artikel ini selamanya?')) return;
        try {
            await api.blog.adminDelete(id);
            toast.success('Artikel dihapus');
            fetchPosts();
        } catch (err) {
            toast.error('Gagal menghapus');
        }
    };

    const handleToggleFeatured = async (post: BlogPost) => {
        try {
            await api.blog.adminUpdate(post.id, { is_featured: !post.is_featured, author_email: user?.email });
            toast.success(post.is_featured ? 'Dihilangkan dari Featured' : 'Dijadikan Featured! ⭐');
            fetchPosts();
        } catch (err) {
            toast.error('Gagal update status');
        }
    };

    // ==========================================
    // CATEGORY HANDLERS
    // ==========================================
    const handleAddCategory = async () => {
        if (!newCategory.name || !newCategory.slug) return toast.error('Nama dan Slug wajib diisi');
        try {
            const res = await api.safeFetch(`${api.API_BASE}/api/admin/blog/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });
            if (res.ok) {
                toast.success('Kategori berhasil ditambahkan');
                setNewCategory({ name: '', slug: '' });
                fetchCategories();
            } else {
                throw new Error('Failed to add category');
            }
        } catch (err) {
            toast.error('Gagal tambah kategori');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm('Hapus kategori ini? Artikel di dalamnya akan diset ke "Umum".')) return;
        try {
            const res = await api.safeFetch(`${api.API_BASE}/api/admin/blog/categories`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                toast.success('Kategori dihapus dengan aman');
                fetchCategories();
            } else throw new Error('Failed');
        } catch (err) {
            toast.error('Gagal menghapus kategori');
        }
    };

    // ==========================================
    // RENDERERS
    // ==========================================
    const renderArticlesTab = () => {
        const stats = {
            total: posts.length,
            published: posts.filter(p => p.status === 'published').length,
            drafts: posts.filter(p => p.status === 'draft').length,
            pending: posts.filter(p => p.status === 'pending').length,
            totalViews: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
        };

        const filteredPosts = posts.filter(p => {
            if (statusFilter !== 'all' && p.status !== statusFilter) return false;
            if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });

        return (
            <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: FileText, label: 'Total Articles', value: stats.total, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                        { icon: CheckCircle2, label: 'Published', value: stats.published, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { icon: Edit3, label: 'Drafts', value: stats.drafts, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="bg-white/[0.03] border border-white/5 rounded-3xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 ${bg} rounded-xl`}><Icon className={`w-4 h-4 ${color}`} /></div>
                                <span className="text-[10px] tracking-widest uppercase font-black text-slate-500">{label}</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/[0.03] p-3 rounded-[3rem] border border-white/5">
                    <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
                        {['all', 'published', 'pending', 'draft'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab as StatusFilter)}
                                className={`flex-1 lg:flex-none px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${statusFilter === tab ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full lg:w-[400px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search articles..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-full py-4 pl-14 pr-8 text-white focus:bg-white/[0.08] transition-all text-xs font-bold uppercase tracking-widest"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#111] rounded-3xl border border-white/5 overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Artikel</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kategori</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Views</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-white/[0.01] group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/5">
                                                {post.featured_image ? <img src={post.featured_image} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-slate-600 m-4" />}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold mb-1">{post.title}</div>
                                                <div className="text-[9px] font-mono text-slate-500">/blog/{post.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{post.category || 'Umum'}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {post.status === 'published' ? <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Published</span> : <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{post.status}</span>}
                                    </td>
                                    <td className="px-8 py-6 text-center text-xs font-black text-slate-300">
                                        {(post.view_count || 0).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <a href={`https://${getPublicDomain()}/blog/${post.slug}`} target="_blank" className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg"><ExternalLink className="w-4 h-4" /></a>
                                            <Link to={`/admin/blog/${post.id}`} className="p-2 bg-white/5 text-slate-400 hover:text-teal-400 rounded-lg"><Edit3 className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDelete(post.id)} className="p-2 bg-white/5 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderCategoriesTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-3xl p-8 h-fit">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Tambah Kategori</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nama Kategori</label>
                        <input 
                            type="text" 
                            value={newCategory.name}
                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">URL Slug</label>
                        <input 
                            type="text" 
                            value={newCategory.slug}
                            onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm font-mono"
                        />
                    </div>
                    <button onClick={handleAddCategory} className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors mt-4">
                        Simpan Kategori
                    </button>
                </div>
            </div>
            
            <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kategori</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Artikel</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {categories.map(cat => (
                            <tr key={cat.id || cat.slug}>
                                <td className="px-8 py-6">
                                    <div className="text-white font-bold">{cat.name}</div>
                                    <div className="text-[9px] font-mono text-slate-500">/blog/category/{cat.slug}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-black text-slate-300">{cat.count || 0}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={() => handleDeleteCategory(cat.id || cat.slug)} className="p-2 bg-white/5 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const handleSaveCarousel = async (item: any, action: 'create' | 'update' | 'delete') => {
        try {
            const res = await api.safeFetch(`${api.API_BASE}/api/admin/blog/carousel`, {
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

    const [newSlide, setNewSlide] = useState({ image_url: '', link_url: '', title: '', category_label: '', is_active: 1, order_index: 0 });

    const renderCarouselTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-3xl p-8 h-fit">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Tambah Slide</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Image URL (Wajib)</label>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-[10px] font-black text-teal-500 hover:text-teal-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                                {isUploading ? (
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 border border-teal-500 border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <UploadCloud className="w-3 h-3" />
                                        Upload
                                    </span>
                                )}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter mb-2 ml-1">Ideal: 1200x675px (16:9) | Max: 2MB</p>
                        <input 
                            type="text" 
                            value={newSlide.image_url}
                            onChange={e => setNewSlide({ ...newSlide, image_url: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Link URL</label>
                        <input 
                            type="text" 
                            value={newSlide.link_url}
                            onChange={e => setNewSlide({ ...newSlide, link_url: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm"
                            placeholder="https://tamuu.id/blog/..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Judul (Optional)</label>
                        <input 
                            type="text" 
                            value={newSlide.title}
                            onChange={e => setNewSlide({ ...newSlide, title: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Label Kategori (Optional)</label>
                        <input 
                            type="text" 
                            value={newSlide.category_label}
                            onChange={e => setNewSlide({ ...newSlide, category_label: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Urutan</label>
                        <input 
                            type="number" 
                            value={newSlide.order_index}
                            onChange={e => setNewSlide({ ...newSlide, order_index: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                        />
                    </div>
                    <button 
                        disabled={isUploading}
                        onClick={() => {
                            if (!newSlide.image_url) return toast.error('Image URL wajib diisi');
                            handleSaveCarousel(newSlide, 'create');
                            setNewSlide({ image_url: '', link_url: '', title: '', category_label: '', is_active: 1, order_index: carouselSlides.length + 1 });
                        }} 
                        className="w-full py-4 bg-teal-500 text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-teal-400 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Menunggu Upload...' : 'Tambah Slide'}
                    </button>
                </div>
            </div>
            
            <div className="lg:col-span-2 space-y-4">
                {carouselSlides.length === 0 && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                        <LayoutTemplate className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-slate-400">Belum ada slide di Carousel</p>
                    </div>
                )}
                {carouselSlides.map((slide, idx) => (
                    <div key={slide.id || idx} className="bg-[#111] border border-white/5 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-slate-800 shrink-0">
                            <img src={slide.image_url} alt="Slide" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                            {slide.title && <h4 className="text-white font-bold">{slide.title}</h4>}
                            <div className="flex flex-col gap-1 text-xs text-slate-500 font-mono">
                                <span><strong className="text-slate-400">Link:</strong> {slide.link_url || '-'}</span>
                                <span><strong className="text-slate-400">Urutan:</strong> {slide.order_index}</span>
                                <span><strong className="text-slate-400">Status:</strong> {slide.is_active ? 'Aktif' : 'Nonaktif'}</span>
                            </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                            <button 
                                onClick={() => handleSaveCarousel({ ...slide, is_active: slide.is_active ? 0 : 1 }, 'update')}
                                className="flex-1 sm:flex-none px-4 py-2 bg-white/5 text-white hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                {slide.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button 
                                onClick={() => {
                                    if (window.confirm('Hapus slide ini?')) handleSaveCarousel(slide, 'delete');
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="pt-12 pb-24 px-4 sm:px-8 lg:px-12 space-y-10">
            <div className="flex items-center gap-4 mb-2">
                <Link 
                    to="/admin/dashboard" 
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div className="h-px flex-1 bg-white/5" />
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
                <div className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none uppercase">Blog Engine</h1>
                    <p className="text-base text-slate-400 font-medium">Enterprise Editorial Management System (v17.0)</p>
                </div>
                <Link to="/admin/blog/new" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                    <Plus className="w-4 h-4" /> Tulis Artikel
                </Link>
            </header>

            {/* Sub-Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-1 overflow-x-auto no-scrollbar">
                {[
                    { id: 'articles', label: 'Semua Artikel', icon: FileText },
                    { id: 'categories', label: 'Kategori', icon: Layers },
                    { id: 'carousel', label: 'Carousel', icon: LayoutTemplate }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                            activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'articles' && renderArticlesTab()}
                    {activeTab === 'categories' && renderCategoriesTab()}
                    {activeTab === 'carousel' && renderCarouselTab()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
