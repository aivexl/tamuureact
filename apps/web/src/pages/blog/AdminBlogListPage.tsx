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
    Clock,
    ExternalLink,
    ArrowLeft,
    Star
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

type StatusFilter = 'all' | 'published' | 'pending' | 'draft';

export const AdminBlogListPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const { user } = useStore();
    const navigate = useNavigate();

    const isSuperAdmin = user?.email === 'admin@tamuu.id';

    const fetchPosts = async () => {
        try {
            const data = await api.blog.adminList();
            setPosts(data);
        } catch (err) {
            toast.error('Gagal mengambil data artikel');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await api.blog.adminUpdate(id, {
                status: 'published',
                author_email: user?.email
            });
            toast.success('Artikel berhasil dipublikasi!');
            fetchPosts();
        } catch (err) {
            toast.error('Gagal menyetujui artikel');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Hapus artikel ini selamanya?')) return;
        try {
            await api.blog.adminDelete(id);
            toast.success('Artikel dihapus');
            fetchPosts();
        } catch (err) {
            toast.error('Gagal menghapus artikel');
        }
    };

    const handleToggleFeatured = async (post: BlogPost) => {
        try {
            await api.blog.adminUpdate(post.id, {
                is_featured: !post.is_featured,
                author_email: user?.email
            });
            toast.success(post.is_featured ? 'Artikel dihilangkan dari Hero' : 'Artikel dijadikan Hero! ⭐');
            fetchPosts();
        } catch (err) {
            toast.error('Gagal memperbarui status Hero');
        }
    };

    // Computed stats
    const stats = useMemo(() => ({
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        drafts: posts.filter(p => p.status === 'draft').length,
        pending: posts.filter(p => p.status === 'pending').length,
        totalViews: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
    }), [posts]);

    // Filtered posts
    const filteredPosts = useMemo(() => {
        let result = posts;
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
        }
        return result;
    }, [posts, statusFilter, searchQuery]);

    const formatViews = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
        return n.toString();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Published
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Draft
                    </span>
                );
        }
    };

    const FILTER_TABS: { label: string; value: StatusFilter }[] = [
        { label: 'All', value: 'all' },
        { label: 'Published', value: 'published' },
        { label: 'Pending', value: 'pending' },
        { label: 'Draft', value: 'draft' },
    ];

    return (
        <div className="pt-12 pb-24 px-4 sm:px-8 lg:px-12 space-y-10 sm:space-y-12">
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group w-fit"
                >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Dashboard Admin</span>
                </Link>

                <div className="hidden sm:block h-4 w-[1px] bg-white/10 mx-2" />

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 w-fit">
                    <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest">CMS Mode</span>
                </div>
            </div>

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
                <div className="space-y-3 text-center md:text-left">
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none">
                        Blog Management
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
                        Kelola artikel, draf, dan publikasi konten Tamuu CMS Anda dengan presisi.
                    </p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-full font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-teal-500/10 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Tulis Artikel Baru
                </Link>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { icon: FileText, label: 'Total Articles', value: stats.total, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                    { icon: CheckCircle2, label: 'Published', value: stats.published, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { icon: Edit3, label: 'Drafts', value: stats.drafts, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { icon: Eye, label: 'Total Views', value: formatViews(stats.totalViews), color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-3xl p-5 sm:p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 ${bg} rounded-xl`}>
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                            </div>
                            <span className="text-[8px] sm:text-[10px] tracking-widest uppercase font-black text-slate-500 text-right">{label}</span>
                        </div>
                        <div className="text-xl sm:text-3xl font-bold text-white">{value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Status Tabs */}
                <div className="flex bg-white/5 p-1 rounded-full border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`flex-1 lg:flex-none px-4 sm:px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === tab.value
                                ? 'bg-teal-500 text-slate-900 shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari judul artikel..."
                        className="w-full bg-white/5 border border-white/5 rounded-full py-3.5 pl-12 pr-6 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Artikel</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kategori</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Hero</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Views</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tanggal</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence>
                            {filteredPosts.map((post, i) => (
                                <motion.tr
                                    key={post.id}
                                    layout
                                    className="hover:bg-white/[0.01] transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                                {post.featured_image ? (
                                                    <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                        <ImageIcon className="w-4 h-4 text-slate-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-white font-bold mb-1 group-hover:text-teal-400 transition-colors line-clamp-1">
                                                    {post.title}
                                                </div>
                                                <div className="font-mono text-[9px] text-slate-500">
                                                    /blog/{post.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest">
                                            {post.category || 'Default'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => handleToggleFeatured(post)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${post.is_featured
                                                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                                                : 'bg-white/5 text-slate-600 border border-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <Star className={`w-4 h-4 ${post.is_featured ? 'fill-current' : ''}`} />
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        {getStatusBadge(post.status)}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-xs font-black text-slate-300 tabular-nums">
                                            {(post.view_count || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs text-slate-400 font-medium">
                                            {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {post.status === 'pending' && isSuperAdmin && (
                                                <button onClick={() => handleApprove(post.id)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                                            )}
                                            <a href={`https://${getPublicDomain()}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all"><ExternalLink className="w-4 h-4" /></a>
                                            <Link to={`/admin/blog/${post.id}`} className="p-2 bg-white/5 text-slate-400 hover:text-teal-400 rounded-lg transition-all"><Edit3 className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDelete(post.id)} className="p-2 bg-white/5 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};