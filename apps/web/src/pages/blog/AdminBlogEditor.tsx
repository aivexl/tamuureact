import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Simplified TipTap Toolbar
const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100 bg-white sticky top-0 z-10 rounded-t-2xl">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}><b>B</b></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}><i>I</i></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}>H3</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}>List</button>
            <button
                onClick={() => {
                    const url = window.prompt('URL:');
                    if (url) editor.chain().focus().setImage({ src: url }).run();
                }}
                className="p-2 rounded hover:bg-gray-100 text-sm"
            >
                📷 Image
            </button>
        </div>
    );
};

export const AdminBlogEditor = () => {
    const { id } = useParams(); // If ID exists, we are editing
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: true }),
            Link.configure({ openOnClick: false })
        ],
        content: '<p>Start writing something epic...</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-6',
            },
        },
    });

    // Auto-generate slug from title
    useEffect(() => {
        if (!id && title) { // Only auto-gen for new posts
            const generated = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(generated);
        }
    }, [title, id]);

    // Load Data if Edit Mode
    useEffect(() => {
        if (id) {
            // In real app: Fetch /api/admin/blog/posts/:id
            // For now simplified
        }
    }, [id]);

    const handleSave = async (publishStatus: boolean) => {
        setLoading(true);
        const content = editor?.getHTML() || '';

        try {
            const payload = {
                title, slug, content, excerpt, featured_image: featuredImage,
                seo_title: seoTitle, seo_description: seoDesc, seo_keywords: seoKeywords,
                is_published: publishStatus ? 1 : 0
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/admin/blog/posts/${id}` : '/api/admin/blog/posts';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Save failed');

            toast.success(publishStatus ? 'Published Successfully!' : 'Draft Saved');
            if (!id) navigate('/admin/dashboard'); // Redirect after create
        } catch (err) {
            toast.error('Failed to save');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <input
                        type="text"
                        placeholder="Post Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-4xl font-black bg-transparent border-0 border-b-2 border-gray-200 focus:border-indigo-600 focus:ring-0 px-0 py-4 placeholder-gray-300 transition-colors"
                    />

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <Toolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    {/* Publishing */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Publishing</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={loading}
                                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={loading}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/30 transition-all"
                            >
                                {loading ? 'Saving...' : 'Publish'}
                            </button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900">Metadata</h3>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Slug</label>
                            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-mono" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Excerpt</label>
                            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className="w-full p-3 rounded-lg border border-gray-200 text-sm" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Featured Image URL</label>
                            <input type="text" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 text-sm" />
                            {featuredImage && (
                                <img src={featuredImage} alt="Preview" className="mt-2 rounded-lg w-full h-32 object-cover" />
                            )}
                        </div>
                    </div>

                    {/* SEO Engine */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="font-bold text-indigo-900 relative z-10 flex items-center gap-2">
                            ⚡ SEO Engine
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-indigo-400 mb-2">Meta Title</label>
                            <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full p-3 rounded-lg border border-white bg-white/50 text-sm" placeholder={title} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-indigo-400 mb-2">Meta Description</label>
                            <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} rows={3} className="w-full p-3 rounded-lg border border-white bg-white/50 text-sm" />
                        </div>

                        <button className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg shadow-sm text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                            ✨ Auto-Optimize with AI
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
