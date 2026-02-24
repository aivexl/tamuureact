import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Youtube } from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';

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
    Tag,
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Type,
    List,
    ListOrdered,
    CheckSquare,
    Youtube as YoutubeIcon,
    Table as TableIcon,
    Minus,
    Undo,
    Redo,
    Strikethrough,
    Highlighter,
    Link as LinkIcon,
    Eraser,
    Search,
    ChevronDown,
    Plus,
    X,
    RefreshCcw,
    Star
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import api from '@/lib/api';
import { SUPPORTED_FONTS } from '../../lib/fonts';

const extensions = [
    StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
    Image.configure({ inline: true }),
    Link.configure({ openOnClick: false }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: true }),
    TextStyle,
    FontFamily,
    Color,
    TaskList,
    TaskItem.configure({ nested: true }),
    Youtube.configure({ width: 840, height: 480 }),
    Table.configure({ resizable: true }),
    TableRow, TableCell, TableHeader,
    Subscript, Superscript,
    Placeholder.configure({ placeholder: 'Mulai menulis kisah legendaris Anda disini...' })
];

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;
    const [showFonts, setShowFonts] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const filteredFonts = SUPPORTED_FONTS.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase()));

    const ToolBtn = ({ onClick, active, children, className = '' }: any) => (
        <button onClick={onClick} className={`p-2 rounded-lg text-xs transition-all shrink-0 ${active ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${className}`}>
            {children}
        </button>
    );

    return (
        <div className="flex flex-col border-b border-white/5 bg-white/[0.02] sticky top-0 z-20 backdrop-blur-xl">
            <div className="flex items-center gap-1 p-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo className="w-3.5 h-3.5" /></ToolBtn>
                <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
                <div className="relative shrink-0">
                    <button onClick={() => setShowFonts(!showFonts)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 min-w-[100px] justify-between">
                        <span className="truncate">{editor.getAttributes('textStyle').fontFamily?.replace(/['"]+/g, '') || 'Font'}</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {showFonts && (
                        <div className="absolute left-0 mt-2 w-64 max-h-[300px] overflow-hidden bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col">
                            <div className="p-2 border-b border-white/5 bg-black/40 flex items-center gap-2">
                                <Search className="w-3 h-3 text-slate-500" />
                                <input type="text" placeholder="Cari font..." value={fontSearch} onChange={(e) => setFontSearch(e.target.value)} className="bg-transparent border-0 focus:ring-0 text-[10px] text-white w-full" autoFocus />
                            </div>
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                {filteredFonts.map((font: any) => (
                                    <button key={font.name} onClick={() => { editor.chain().focus().setFontFamily(font.family).run(); setShowFonts(false); }} style={{ fontFamily: font.family }} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-slate-300">{font.name}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
                <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><BoldIcon className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><ItalicIcon className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><UnderlineIcon className="w-3.5 h-3.5" /></ToolBtn>
                <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="w-3.5 h-3.5" /></ToolBtn>
            </div>
        </div>
    );
};

export const AdminBlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user } = useStore();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('draft');
    const [isFeatured, setIsFeatured] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions,
        content: '',
        editorProps: { attributes: { class: 'prose prose-invert prose-teal max-w-none focus:outline-none min-h-[500px] p-6 sm:p-10 text-slate-300 text-base sm:text-lg' } }
    });

    useEffect(() => {
        api.blog.adminGetCategories().then(setCategories).catch(console.error);
        if (id && editor) {
            api.blog.adminGetPost(id).then(post => {
                if (post) {
                    setTitle(post.title); setSlug(post.slug); setExcerpt(post.excerpt || '');
                    setFeaturedImage(post.featured_image || ''); setCategory(post.category || '');
                    setStatus(post.status || 'draft'); setIsFeatured(!!post.is_featured);
                    setTimeout(() => editor.commands.setContent(post.content || ''), 100);
                }
            });
        }
    }, [id, editor]);

    const handleSave = async (targetStatus: 'draft' | 'pending' | 'published') => {
        if (!title) return toast.error('Judul wajib diisi');
        setLoading(true);
        try {
            const payload = { title, slug, content: editor?.getHTML() || '', excerpt, featured_image: featuredImage, category, is_featured: isFeatured, status: targetStatus, author_id: user?.id, author_email: user?.email };
            await (id ? api.blog.adminUpdate(id, payload) : api.blog.adminCreate(payload));
            toast.success('Artikel tersimpan!');
            navigate('/admin/blog');
        } catch (err) { toast.error('Gagal menyimpan'); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 pb-20 font-inter">
            <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-2xl border-b border-white/5 px-4 sm:px-8 h-20 flex items-center shadow-2xl">
                <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                        <button onClick={() => navigate('/admin/blog')} className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 shrink-0"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="min-w-0 hidden sm:block">
                            <h1 className="text-sm font-black text-white truncate">{title || 'Baru'}</h1>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{status}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button onClick={() => handleSave('draft')} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Draft</button>
                        <button onClick={() => handleSave('published')} className="px-5 py-2 rounded-full bg-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20">{user?.email === 'admin@tamuu.id' ? 'Publish' : 'Review'}</button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-12 grid grid-cols-1 xl:grid-cols-12 gap-8 sm:gap-12">
                <div className="xl:col-span-8 space-y-6">
                    <textarea
                        placeholder="Judul Artikel..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-3xl sm:text-5xl font-black bg-transparent border-0 border-b border-white/5 focus:border-teal-500 focus:ring-0 px-0 py-4 placeholder:text-white/5 text-white tracking-tight resize-none leading-tight"
                    />
                    <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                        <Toolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>

                <aside className="xl:col-span-4 space-y-6">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-500">Thumbnail</label>
                            <div onClick={() => fileInputRef.current?.click()} className="aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500/50 transition-all overflow-hidden relative">
                                {featuredImage ? <img src={featuredImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-white/10" />}
                                <input type="file" ref={fileInputRef} onChange={async (e) => {
                                    const file = e.target.files?.[0]; if (!file) return;
                                    const formData = new FormData(); formData.append('file', file);
                                    const res = await api.assets.upload(formData); if (res.url) setFeaturedImage(res.url);
                                }} className="hidden" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-500">Category</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-teal-500" placeholder="Pilih kategori..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-500">Excerpt</label>
                            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-400 outline-none focus:border-teal-500 resize-none" placeholder="Ringkasan singkat..." />
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default AdminBlogEditor;