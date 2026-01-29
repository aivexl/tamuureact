import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    Send,
    Eye,
    Image as ImageIcon,
    Globe,
    ChevronLeft,
    Sparkles,
    CheckCircle2,
    Upload,
    Loader2,
    Tag
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { assets, blog as blogApi } from '../../lib/api';

// Premium Dark Toolbar
const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg text-xs font-bold transition-all ${editor.isActive('bold') ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:bg-white/5'}`}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg text-xs italic transition-all ${editor.isActive('italic') ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:bg-white/5'}`}>I</button>
            <div className="w-px h-4 bg-white/10 mx-1 mt-2" />
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg text-xs font-bold transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:bg-white/5'}`}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-lg text-xs font-bold transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:bg-white/5'}`}>H3</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:bg-white/5'}`}>
                <span className="text-xs font-bold">List</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-1 mt-2" />
            <button
                onClick={() => {
                    const url = window.prompt('URL Gambar:');
                    if (url) editor.chain().focus().setImage({ src: url }).run();
                }}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all flex items-center gap-2"
            >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Image</span>
            </button>
        </div>
    );
};

export const AdminBlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user } = useStore();

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('draft');
    const [uploading, setUploading] = useState(false);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: true }),
            Link.configure({ openOnClick: false })
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-teal max-w-none focus:outline-none min-h-[500px] p-8 text-slate-300',
            },
        },
    });

    // Auto-generate slug
    useEffect(() => {
        if (!id && title) {
            const generated = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(generated);
        }
    }, [title, id]);

    // Load Existing Data
    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                try {
                    const res = await fetch(`/api/admin/blog/posts`);
                    const allPosts = await res.json();
                    const post = allPosts.find((p: any) => p.id === id);
                    if (post) {
                        setTitle(post.title);
                        setSlug(post.slug);
                        setExcerpt(post.excerpt || '');
                        setFeaturedImage(post.featured_image || '');
                        setCategory(post.category || '');
                        setStatus(post.status || 'draft');
                        setSeoTitle(post.seo_title || '');
                        setSeoDesc(post.seo_description || '');
                        setSeoKeywords(post.seo_keywords || '');
                        editor?.commands.setContent(post.content || '');
                    }
                } catch (err) {
                    toast.error('Gagal memuat artikel');
                }
            };
            fetchPost();
        }
    }, [id, editor]);

    const handleSave = async (targetStatus: 'draft' | 'pending' | 'published') => {
        if (!title) return toast.error('Judul wajib diisi');
        setLoading(true);
        const content = editor?.getHTML() || '';

        try {
            const payload = {
                title, slug, content, excerpt, featured_image: featuredImage,
                category,
                seo_title: seoTitle, seo_description: seoDesc, seo_keywords: seoKeywords,
                status: targetStatus,
                author_id: user?.id,
                author_email: user?.email
            };

            const data = id
                ? await blogApi.adminUpdate(id, payload)
                : await blogApi.adminCreate(payload);

            // Handle server-side enforcement feedback
            const finalStatus = data.status || targetStatus;

            if (finalStatus === 'pending' && targetStatus === 'published') {
                toast.success('Artikel diajukan ke Super Admin untuk persetujuan 🚀');
            } else {
                toast.success(finalStatus === 'published' ? 'Artikel Terpublikasi!' : 'Draft Tersimpan');
            }

            navigate('/admin/blog');
        } catch (err) {
            toast.error('Gagal menyimpan artikel');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'blog-hero');

            const result = await assets.upload(formData);
            if (result.url) {
                setFeaturedImage(result.url);
                toast.success('Gambar berhasil diunggah! 🖼️');
            }
        } catch (err) {
            toast.error('Gagal mengunggah gambar');
        } finally {
            setUploading(false);
        }
    };

    const isSuperAdmin = user?.email === 'admin@tamuu.id';

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 py-4 px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/blog')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">
                            {id ? 'Edit Artikel' : 'Teks Baru'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            Simpan Draft
                        </button>

                        {isSuperAdmin ? (
                            <button
                                onClick={() => handleSave('published')}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 text-[11px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {loading ? 'Memproses...' : 'Terbit Sekarang'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSave('published')}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? 'Mengirim...' : 'Ajukan Review'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Editor Body */}
                <div className="lg:col-span-8 space-y-8">
                    <input
                        type="text"
                        placeholder="Ketik Judul Spektakuler Disini..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-5xl font-black bg-transparent border-0 border-b border-white/5 focus:border-teal-500 focus:ring-0 px-0 py-6 placeholder-white/10 text-white transition-colors tracking-tight"
                    />

                    <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                        <Toolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {/* Settings Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Status Card */}
                    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 flex items-center gap-2">
                            System Status
                        </h3>
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-xs font-bold uppercase text-slate-500">Current State</span>
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${status === 'published' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                                status === 'pending' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                                    'text-slate-400 border-white/10 bg-white/5'
                                }`}>
                                {status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                            <Globe className="w-3 h-3" /> Publishing Setup
                        </h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider ml-1">Url Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-teal-400 focus:ring-1 focus:ring-teal-500 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider ml-1">Ringkasan (Excerpt)</label>
                            <textarea
                                value={excerpt}
                                onChange={e => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-300 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                                placeholder="Gambarkan artikel dalam 1-2 kalimat..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider ml-1">Featured Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={featuredImage}
                                    onChange={e => setFeaturedImage(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-300 focus:ring-1 focus:ring-teal-500 outline-none"
                                    placeholder="https://..."
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center text-teal-500"
                                    title="Upload manual"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider ml-1 flex items-center gap-2">
                                <Tag className="w-3 h-3" /> Kategori Artikel
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none"
                                placeholder="Contoh: Wedding Tips, Tutorial..."
                            />
                        </div>
                        {featuredImage && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 rounded-2xl overflow-hidden border border-white/10 aspect-video relative group">
                                <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye className="w-5 h-5" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* SEO Optimizer */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-3xl space-y-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-700" />

                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2 relative z-10">
                        <Sparkles className="w-3 h-3" /> SEO Engine AI
                    </h3>

                    <div className="space-y-2 relative z-10">
                        <label className="text-[10px] font-bold uppercase text-indigo-400/60 tracking-wider ml-1">Meta Title</label>
                        <input
                            type="text"
                            value={seoTitle}
                            onChange={e => setSeoTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner"
                            placeholder={title}
                        />
                    </div>

                    <div className="space-y-2 relative z-10">
                        <label className="text-[10px] font-bold uppercase text-indigo-400/60 tracking-wider ml-1">Meta Description</label>
                        <textarea
                            value={seoDesc}
                            onChange={e => setSeoDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    <button className="w-full py-3 bg-white text-indigo-950 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5 relative z-10 overflow-hidden">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3" /> Optimize with AI
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
