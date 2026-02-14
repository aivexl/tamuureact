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
    ExternalLink
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Published
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending Review
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-bold border border-slate-500/20">
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
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Blog Management</h1>
                    <p className="text-slate-400 font-medium">Kelola artikel, draf, dan publikasi konten Tamuu CMS Anda.</p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-full font-bold transition-all shadow-xl shadow-teal-500/10 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Tulis Artikel Baru
                </Link>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 ${bg} rounded-xl`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-[10px] tracking-widest uppercase font-bold text-slate-500">{label}</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Status Tabs */}
                <div className="flex bg-white/5 p-1 rounded-full border border-white/5 w-full lg:w-auto">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === tab.value
                                    ? 'bg-teal-500 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari judul artikel..."
                        className="w-full bg-white/5 border border-white/5 rounded-full py-3 pl-12 pr-6 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-5 text-[10px] tracking-widest uppercase font-bold text-slate-500">Judul</th>
                                <th className="px-8 py-5 text-[10px] tracking-widest uppercase font-bold text-slate-500">Kategori</th>
                                <th className="px-8 py-5 text-[10px] tracking-widest uppercase font-bold text-slate-500">Status</th>
                                <th className="px-8 py-5 text-[10px] tracking-widest uppercase font-bold text-slate-500 text-center">Views</th>
                                <th className="px-8 py-5 text-[10px] tracking-widest uppercase font-bold text-slate-500">Tanggal</th>
                                <th className="px-8 py-5 text-[10px] tracking-widest uppercase font-bold text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredPosts.map((post, i) => (
                                    <motion.tr
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group hover:bg-white/[0.02] transition-colors"
                                    >
                                        {/* Title + Thumbnail */}
                                        <td className="px-8 py-5">
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
                                                <div>
                                                    <div className="text-white font-semibold mb-1 group-hover:text-teal-500 transition-colors line-clamp-1">
                                                        {post.title}
                                                    </div>
                                                    <div className="font-mono text-[10px] text-slate-500">
                                                        /blog/{post.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-8 py-5 text-sm">
                                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/10 text-xs">
                                                {post.category || 'Uncategorized'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-8 py-5">
                                            {getStatusBadge(post.status)}
                                        </td>

                                        {/* Views */}
                                        <td className="px-8 py-5 text-center text-sm font-medium text-slate-300">
                                            {(post.view_count || 0).toLocaleString()}
                                        </td>

                                        {/* Date */}
                                        <td className="px-8 py-5 text-sm text-slate-400">
                                            {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {post.status === 'pending' && isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleApprove(post.id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-all"
                                                        title="Approve & Publish"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <a
                                                    href={`https://${getPublicDomain()}/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                                                    title="View Live"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <Link
                                                    to={`/admin/blog/${post.id}`}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-teal-500 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-500 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Memuat Artikel...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredPosts.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center space-y-6">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">
                                {searchQuery || statusFilter !== 'all' ? 'Tidak Ditemukan' : 'Belum Ada Artikel'}
                            </p>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Coba ubah filter atau kata kunci pencarian.'
                                    : 'Mulailah menulis untuk meningkatkan SEO dan trafik Tamuu.'}
                            </p>
                        </div>
                        {!searchQuery && statusFilter === 'all' && (
                            <Link
                                to="/admin/blog/new"
                                className="px-6 py-2 bg-teal-500 text-white rounded-full text-sm font-bold hover:bg-teal-400 transition-all"
                            >
                                Tulis Sekarang
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
