import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Search, Save, Check, Image as ImageIcon, Globe, MessageCircle } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface SEOPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const SEOPanel: React.FC<SEOPanelProps> = ({ invitationId, onClose }) => {
    const { showModal } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [ogImage, setOgImage] = useState('');
    const [invitationName, setInvitationName] = useState('');
    const [slug, setSlug] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitations.get(invitationId);
                if (data) {
                    setSeoTitle(data.seo_title || '');
                    setSeoDescription(data.seo_description || '');
                    setOgImage(data.og_image || data.thumbnail_url || '');
                    setInvitationName(data.name || '');
                    setSlug(data.slug || '');
                }
            } catch (error) {
                console.error('Failed to load SEO data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [invitationId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await invitations.update(invitationId, {
                seo_title: seoTitle,
                seo_description: seoDescription
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error('Failed to save SEO data:', error);
            showModal({
                title: 'Gagal Menyimpan',
                message: error.message || 'Terjadi kesalahan saat menyimpan pengaturan Preview Sosmed. Silakan coba lagi.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader variant="inline" showLabel label="Memuat Pengaturan Sosmed Preview..." />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Side */}
                <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-6 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Preview Social Media</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Sosmed Title</label>
                                <input
                                    value={seoTitle}
                                    onChange={e => setSeoTitle(e.target.value)}
                                    type="text"
                                    placeholder={invitationName || "Judul Undangan"}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                />
                                <p className="text-[9px] text-slate-400 ml-4 font-medium italic">Judul yang muncul di tab browser dan pratinjau link.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Meta Description</label>
                                <textarea
                                    value={seoDescription}
                                    onChange={e => setSeoDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Kami mengundang Anda untuk hadir di acara pernikahan kami..."
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 resize-none"
                                />
                            </div>

                            <div className="space-y-1 opacity-60">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Preview Image</label>
                                <p className="text-[9px] text-slate-400 ml-4 font-medium italic">Gambar preview ditentukan secara otomatis dari thumbnail undangan Anda.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Side */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <MessageCircle className="w-5 h-5 text-emerald-500" />
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Live Preview (WhatsApp / Sosmed)</h4>
                    </div>

                    <div className="bg-[#E7F0F7] rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <MessageCircle className="w-20 h-20" />
                        </div>

                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-[320px] mx-auto border border-slate-100">
                            {/* Preview Image */}
                            <div className="aspect-[1200/630] bg-slate-100 relative group">
                                {ogImage ? (
                                    <img src={ogImage} alt="Sosmed Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <ImageIcon className="w-12 h-12 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Tanpa Gambar Preview</span>
                                    </div>
                                )}
                            </div>

                            {/* Preview Content */}
                            <div className="p-4 space-y-1">
                                <h5 className="font-bold text-slate-900 text-sm line-clamp-1">{seoTitle || invitationName || "Judul Undangan"}</h5>
                                <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                                    {seoDescription || "Nikmati pengalaman mengundang tamu yang lebih berkesan dengan Tamuu.id..."}
                                </p>
                                <p className="text-emerald-600 text-[10px] font-bold mt-2 uppercase tracking-tight">tamuu.id/{slug || "username"}</p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                Preview ini adalah representasi<br />bagaimana link akan terbaca di sistem sosial media.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 h-16 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-2xl active:scale-95 ${success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-900/20'}`}
                >
                    {saving ? (
                        <PremiumLoader variant="inline" color="white" />
                    ) : success ? (
                        <>
                            <Check className="w-6 h-6" />
                            Pengaturan Sosmed Disimpan
                        </>
                    ) : (
                        <>
                            <Save className="w-6 h-6" />
                            Simpan Pengaturan Preview
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
