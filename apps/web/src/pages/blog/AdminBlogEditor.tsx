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

/**
 * Custom Font Size Extension
 */
const FontSize = Extension.create<any>({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
            },
        } as any;
    },
});

const FONT_SIZES = [
    { label: '8px', value: '8px' },
    { label: '10px', value: '10px' },
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' },
    { label: '24px', value: '24px' },
    { label: '30px', value: '30px' },
    { label: '36px', value: '36px' },
    { label: '48px', value: '48px' },
    { label: '60px', value: '60px' },
    { label: '72px', value: '72px' },
];

/**
 * Enhanced Toolbar with Grouped Features
 */
const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const [showFonts, setShowFonts] = useState(false);
    const [showSizes, setShowSizes] = useState(false);
    const [fontSearch, setFontSearch] = useState('');

    const filteredFonts = SUPPORTED_FONTS.filter(f =>
        f.name.toLowerCase().includes(fontSearch.toLowerCase())
    );

    const toggleLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL Link:', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addYoutube = () => {
        const url = window.prompt('Video YouTube URL:');
        if (url) editor.commands.setYoutubeVideo({ src: url });
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const ToolBtn = ({ onClick, active, children, className = '' }: any) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg text-xs transition-all ${active ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${className}`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-col border-b border-white/5 bg-white/[0.02] sticky top-0 z-20 backdrop-blur-xl">
            {/* Row 1: Typography + Inline Styles */}
            <div className="flex flex-wrap items-center gap-1 p-3 border-b border-white/5">
                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5 mr-2">
                    <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 disabled:opacity-20 transition-all"><Undo className="w-3.5 h-3.5" /></button>
                    <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 disabled:opacity-20 transition-all"><Redo className="w-3.5 h-3.5" /></button>
                </div>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Font + Size */}
                <div className="relative flex items-center gap-2 px-1">
                    <div className="relative">
                        <button
                            onClick={() => setShowFonts(!showFonts)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-all min-w-[120px] justify-between"
                        >
                            <span className="truncate">{editor.getAttributes('textStyle').fontFamily?.replace(/['"]+/g, '') || 'Default Font'}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                        <AnimatePresence>
                            {showFonts && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 mt-2 w-64 max-h-[400px] overflow-hidden bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col"
                                >
                                    <div className="p-2 border-b border-white/5 bg-black/40 flex items-center gap-2">
                                        <Search className="w-3 h-3 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Cari font..."
                                            value={fontSearch}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFontSearch(e.target.value)}
                                            className="bg-transparent border-0 focus:ring-0 text-[10px] text-white w-full placeholder-slate-600"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="overflow-y-auto flex-1 h-[300px] custom-scrollbar">
                                        <button
                                            onClick={() => {
                                                editor.chain().focus().unsetFontFamily().run();
                                                setShowFonts(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-[10px] hover:bg-white/5 text-teal-400 font-bold border-b border-white/5"
                                        >
                                            Reset Default
                                        </button>
                                        {filteredFonts.map((font: any) => (
                                            <button
                                                key={font.name}
                                                onClick={() => {
                                                    editor.chain().focus().setFontFamily(font.family).run();
                                                    setShowFonts(false);
                                                }}
                                                style={{ fontFamily: font.family }}
                                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 text-slate-300 transition-colors"
                                            >
                                                {font.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowSizes(!showSizes)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-all min-w-[70px] justify-between"
                        >
                            <span>{editor.getAttributes('textStyle').fontSize || 'Size'}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                        <AnimatePresence>
                            {showSizes && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 mt-2 w-32 max-h-[300px] overflow-y-auto bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 py-1"
                                >
                                    <button
                                        onClick={() => {
                                            editor.chain().focus().unsetFontSize().run();
                                            setShowSizes(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[10px] hover:bg-white/5 text-teal-400 font-bold"
                                    >
                                        Auto
                                    </button>
                                    {FONT_SIZES.map((size: any) => (
                                        <button
                                            key={size.value}
                                            onClick={() => {
                                                editor.chain().focus().setFontSize(size.value).run();
                                                setShowSizes(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-slate-300"
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Inline Styles */}
                <div className="flex items-center gap-0.5">
                    <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><BoldIcon className="w-3.5 h-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><ItalicIcon className="w-3.5 h-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><UnderlineIcon className="w-3.5 h-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}><Type className="w-3.5 h-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')}><sub>S</sub></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')}><sup>S</sup></ToolBtn>
                </div>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Alignment */}
                <div className="flex items-center gap-0.5">
                    {(['left', 'center', 'right', 'justify'] as const).map(align => {
                        const Icon = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify }[align];
                        return (
                            <ToolBtn
                                key={align}
                                onClick={() => editor.chain().focus().setTextAlign(align).run()}
                                active={editor.isActive({ textAlign: align })}
                            >
                                <Icon className="w-3.5 h-3.5" />
                            </ToolBtn>
                        );
                    })}
                </div>
            </div>

            {/* Row 2: Block elements + Media + Formatting */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-white/[0.01]">
                <div className="flex items-center gap-0.5 px-1">
                    {([1, 2, 3] as const).map(level => (
                        <button
                            key={level}
                            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                            className={`p-2 rounded-lg text-[10px] font-black tracking-tighter transition-all ${editor.isActive('heading', { level }) ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        >
                            H{level}
                        </button>
                    ))}
                </div>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <div className="flex items-center gap-0.5">
                    <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="w-3.5 h-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')}><CheckSquare className="w-3.5 h-3.5" /></ToolBtn>
                </div>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <div className="flex items-center gap-1">
                    <ToolBtn onClick={toggleLink} active={editor.isActive('link')}><LinkIcon className="w-3.5 h-3.5" /></ToolBtn>
                    <button onClick={addYoutube} className="p-2 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"><YoutubeIcon className="w-3.5 h-3.5" /></button>
                    <button
                        onClick={() => {
                            const url = window.prompt('URL Gambar:');
                            if (url) editor.chain().focus().setImage({ src: url }).run();
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:bg-teal-500/20 hover:text-teal-400 transition-all"
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                    <ToolBtn onClick={addTable} active={editor.isActive('table')}><TableIcon className="w-3.5 h-3.5" /></ToolBtn>
                    <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                </div>

                <div className="w-px h-4 bg-white/10 mx-1 ml-auto" />

                {/* Color & Clear */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => {
                            const color = window.prompt('Hex Color (e.g. #FF0000):');
                            if (color) editor.chain().focus().setColor(color).run();
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all"
                    >
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#fff' }} />
                    </button>
                    <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}><Highlighter className="w-3.5 h-3.5" /></ToolBtn>
                    <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all ml-1"><Eraser className="w-3.5 h-3.5" /></button>
                </div>
            </div>
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
    const [imageAlt, setImageAlt] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('draft');
    const [uploading, setUploading] = useState(false);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Categories
    useEffect(() => {
        api.blog.adminGetCategories().then(setCategories).catch(console.error);
    }, []);

    // Memoize extensions to prevent duplicate instance warnings on re-render
    const extensions = useMemo(() => [
        StarterKit.configure({
            heading: { levels: [1, 2, 3] },
            link: false,
            underline: false,
        }),
        Image.configure({ inline: true }),
        Link.configure({ openOnClick: false }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Highlight.configure({ multicolor: true }),
        TextStyle,
        FontFamily,
        FontSize,
        Color,
        TaskList,
        TaskItem.configure({ nested: true }),
        Youtube.configure({ width: 840, height: 480 }),
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        Subscript,
        Superscript,
        Placeholder.configure({ placeholder: 'Mulai menulis kisah legendaris Anda disini...' })
    ], []);

    const editor = useEditor({
        extensions,
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-teal max-w-none focus:outline-none min-h-[700px] p-10 text-slate-300 leading-relaxed text-lg',
            },
        },
    });

    // Word count
    const wordCount = useMemo(() => {
        if (!editor) return 0;
        return editor.state.doc.textContent?.split(/\s+/).filter(Boolean).length || 0;
    }, [editor?.state.doc.content]);

    // Auto-generate slug
    useEffect(() => {
        if (!id && title) {
            const generated = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(generated);
        }
    }, [title, id]);

    // Real-time Slug Check
    useEffect(() => {
        if (!slug) {
            setIsSlugAvailable(null);
            return;
        }

        const checkAvailability = async () => {
            setIsCheckingSlug(true);
            try {
                const { available } = await api.blog.checkSlug(slug, id);
                setIsSlugAvailable(available);
            } catch (err) {
                console.error('Slug check failed:', err);
                setIsSlugAvailable(null);
            } finally {
                setIsCheckingSlug(false);
            }
        };

        const timer = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timer);
    }, [slug, id]);

    // Load Existing Data
    useEffect(() => {
        if (id && editor) {
            const fetchPost = async () => {
                setLoading(true);
                try {
                    const post = await api.blog.adminGetPost(id);
                    if (post) {
                        setTitle(post.title);
                        setSlug(post.slug);
                        setExcerpt(post.excerpt || '');
                        setFeaturedImage(post.featured_image || '');
                        setImageAlt(post.image_alt || (typeof post.image_meta === 'object' ? post.image_meta?.alt : '') || '');
                        setCategory(post.category || '');
                        setStatus(post.status || 'draft');
                        setSeoTitle(post.seo_title || '');
                        setSeoDesc(post.seo_description || '');
                        setIsFeatured(!!post.is_featured);
                        try {
                            setTags(typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []));
                        } catch (e) {
                            setTags([]);
                        }
                        setSeoKeywords(post.seo_keywords || '');

                        // ENHANCED HYDRATION: Ensure editor is ready before setting content
                        setTimeout(() => {
                            if (editor && !editor.isDestroyed) {
                                editor.commands.setContent(post.content || '');
                                console.log('[BlogEditor] Content hydrated:', post.id);
                            }
                        }, 100);
                    }
                } catch (err) {
                    console.error('[BlogEditor] Load Error:', err);
                    toast.error('Gagal memuat artikel');
                } finally {
                    setLoading(false);
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
                image_alt: imageAlt,
                category,
                tags,
                is_featured: isFeatured,
                seo_title: seoTitle, seo_description: seoDesc, seo_keywords: seoKeywords,
                status: targetStatus,
                author_id: user?.id,
                author_email: user?.email
            };

            const data = id
                ? await api.blog.adminUpdate(id, payload)
                : await api.blog.adminCreate(payload);

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

            const result = await api.assets.upload(formData);
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

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const val = tagInput.trim();
        if (val && !tags.includes(val)) {
            setTags([...tags, val]);
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const isSuperAdmin = user?.email === 'admin@tamuu.id';

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 pb-20">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-2xl border-b border-white/5 px-8 h-20 flex items-center shadow-2xl">
                <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => {
                                if (title || editor?.getHTML() !== '') {
                                    if (window.confirm('Hapus perubahan yang belum tersimpan?')) navigate('/admin/blog');
                                } else {
                                    navigate('/admin/blog');
                                }
                            }}
                            className="group flex gap-3 items-center px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-bold"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>

                        <div className="h-8 w-px bg-white/10" />

                        <div className="flex flex-col">
                            <h1 className="text-lg font-extrabold tracking-tight text-white leading-none capitalize line-clamp-1 max-w-md">
                                {title || (id ? 'Mengedit Artikel' : 'Tulis Artikel Baru')}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.name || user?.email}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-[10px] font-bold text-slate-500 tabular-nums">{wordCount} words</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
                        >
                            <Save className="w-4 h-4 text-teal-400" />
                            <span className="hidden sm:inline">Simpan Draft</span>
                        </button>

                        {isSuperAdmin ? (
                            <button
                                onClick={() => handleSave('published')}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] active:scale-95"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Terbitkan
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSave('published')}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-95"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Ajukan Review
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-8 py-12 grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Writing Canvas */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    <textarea
                        placeholder="Ketik Judul Yang Menggetarkan Disini..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        rows={1}
                        className="w-full text-5xl font-extrabold bg-transparent border-0 border-b-2 border-white/5 focus:border-teal-500 focus:ring-0 px-0 py-8 placeholder-white/5 text-white transition-all tracking-tight resize-none min-h-[120px] overflow-hidden leading-[1.1]"
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />

                    <div className="relative bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-2xl transition-all hover:border-white/10">
                        <Toolbar editor={editor} />
                        <div className="min-h-[800px] overflow-hidden">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="xl:col-span-4 space-y-8">
                    {/* Publishing Status */}
                    <section className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-6 rounded-3xl space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">Status Publikasi</h3>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${status === 'published' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                                status === 'pending' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                                    'text-slate-400 border-white/10 bg-white/5'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`} />
                                {status}
                            </span>
                        </div>

                        {/* Hero Toggle */}
                        <div className="pt-2">
                            <button
                                onClick={() => setIsFeatured(!isFeatured)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isFeatured
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isFeatured ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                                        <Star className={`w-4 h-4 ${isFeatured ? 'fill-current' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold">Featured Article</div>
                                        <div className="text-[10px] opacity-60">Tampilkan di Hero Slider</div>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-all ${isFeatured ? 'bg-amber-500' : 'bg-slate-700'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isFeatured ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Globe className="w-3 h-3 text-indigo-400" /> Permalink Slug
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-xs font-mono transition-all outline-none focus:ring-0 ${isSlugAvailable === true ? 'border-emerald-500/50 text-emerald-400' :
                                        isSlugAvailable === false ? 'border-red-500/50 text-red-400' :
                                            'border-white/5 text-indigo-400 focus:border-indigo-500'
                                        }`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isCheckingSlug ? (
                                        <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                                    ) : isSlugAvailable === true ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="text-[8px] font-bold text-emerald-500">AVAILABLE</span>
                                        </div>
                                    ) : isSlugAvailable === false ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                                            <span className="text-[8px] font-bold text-red-500">TAKEN</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] italic text-slate-600 text-center">Terakhir disinkronisasi: {new Date().toLocaleTimeString()}</p>
                    </section>

                    {/* Content Matrix */}
                    <section className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-6 rounded-3xl space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                            Content Matrix
                        </h3>

                        {/* Hero Image */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Featured Hero Image</label>
                            <div className="group relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40 transition-all hover:border-teal-500/30">
                                {featuredImage ? (
                                    <>
                                        <img src={featuredImage} alt="Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                                            <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all backdrop-blur-md">
                                                <RefreshCcw className="w-5 h-5" />
                                            </button>
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Ganti Gambar</span>
                                        </div>
                                    </>
                                ) : (
                                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-all">
                                        <div className="p-4 rounded-full bg-white/5 border border-dashed border-white/10">
                                            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-teal-400" /> : <Plus className="w-6 h-6 text-slate-500" />}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unggah Hero Image</span>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
                            </div>

                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mt-3 block">Alt Text</label>
                            <input
                                type="text"
                                placeholder="Deskripsi untuk SEO..."
                                value={imageAlt}
                                onChange={e => setImageAlt(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-teal-500 focus:ring-0 outline-none transition-all"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Tag className="w-3 h-3 text-teal-400" /> Kategori Artikel
                            </label>
                            <input
                                type="text"
                                list="category-list"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-teal-500 focus:ring-0 outline-none transition-all"
                                placeholder="Pilih atau ketik kategori baru..."
                            />
                            <datalist id="category-list">
                                {categories.map(c => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                        </div>

                        {/* Tags Manager */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Plus className="w-3 h-3 text-indigo-400" /> Custom Tags
                            </label>

                            <div className="flex flex-wrap gap-2 mb-2">
                                <AnimatePresence>
                                    {tags.map(t => (
                                        <motion.span
                                            key={t}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-300"
                                        >
                                            {t}
                                            <button onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Ketik tag & Tekan Enter..."
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 focus:ring-0 outline-none transition-all pr-12"
                                />
                                <button
                                    onClick={addTag}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ringkasan Singkat</label>
                            <textarea
                                value={excerpt}
                                onChange={e => setExcerpt(e.target.value)}
                                rows={4}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-300 focus:border-teal-500 focus:ring-0 outline-none resize-none transition-all leading-relaxed"
                                placeholder="Sampaikan inti dari artikel Anda untuk menarik pembaca..."
                            />
                        </div>
                    </section>

                    {/* SEO Optimizer */}
                    <section className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-3xl" />
                        <div className="relative z-10 bg-white/[0.02] backdrop-blur-md border border-white/5 p-6 rounded-3xl space-y-5">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-3">
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                SEO Optimizer AI
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest ml-1">Meta Title</label>
                                    <input
                                        type="text"
                                        value={seoTitle}
                                        onChange={e => setSeoTitle(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder={title}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest ml-1">Meta Description</label>
                                    <textarea
                                        value={seoDesc}
                                        onChange={e => setSeoDesc(e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
                                        placeholder="Gambarkan artikel ini di mesin pencari..."
                                    />
                                </div>

                                <button className="w-full py-3.5 bg-white text-indigo-950 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                                    Generate SEO Meta
                                </button>
                            </div>
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    );
};

export default AdminBlogEditor;
