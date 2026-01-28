import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../components/blog/BlogCard';

export const AdminBlogListPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/blog/posts')
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Blog Management</h1>
                    <p className="text-gray-500">Create, edit, and optimize content.</p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Post
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {posts.map(post => (
                            <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-6">
                                    <h4 className="font-bold text-gray-900">{post.title}</h4>
                                    <p className="text-xs text-gray-500 font-mono">/{post.slug}</p>
                                </td>
                                <td className="p-6">
                                    {/* Typescript hack: we assume `is_published` exists on the raw API response even if interface differs */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${(post as any).is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {(post as any).is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="p-6 font-mono text-sm text-gray-600">
                                    {post.view_count.toLocaleString()}
                                </td>
                                <td className="p-6 text-sm text-gray-500">
                                    {new Date(post.published_at || (post as any).created_at).toLocaleDateString()}
                                </td>
                                <td className="p-6 text-right">
                                    <Link
                                        to={`/admin/blog/${post.id}`}
                                        className="text-indigo-600 font-bold hover:text-indigo-800"
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!loading && posts.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        No posts found. Start writing!
                    </div>
                )}
            </div>
        </div>
    );
};
