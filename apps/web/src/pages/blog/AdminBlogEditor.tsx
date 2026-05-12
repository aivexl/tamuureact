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
    Star,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    UploadCloud
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import api from '@/lib/api';
import { SUPPORTED_FONTS } from '../../lib/fonts';
import { Modal } from '../../components/ui/Modal';
import { compressImage } from '../../lib/image-processor';

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

const Toolbar = ({ editor, openDialog }: { editor: any, openDialog: any }) => {
    if (!editor) return null;
    const [showFonts, setShowFonts] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const filteredFonts = SUPPORTED_FONTS.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase()));
    const imageInputRef = useRef<HTMLInputElement>(null);

    const ToolBtn = ({ onClick, active, disabled, children, className = '', tooltip }: any) => (
        <div className="relative group shrink-0">
            <button 
                type="button"
                onClick={onClick} 
                disabled={disabled}
                className={`p-2 rounded-lg text-xs transition-all shrink-0 ${active ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
            >
                {children}
            </button>
            {tooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none z-[1000] border border-white/10 shadow-2xl">
                    {tooltip}
                </div>
            )}
        </div>
    );

    const Divider = () => <div className="w-px h-4 bg-white/10 mx-1 shrink-0 self-center" />;

    const onUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            toast.loading('Optimizing & Uploading...', { id: 'editor-upload' });
            
            // 1. Compress Image
            const compressedBlob = await compressImage(file, { maxWidth: 1280, quality: 0.8 });
            
            // 2. Prepare FormData
            const formData = new FormData();
            formData.append('file', compressedBlob, `blog-content-${Date.now()}.webp`);
            
            // 3. Upload
            const res = await api.assets.upload(formData);
            if (res.url) {
                editor.chain().focus().setImage({ src: res.url }).run();
                toast.success('Image optimized & inserted!', { id: 'editor-upload' });
            }
        } catch (err) {
            toast.error('Failed to upload image', { id: 'editor-upload' });
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    return (
        <div className="flex flex-col border-b border-white/5 bg-white/[0.02] sticky top-0 z-20 backdrop-blur-xl rounded-t-[2rem]">
            <div className="flex flex-wrap items-center gap-1 p-3">
                {/* 1. Undo/Redo */}
                <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo (Ctrl+Z)"><Undo className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo (Ctrl+Y)"><Redo className="w-3.5 h-3.5" /></ToolBtn>
                
                <Divider />

                {/* 2. Fonts */}
                <div className="relative group shrink-0">
                    <button onClick={() => setShowFonts(!showFonts)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 min-w-[100px] justify-between transition-all hover:bg-white/10 hover:text-white">
                        <span className="truncate">{editor.getAttributes('textStyle').fontFamily?.replace(/['"]+/g, '') || 'Font'}</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1000] border border-white/10 shadow-xl">
                        Change Font
                    </div>
                    {showFonts && (
                        <div className="absolute left-0 mt-3 w-72 max-h-[350px] overflow-hidden bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1001] flex flex-col">
                            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                                <Search className="w-3.5 h-3.5 text-white/20" />
                                <input 
                                    type="text" 
                                    placeholder="Search fonts..." 
                                    value={fontSearch} 
                                    onChange={(e) => setFontSearch(e.target.value)} 
                                    className="bg-transparent border-0 focus:ring-0 text-[11px] font-bold text-white w-full uppercase tracking-widest placeholder:text-white/10 p-0" 
                                    autoFocus 
                                />
                            </div>
                            <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
                                {filteredFonts.map((font: any) => (
                                    <button 
                                        key={font.name} 
                                        onClick={() => { editor.chain().focus().setFontFamily(font.family).run(); setShowFonts(false); }} 
                                        style={{ fontFamily: font.family }} 
                                        className="w-full text-left px-5 py-3.5 text-[13px] hover:bg-white/5 text-slate-300 rounded-xl transition-all flex items-center justify-between group"
                                    >
                                        <span>{font.name}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* 3. Headings */}
                <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} tooltip="Heading 1"><Heading1 className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} tooltip="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} tooltip="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolBtn>

                <Divider />

                {/* 4. Formatting */}
                <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} tooltip="Bold (Ctrl+B)"><BoldIcon className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} tooltip="Italic (Ctrl+I)"><ItalicIcon className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} tooltip="Underline (Ctrl+U)"><UnderlineIcon className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} tooltip="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} tooltip="Highlight"><Highlighter className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} tooltip="Clear Formatting"><Eraser className="w-3.5 h-3.5" /></ToolBtn>

                <Divider />

                {/* 5. Alignment */}
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} tooltip="Align Left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} tooltip="Align Center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} tooltip="Align Right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} tooltip="Align Justify"><AlignJustify className="w-3.5 h-3.5" /></ToolBtn>

                <Divider />

                {/* 6. Lists/Blocks */}
                <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} tooltip="Bullet List"><List className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} tooltip="Ordered List"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} tooltip="Task List"><CheckSquare className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} tooltip="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolBtn>

                <Divider />

                {/* 7. Insertions */}
                <ToolBtn onClick={() => openDialog('link')} active={editor.isActive('link')} tooltip="Insert Link"><LinkIcon className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => openDialog('html')} tooltip="Import Raw HTML (from AI)"><RefreshCcw className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Horizontal Rule"><Minus className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} tooltip="Insert Table"><TableIcon className="w-3.5 h-3.5" /></ToolBtn>
                <ToolBtn onClick={() => openDialog('youtube')} tooltip="Insert YouTube Video"><YoutubeIcon className="w-3.5 h-3.5" /></ToolBtn>
                
                <Divider />

                {/* 8. Images */}
                <div className="flex items-center gap-1">
                    <ToolBtn onClick={() => imageInputRef.current?.click()} tooltip="Upload Image">
                        <UploadCloud className="w-3.5 h-3.5" />
                    </ToolBtn>
                    <ToolBtn onClick={() => openDialog('image')} tooltip="Image by URL">
                        <ImageIcon className="w-3.5 h-3.5" />
                    </ToolBtn>
                    <input 
                        type="file" 
                        ref={imageInputRef} 
                        onChange={onUploadImage} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
            </div>
        </div>
    );
};

const CategorySelector = ({ value, onChange, categories }: { value: string, onChange: (val: string) => void, categories: any[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setIsAdding(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white flex items-center justify-between cursor-pointer hover:border-teal-500/50 transition-all shadow-inner"
            >
                <span className={value ? 'text-white font-bold' : 'text-slate-500'}>{value || 'Pilih kategori...'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 w-full mb-2 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] overflow-hidden backdrop-blur-3xl"
                    >
                        {/* Search Bar */}
                        <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Cari kategori..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent border-0 focus:ring-0 text-xs text-white w-full p-0"
                                autoFocus
                            />
                        </div>

                        {/* Add New Option */}
                        <div className="p-2 border-b border-white/5 bg-teal-500/5">
                            {isAdding ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newCatName} 
                                        onChange={e => setNewCatName(e.target.value)}
                                        placeholder="Nama kategori..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                if (newCatName) {
                                                    onChange(newCatName);
                                                    setIsAdding(false);
                                                    setNewCatName('');
                                                    setIsOpen(false);
                                                }
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (newCatName) {
                                                onChange(newCatName);
                                                setIsAdding(false);
                                                setNewCatName('');
                                                setIsOpen(false);
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-teal-500 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-tighter"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsAdding(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-teal-500 hover:bg-teal-500/10 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Kategori Baru
                                </button>
                            )}
                        </div>

                        {/* Categories List */}
                        <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                            {filtered.length > 0 ? (
                                filtered.map((cat: any) => (
                                    <button
                                        key={cat.id || cat.name}
                                        onClick={() => {
                                            onChange(cat.name);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all flex items-center justify-between group"
                                    >
                                        <span>{cat.name}</span>
                                        {value === cat.name && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-[10px] text-slate-500 uppercase tracking-widest">
                                    Tidak ada hasil
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [dialogConfig, setDialogConfig] = useState<{
        isOpen: boolean;
        type: 'link' | 'youtube' | 'image' | 'html';
        title: string;
        placeholder: string;
    }>({
        isOpen: false,
        type: 'link',
        title: '',
        placeholder: ''
    });
    const [dialogInput, setDialogInput] = useState('');

    const editor = useEditor({
        extensions,
        content: '',
        editorProps: { 
            attributes: { 
                class: 'ProseMirror focus:outline-none min-h-[800px] p-6 sm:p-12 text-slate-300 text-base sm:text-lg'
            } 
        }
    });

    useEffect(() => {
        api.blog.adminGetCategories().then(setCategories).catch(console.error);
        if (id && editor) {
            api.blog.adminGetPost(id).then(post => {
                if (post) {
                    setTitle(post.title); setSlug(post.slug); setExcerpt(post.excerpt || '');
                    setFeaturedImage(post.featured_image || ''); setCategory(post.category || '');
                    setStatus(post.status || 'draft'); setIsFeatured(!!post.is_featured);
                    setSeoTitle(post.seo_title || '');
                    setSeoDescription(post.seo_description || '');
                    setSeoKeywords(post.seo_keywords || '');
                    setImageAlt(post.image_alt || '');
                    setTimeout(() => editor.commands.setContent(post.content || ''), 100);
                }
            });
        }
    }, [id, editor]);

    // Auto-generate slug from title for NEW posts
    useEffect(() => {
        if (!id && title && !slug) {
            const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setSlug(generatedSlug);
        }
    }, [title, id]);

    const handleSave = async (targetStatus: 'draft' | 'pending' | 'published') => {
        if (!title) return toast.error('Judul wajib diisi');
        
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setSlug(finalSlug);
        }

        setLoading(true);
        try {
            const payload = { 
                title, 
                slug: finalSlug, 
                content: editor?.getHTML() || '', 
                excerpt, 
                featured_image: featuredImage, 
                category, 
                is_featured: isFeatured, 
                status: targetStatus, 
                author_id: user?.id, 
                author_email: user?.email,
                seo_title: seoTitle,
                seo_description: seoDescription,
                seo_keywords: seoKeywords,
                image_alt: imageAlt
            };
            const res = await (id ? api.blog.adminUpdate(id, payload) : api.blog.adminCreate(payload));
            
            if (res.error) {
                throw new Error(res.error);
            }

            toast.success('Artikel tersimpan!');
            navigate('/admin/blog');
        } catch (err: any) { 
            console.error('Save error:', err);
            toast.error(err.message || 'Gagal menyimpan'); 
        } finally { 
            setLoading(false); 
        }
    };

    const openDialog = (type: 'link' | 'youtube' | 'image' | 'html') => {
        const configs = {
            link: { title: 'Insert Link', placeholder: 'https://example.com' },
            youtube: { title: 'Insert YouTube Video', placeholder: 'https://youtube.com/watch?v=...' },
            image: { title: 'Insert Image URL', placeholder: 'https://example.com/image.jpg' },
            html: { title: 'Import Raw HTML', placeholder: 'Paste your HTML code here...' }
        };
        setDialogConfig({ isOpen: true, type, ...configs[type] });
        setDialogInput(type === 'link' ? editor?.getAttributes('link').href || '' : '');
    };

    const handleDialogSubmit = () => {
        if (!editor) return;
        if (!dialogInput) {
            if (dialogConfig.type === 'link') {
                editor.chain().focus().unsetLink().run();
            }
            return setDialogConfig({ ...dialogConfig, isOpen: false });
        }

        if (dialogConfig.type === 'link') {
            editor.chain().focus().setLink({ href: dialogInput }).run();
        } else if (dialogConfig.type === 'youtube') {
            editor.chain().focus().setYoutubeVideo({ src: dialogInput }).run();
        } else if (dialogConfig.type === 'image') {
            editor.chain().focus().setImage({ src: dialogInput }).run();
        } else if (dialogConfig.type === 'html') {
            // Use insertContent with HTML parsing for better robustness
            editor.chain().focus().insertContent(dialogInput, {
                parseOptions: {
                    preserveWhitespace: false,
                },
            }).run();
        }

        setDialogConfig({ ...dialogConfig, isOpen: false });
        setDialogInput('');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 pb-20 font-inter text-[13px]">
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

            <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-12 grid grid-cols-1 xl:grid-cols-12 gap-8 sm:gap-12 relative z-10">
                <div className="xl:col-span-8 space-y-6">
                    <textarea
                        placeholder="Judul Artikel..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-3xl sm:text-5xl font-black bg-transparent border-0 border-b border-white/5 focus:border-teal-500 focus:ring-0 px-0 py-4 placeholder:text-white/5 text-white tracking-tight resize-none leading-tight"
                    />
                    <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 shadow-2xl relative z-10">
                        <Toolbar editor={editor} openDialog={openDialog} />
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
                                    try {
                                        toast.loading('Optimizing Thumbnail...', { id: 'thumb-upload' });
                                        const compressedBlob = await compressImage(file, { maxWidth: 1280, quality: 0.85 });
                                        const formData = new FormData(); 
                                        formData.append('file', compressedBlob, `thumb-${Date.now()}.webp`);
                                        const res = await api.assets.upload(formData); 
                                        if (res.url) {
                                            setFeaturedImage(res.url);
                                            toast.success('Thumbnail optimized!', { id: 'thumb-upload' });
                                        }
                                    } catch (err) {
                                        toast.error('Gagal mengoptimalkan gambar');
                                    }
                                }} className="hidden" accept="image/*" />
                            </div>
                            <input 
                                type="text" 
                                value={imageAlt} 
                                onChange={e => setImageAlt(e.target.value)} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-teal-500" 
                                placeholder="Deskripsi gambar (Alt Text)..." 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-500">Slug / URL</label>
                            <input 
                                type="text" 
                                value={slug} 
                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-teal-400 font-mono outline-none focus:border-teal-500" 
                                placeholder="url-artikel-anda" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-500">Category</label>
                            <CategorySelector 
                                value={category} 
                                onChange={setCategory} 
                                categories={categories} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-500">Excerpt</label>
                            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-400 outline-none focus:border-teal-500 resize-none" placeholder="Ringkasan singkat..." />
                        </div>
                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-500">
                                <Globe className="w-3 h-3" /> SEO & Metadata
                            </label>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">SEO Title</span>
                                    <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-teal-500" placeholder="Custom SEO Title..." />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">SEO Description</span>
                                    <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none focus:border-teal-500 resize-none" placeholder="Custom meta description..." />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">SEO Keywords</span>
                                    <input type="text" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-teal-500" placeholder="keyword1, keyword2..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <Modal 
                isOpen={dialogConfig.isOpen} 
                onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })} 
                title={dialogConfig.title}
                size="sm"
            >
                <div className="space-y-8 p-1">
                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-500 flex items-center gap-2">
                            <Plus className="w-3 h-3" /> Input Data
                        </label>
                        {dialogConfig.type === 'html' ? (
                            <textarea
                                value={dialogInput}
                                onChange={(e) => setDialogInput(e.target.value)}
                                placeholder={dialogConfig.placeholder}
                                className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-xs text-slate-900 font-mono outline-none focus:border-teal-500/50 focus:bg-white transition-all shadow-inner resize-none"
                                autoFocus
                            />
                        ) : (
                            <input 
                                type="text" 
                                value={dialogInput} 
                                onChange={(e) => setDialogInput(e.target.value)}
                                placeholder={dialogConfig.placeholder}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm text-slate-900 outline-none focus:border-teal-500/50 focus:bg-white transition-all font-bold shadow-inner"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleDialogSubmit()}
                            />
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
                            className="flex-1 px-6 py-5 rounded-2xl bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleDialogSubmit}
                            className="flex-1 px-6 py-5 rounded-2xl bg-teal-500 text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/30"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminBlogEditor;