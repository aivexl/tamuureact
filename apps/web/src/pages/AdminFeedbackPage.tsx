import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { feedback as feedbackApi } from '@/lib/api';
import { formatDateFull } from '@/lib/utils';
import { 
    MessageSquare, 
    Bug, 
    Sparkles, 
    Clock, 
    User, 
    Mail,
    Search,
    Filter,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

interface FeedbackItem {
    id: string;
    user_id: string;
    category: 'bug' | 'feature';
    message: string;
    status: string;
    created_at: string;
    user_email: string;
    user_name: string;
}

export const AdminFeedbackPage: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | 'bug' | 'feature'>('all');

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setIsLoading(true);
            const data = await feedbackApi.adminList();
            setFeedbacks(data || []);
        } catch (error) {
            console.error('[AdminFeedback] Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        const matchesSearch = 
            f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (f.user_email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (f.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
        const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
        
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Feedback</h1>
                    <p className="text-slate-400">Review bug reports and feature requests from users.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search feedback..."
                            className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500/50 outline-none w-full md:w-64 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value as any)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500/50 outline-none cursor-pointer hover:bg-white/10 transition-all font-bold"
                        >
                            <option value="all">ALL CATEGORIES</option>
                            <option value="bug">BUGS</option>
                            <option value="feature">FEATURES</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-40">
                    <PremiumLoader variant="inline" showLabel label="Loading feedback..." color="#14b8a6" />
                </div>
            ) : filteredFeedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 bg-[#111] border border-white/5 rounded-3xl text-slate-500">
                    <MessageSquare className="w-16 h-16 opacity-10 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-sm">No feedback found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredFeedbacks.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-teal-500/20 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Side Info */}
                                <div className="w-full md:w-64 space-y-4 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.category === 'bug' ? 'bg-rose-500/10 text-rose-400' : 'bg-teal-500/10 text-teal-400'}`}>
                                            {item.category === 'bug' ? <Bug className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${item.category === 'bug' ? 'text-rose-500' : 'text-teal-500'}`}>
                                                {item.category === 'bug' ? 'Bug Report' : 'Feature Request'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {formatDateFull(item.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="truncate">{item.user_name || 'Anonymous'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="truncate">{item.user_email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="flex-1">
                                    <div className="h-full p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                                            {item.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};
