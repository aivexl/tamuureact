import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    AlertCircle,
    ArrowLeft,
    Upload,
    Loader2,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { push, storage } from '../../lib/api';
import { useStore } from '../../store/useStore';

export const AdminPushNotificationPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [audience, setAudience] = useState('all');
    const [platform, setPlatform] = useState<'all' | 'mobile' | 'desktop'>('all');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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
                audience,
                // @ts-ignore - added platform support in API but types might not be updated
                platform 
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size too large (max 5MB)');
            return;
        }

        setIsUploading(true);
        const uploadToast = toast.loading('Uploading image...');
        try {
            const res = await storage.upload(file, 'gallery', { userId: user?.id });
            setImageUrl(res.url);
            toast.success('Image uploaded successfully', { id: uploadToast });
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Failed to upload image', { id: uploadToast });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen pt-12 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
            {/* Navigation & Back Button */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span className="hover:text-teal-400 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                    <span>/</span>
                    <span className="text-white">Push Notifications</span>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-3 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                            <BellRing className="w-7 h-7 text-teal-400 animate-pulse" />
                        </div>
                        Push Notifications
                    </h1>
                    <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
                        Pusat kendali broadcast pesan real-time. Kirim promo, update produk, atau info penting langsung ke perangkat user.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg">
                        <History className="w-4 h-4 text-teal-400" />
                        Campaign History
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 text-slate-900 text-sm font-black hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20">
                        <Zap className="w-4 h-4" />
                        Live Status
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Section */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 blur-[120px] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="w-2 h-8 bg-teal-500 rounded-full" />
                                Compose Message
                            </h2>
                            <div className="px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-black uppercase tracking-widest text-teal-400">
                                Enterprise Mode
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Audience & Platform Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 ml-1">
                                        <Target className="w-3.5 h-3.5" /> Target Audience
                                    </label>
                                    <div className="relative group">
                                        <select 
                                            value={audience}
                                            onChange={(e) => setAudience(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all appearance-none cursor-pointer hover:bg-white/[0.07]"
                                        >
                                            <option value="all" className="bg-[#111] text-white py-2">All Registered Users</option>
                                            <option value="pro" className="bg-[#111] text-white py-2">Pro Plan Users</option>
                                            <option value="ultimate" className="bg-[#111] text-white py-2">Ultimate Plan Users</option>
                                            <option value="elite" className="bg-[#111] text-white py-2">Elite/VVIP Users</option>
                                            <option value="merchants" className="bg-[#111] text-white py-2">Active Merchants</option>
                                            <option value="resellers" className="bg-[#111] text-white py-2">Authorized Resellers</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-teal-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 ml-1">
                                        <Smartphone className="w-3.5 h-3.5" /> Platform Delivery
                                    </label>
                                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl gap-1">
                                        {(['all', 'mobile', 'desktop'] as const).map((p) => (
                                            <button 
                                                key={p}
                                                onClick={() => setPlatform(p)}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${platform === p 
                                                    ? 'bg-teal-500 text-slate-900 shadow-lg' 
                                                    : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {p === 'all' ? <Zap className="w-3 h-3" /> : p === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Notification Title</label>
                                <input 
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Promo Ramadhan: Diskon 50%!"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Message Body</label>
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Tulis pesan yang menarik untuk memancing klik user..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none leading-relaxed"
                                />
                            </div>

                            {/* Image Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Notification Image</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input 
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="https://image-url.com/..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all pl-12"
                                            />
                                            <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-slate-900 transition-all disabled:opacity-50"
                                        >
                                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {imageUrl && (
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                                            <img src={imageUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="text-[10px] text-slate-500 truncate flex-1">{imageUrl}</span>
                                            <button onClick={() => setImageUrl('')} className="p-1.5 text-slate-500 hover:text-rose-400"><X className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Target Deep Link</label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={targetUrl}
                                            onChange={(e) => setTargetUrl(e.target.value)}
                                            placeholder="https://app.tamuu.id/shop/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all pl-12"
                                        />
                                        <Zap className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estimated Reach</p>
                                        <p className="text-xl font-black text-white">14,250 <span className="text-xs text-slate-500 font-bold tracking-normal">Devices</span></p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSendBroadcast}
                                    disabled={isSending}
                                    className={`group relative overflow-hidden px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-4 transition-all ${isSending ? 'opacity-50 cursor-not-allowed scale-95' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-teal-500/30'}`}
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Broadcasting...
                                        </>
                                    ) : (
                                        <>
                                            Launch Campaign
                                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-32">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                                Live Preview
                            </h2>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                        </div>

                        {/* Mobile Preview Mockup */}
                        <div className="relative mx-auto w-[280px] h-[580px] bg-slate-950 rounded-[3.5rem] border-[8px] border-slate-900 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-[1.5rem] z-20 flex items-center justify-center gap-4">
                                <div className="w-10 h-1 bg-slate-800 rounded-full" />
                                <div className="w-2 h-2 rounded-full bg-slate-800" />
                            </div>
                            
                            {/* Wallpapers/Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-slate-950 to-indigo-950/40 z-0" />
                            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full" />

                            {/* Status Bar */}
                            <div className="relative z-10 p-6 flex justify-between text-[10px] font-black text-white/60 pt-8">
                                <span>9:41</span>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
                                    <div className="w-5 h-2.5 bg-white/40 rounded-[2px]" />
                                </div>
                            </div>

                            {/* Clock Large */}
                            <div className="relative z-10 text-center mt-8">
                                <h3 className="text-6xl font-thin text-white/90">09:41</h3>
                                <p className="text-xs font-bold text-white/40 mt-2 uppercase tracking-widest">Monday, March 9</p>
                            </div>

                            {/* Notification Stack */}
                            <div className="relative z-10 px-4 mt-16 space-y-3">
                                <motion.div 
                                    layout
                                    initial={{ y: 40, opacity: 0, scale: 0.9 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    className="bg-white/[0.08] backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-4 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-[11px] font-black text-slate-950 shadow-lg shadow-teal-500/20">T</div>
                                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">TAMUU</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-white/30 uppercase">Just Now</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[13px] font-black text-white leading-tight">
                                            {title || 'Your Awesome Title Here'}
                                        </p>
                                        <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">
                                            {message || 'Type something catchy to engage your users. A good message increases CTR by 40%...'}
                                        </p>
                                    </div>
                                    <AnimatePresence>
                                        {imageUrl && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                className="rounded-xl overflow-hidden border border-white/10 shadow-inner"
                                            >
                                                <img src={imageUrl} alt="preview" className="w-full h-32 object-cover hover:scale-110 transition-transform duration-700" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>

                            {/* Home Indicator */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                                </div>
                                <span className="text-xs font-bold text-teal-400/80">System Optimized for Latency</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                </div>
                                <span className="text-xs font-bold text-amber-400/80 leading-tight">Gunakan bahasa persuasif dan emoji untuk hasil terbaik.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
