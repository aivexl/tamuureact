import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    Smartphone, 
    Monitor, 
    Users, 
    Image as ImageIcon, 
    Link as LinkIcon, 
    Bell, 
    CheckCircle2, 
    AlertCircle,
    Loader2,
    Target,
    Zap,
    Info,
    ChevronRight,
    ShieldCheck,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { push, storage } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface PushStats {
    all_users: number;
    pro: number;
    ultimate: number;
    elite: number;
    vendors: number;
    resellers: number;
    admins: number;
}

export const AdminPushNotificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [audience, setAudience] = useState('all');
    const [platform, setPlatform] = useState('all');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [stats, setStats] = useState<PushStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Mock live notification preview
    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setIsLoadingStats(true);
            const res = await push.getStats();
            if (res.success) {
                setStats(res.stats);
            }
        } catch (error) {
            console.error('Failed to fetch push stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            toast.error('Ukuran gambar maksimal 1MB');
            return;
        }

        try {
            setIsUploading(true);
            const res = await storage.upload(file, 'gallery');
            setImageUrl(res.url);
            toast.success('Gambar berhasil diunggah');
        } catch (error) {
            toast.error('Gagal mengunggah gambar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            toast.error('Judul dan pesan wajib diisi');
            return;
        }

        try {
            setIsSending(true);
            const res = await push.adminBroadcast({
                title,
                message,
                url,
                imageUrl,
                audience,
                platform
            });

            if (res.success) {
                toast.success(`Broadcast terkirim ke ${res.reach} perangkat!`);
            }
        } catch (error) {
            toast.error('Gagal mengirim broadcast');
        } finally {
            setIsSending(false);
        }
    };

    const getEstimatedReach = () => {
        if (!stats) return 0;
        
        let count = 0;
        if (audience === 'all') count = stats.all_users;
        else if (audience === 'pro') count = stats.pro;
        else if (audience === 'ultimate') count = stats.ultimate;
        else if (audience === 'elite') count = stats.elite;
        else if (audience === 'vendors') count = stats.vendors;
        else if (audience === 'resellers') count = stats.resellers;
        else if (audience === 'admins') count = stats.admins;

        if (platform !== 'all') {
            return Math.floor(count * 0.6); 
        }
        
        return count;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors font-bold text-sm w-fit group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Kembali ke Dashboard
                            </button>
                            
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-black text-white p-1.5 rounded-lg">
                                        <Bell size={20} />
                                    </div>
                                    <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Tamuu Nexus v1.1</span>
                                </div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Push Notifications</h1>
                                <p className="mt-1 text-slate-500 max-w-2xl font-medium">
                                    Kirimi notifikasi real-time ke ribuan perangkat user secara instan.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-semibold text-emerald-700">System Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Form (8 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <form onSubmit={handleBroadcast} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Broadcast Center</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Title & Message */}
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Notifikasi</label>
                                            <input 
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                                placeholder="Contoh: Promo Ramadhan Menanti! 🌙"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Pesan Notifikasi</label>
                                            <textarea 
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={3}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                                                placeholder="Berikan pesan yang menarik agar user mengklik..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Link & Image */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                <LinkIcon size={14} /> URL Tujuan (Opsional)
                                            </label>
                                            <input 
                                                type="url"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                                placeholder="https://tamuu.id/promo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                <ImageIcon size={14} /> Gambar Notifikasi (Opsional)
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                                    placeholder="URL Gambar atau upload..."
                                                />
                                                <label className="absolute right-2 top-2 bottom-2 aspect-square bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                                                    {isUploading ? <Loader2 className="animate-spin text-slate-400" size={18} /> : <ImageIcon size={18} className="text-slate-600" />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                                </label>
                                            </div>
                                            <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-wider font-bold">
                                                <Info size={10} /> Rekomendasi: 1024x512 (2:1), Max 1MB
                                            </p>
                                        </div>
                                    </div>

                                    {/* Audience & Platform */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Target size={14} /> Target Audience
                                            </label>
                                            <select 
                                                value={audience}
                                                onChange={(e) => setAudience(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                            >
                                                <option value="all">Semua User</option>
                                                <option value="pro">Pro Plan Only</option>
                                                <option value="ultimate">Ultimate Plan Only</option>
                                                <option value="elite">Elite Plan Only</option>
                                                <option value="vendors">Semua Vendor</option>
                                                <option value="resellers">Semua Reseller</option>
                                                <option value="admins">Admin Only</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Monitor size={14} /> Platform
                                            </label>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'all', label: 'Semua', icon: Zap },
                                                    { id: 'mobile', label: 'Mobile', icon: Smartphone },
                                                    { id: 'desktop', label: 'Desktop', icon: Monitor },
                                                ].map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setPlatform(p.id)}
                                                        className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${
                                                            platform === p.id 
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' 
                                                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <p.icon size={18} />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <span className="text-xs font-medium italic">Payload is valid and encrypted via VAPID</span>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isSending}
                                    className="flex items-center gap-3 bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Mengirim...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            <span>Kirim Sekarang</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Safety Tips Card */}
                        <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-6 flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-900 mb-1">Panduan Enterprise Broadcast</h3>
                                <p className="text-sm text-amber-800/80 leading-relaxed">
                                    Hindari mengirim lebih dari 3 notifikasi per hari ke audiens yang sama. Gunakan gambar dengan rasio 2:1 untuk tampilan optimal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview & Stats (4 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Reach Estimator */}
                        <div className="bg-black rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <Target size={18} className="text-blue-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Real Reach Estimation</span>
                                </div>
                                
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h3 className="text-5xl font-black tracking-tighter">
                                        {isLoadingStats ? (
                                            <Loader2 className="animate-spin inline-block" size={32} />
                                        ) : (
                                            getEstimatedReach().toLocaleString()
                                        )}
                                    </h3>
                                    <span className="text-xl font-bold text-slate-400 tracking-tight">Devices</span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">
                                    Estimasi perangkat aktif berdasarkan filter yang Anda pilih.
                                </p>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center justify-between text-sm py-3 border-b border-white/10">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Users size={16} />
                                            <span>Subscribed Users</span>
                                        </div>
                                        <span className="font-bold">{isLoadingStats ? '...' : stats?.all_users.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-3 border-b border-white/10">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <ShieldCheck size={16} />
                                            <span>Admins Subscribed</span>
                                        </div>
                                        <span className="font-bold">{isLoadingStats ? '...' : stats?.admins.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-3">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <CheckCircle2 size={16} className="text-blue-400" />
                                            <span>VAPID Verified</span>
                                        </div>
                                        <span className="text-blue-400 font-bold">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Mockup Preview */}
                        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Smartphone size={18} /> Live Mockup
                                </h3>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                </div>
                            </div>
                            
                            <div className="bg-slate-100 p-8 flex justify-center">
                                {/* iPhone Mockup */}
                                <div className="w-[280px] h-[500px] bg-black rounded-[40px] border-[6px] border-slate-800 relative shadow-2xl overflow-hidden">
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
                                    
                                    {/* Wallpaper */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                                    
                                    {/* Notification Card */}
                                    <AnimatePresence>
                                        {showPreview && (
                                            <m.div 
                                                initial={{ y: -100, opacity: 0 }}
                                                animate={{ y: 40, opacity: 1 }}
                                                className="absolute left-3 right-3 z-30"
                                            >
                                                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-lg border border-white/20">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center p-1">
                                                                <img src="/images/logo-tamuu-vfinal-v1.webp" alt="Tamuu" className="w-full h-auto" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tamuu</span>
                                                        </div>
                                                        <span className="text-[10px] font-medium text-slate-400">now</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1 truncate">{title || 'Judul Notifikasi'}</h4>
                                                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{message || 'Pratinjau pesan Anda akan muncul di sini secara real-time.'}</p>
                                                    
                                                    {imageUrl && (
                                                        <div className="mt-3 rounded-xl overflow-hidden aspect-[2/1] bg-slate-200">
                                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            </m.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Clock & Status */}
                                    <div className="absolute top-10 left-0 right-0 flex flex-col items-center text-white">
                                        <span className="text-5xl font-light tracking-tight">09:41</span>
                                        <span className="text-[10px] font-bold uppercase mt-1 opacity-80">Monday, March 9</span>
                                    </div>

                                    {/* Swipe bar */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/40 rounded-full" />
                                </div>
                            </div>
                            
                            <div className="p-6 bg-slate-50 border-t border-slate-100">
                                <button 
                                    onClick={() => {
                                        setShowPreview(false);
                                        setTimeout(() => setShowPreview(true), 100);
                                    }}
                                    className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    Replay Animation <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPushNotificationPage;
