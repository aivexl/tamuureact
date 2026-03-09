import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    BellRing, 
    Send, 
    Users, 
    Smartphone, 
    Globe, 
    Image as ImageIcon,
    Target,
    Zap,
    History,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { push } from '../../lib/api';

export const AdminPushNotificationPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [audience, setAudience] = useState('all');
    const [isSending, setIsSending] = useState(false);

    const handleSendBroadcast = async () => {
        if (!title || !message) {
            toast.error('Title and message are required');
            return;
        }

        setIsSending(true);
        try {
            const result = await push.adminBroadcast({
                title,
                message,
                url: targetUrl,
                imageUrl,
                audience
            });

            if (result.success) {
                toast.success(`Broadcast initiated! Reaching ${result.reach || 0} devices.`);
                setTitle('');
                setMessage('');
                setTargetUrl('');
                setImageUrl('');
            } else {
                throw new Error(result.error || 'Failed to send');
            }
        } catch (error: any) {
            console.error('Broadcast Error:', error);
            toast.error(error.message || 'Failed to send push notification');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <BellRing className="w-8 h-8 text-teal-400" />
                        Push Notifications
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Broadcast real-time messages, promos, and product updates to your users.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
                        <History className="w-4 h-4" />
                        History
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-slate-900 text-sm font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20">
                        <Zap className="w-4 h-4" />
                        Active Campaigns
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] pointer-events-none" />
                        
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-teal-400" />
                            Compose Campaign
                        </h2>

                        <div className="space-y-5">
                            {/* Audience Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <label className="block">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target Audience</span>
                                    <select 
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                    >
                                        <option value="all">All Registered Users</option>
                                        <option value="pro">Pro Users Only</option>
                                        <option value="elite">Elite/Ultimate Users</option>
                                        <option value="resellers">Resellers</option>
                                        <option value="merchants">Merchants</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Platform</span>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 text-xs font-bold flex items-center justify-center gap-2">
                                            <Smartphone className="w-3 h-3" /> Mobile
                                        </button>
                                        <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                                            <Globe className="w-3 h-3" /> Desktop
                                        </button>
                                    </div>
                                </label>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Notification Title</label>
                                <input 
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Promo Ramadhan: Diskon 50%!"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Message Content</label>
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Write your message here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
                                />
                            </div>

                            {/* Links & Assets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target URL (Deep Link)</label>
                                    <input 
                                        type="text"
                                        value={targetUrl}
                                        onChange={(e) => setTargetUrl(e.target.value)}
                                        placeholder="https://app.tamuu.id/shop/..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Image URL (Optional)</label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                        />
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 mt-8 flex items-center justify-between">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    Estimated Reach: <span className="text-teal-400">14,250 Users</span>
                                </div>
                                <button 
                                    onClick={handleSendBroadcast}
                                    disabled={isSending}
                                    className={`px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all ${isSending ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/30'}`}
                                >
                                    {isSending ? 'Broadcasting...' : 'Launch Campaign'}
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-3xl p-6 shadow-xl sticky top-8">
                        <h2 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-400">
                            Real-time Preview
                        </h2>

                        {/* Mobile Preview Mockup */}
                        <div className="relative mx-auto w-64 h-[500px] bg-slate-900 rounded-[3rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-2xl z-20" />
                            
                            {/* Status Bar */}
                            <div className="p-4 flex justify-between text-[8px] font-bold text-white/50 pt-6">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full border border-white/30" />
                                    <div className="w-3 h-2 bg-white/50 rounded-sm" />
                                </div>
                            </div>

                            {/* Wallpapers/Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-950 z-0" />

                            {/* Notification Card */}
                            <div className="relative z-10 px-3 mt-12">
                                <motion.div 
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-lg bg-teal-500 flex items-center justify-center text-[10px] font-black text-slate-900">T</div>
                                            <span className="text-[9px] font-bold text-white/70">TAMUU</span>
                                        </div>
                                        <span className="text-[8px] text-white/40">now</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-white leading-tight">
                                            {title || 'Your Notification Title'}
                                        </p>
                                        <p className="text-[10px] text-white/70 leading-relaxed line-clamp-2">
                                            {message || 'Write something amazing to grab attention...'}
                                        </p>
                                    </div>
                                    {imageUrl && (
                                        <div className="mt-3 rounded-lg overflow-hidden border border-white/5">
                                            <img src={imageUrl} alt="preview" className="w-full h-20 object-cover" />
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Bottom Bar */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                                <span className="text-[10px] font-bold text-teal-400">System Ready for Broadcast</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">Avoid spamming to prevent unsubscribes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
