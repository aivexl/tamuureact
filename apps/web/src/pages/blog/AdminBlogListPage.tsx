import React, { useEffect, useState, useMemo } from 'react';
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
    LayoutTemplate
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { getPublicDomain } from '@/lib/utils';

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
            const res = await fetch('https://tamuu.id/api/blog/carousel');
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
            const res = await fetch('https://tamuu.id/api/admin/blog/categories', {
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
            const res = await fetch('https://tamuu.id/api/admin/blog/categories', {
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

    const renderCarouselTab = () => (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <LayoutTemplate className="w-16 h-16 text-slate-600 mb-6" />
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Blog Carousel Manager</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Sistem drag-and-drop untuk mengatur slide Hero Blog akan segera dirilis pada pembaruan arsitektur UI berikutnya.</p>
            <button onClick={() => toast.success('Segera Hadir')} className="px-8 py-4 bg-teal-500 text-slate-900 rounded-full font-black uppercase tracking-widest text-[10px]">
                Setup Data (Dev Mode)
            </button>
        </div>
    );

    return (
        <div className="pt-12 pb-24 px-4 sm:px-8 lg:px-12 space-y-10">
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
