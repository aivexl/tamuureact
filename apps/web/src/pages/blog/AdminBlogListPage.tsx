import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Image as ImageIcon,
    Edit3,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';
import { blog as blogApi } from '../../lib/api';

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

export const AdminBlogListPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useStore();
    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            const data = await blogApi.adminList();
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
            await blogApi.adminUpdate(id, {
                status: 'published',
                author_email: user?.email // Should be admin@tamuu.id
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
            await blogApi.adminDelete(id);
            toast.success('Artikel dihapus');
            fetchPosts();
        } catch (err) {
            toast.error('Gagal menghapus artikel');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Published
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        Pending Review
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-500/20">
                        <Edit3 className="w-3 h-3" />
                        Draft
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 underline decoration-teal-500/30">Blog Management</h1>
                    <p className="text-slate-400">Kelola artikel, edukasi, dan konten SEO Tamuu.</p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-2xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Tulis Artikel Baru
                </Link>
            </div>

            {/* Stats / Filters (Simplified) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cari artikel..."
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500 outline-none w-64 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Judul Artikel</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Kategori</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Views</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tanggal</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence>
                            {posts.map((post, i) => (
                                <motion.tr
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group hover:bg-white/[0.02] transition-colors border-b border-white/5"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
                                                {post.featured_image ? (
                                                    <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1">{post.title}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">/{post.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 tracking-wider">
                                            {post.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {getStatusBadge(post.status)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Eye className="w-4 h-4" />
                                            <span className="text-sm font-mono tracking-tighter">{post.view_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs text-slate-500 font-medium">
                                            {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {post.status === 'pending' && user?.email === 'admin@tamuu.id' && (
                                                <button
                                                    onClick={() => handleApprove(post.id)}
                                                    className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                    title="Approve & Publish"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <Link
                                                to={`/admin/blog/${post.id}`}
                                                className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 bg-white/5 text-rose-500/50 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                                title="Hapus"
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

                {loading && (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Memuat Master Artikel...</p>
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center space-y-6">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">Belum Ada Artikel</p>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">Mulailah menulis untuk meningkatkan SEO dan trafik Tamuu.</p>
                        </div>
                        <Link
                            to="/admin/blog/new"
                            className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all font-outfit"
                        >
                            Tulis Sekarang
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
