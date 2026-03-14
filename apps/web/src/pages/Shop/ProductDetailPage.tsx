import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    ExternalLink,
    ArrowUpRight,
    Share2,
    Heart,
    MessageCircle,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Truck,
    MapPin,
    Tag,
    ShoppingBag,
    Star,
    ShieldAlert,
    Search,
    ChevronDown,
    User as UserIcon,
    LayoutDashboard,
    CreditCard,
    LogOut,
    Map,
    Megaphone,
    Send,
    Phone, 
    Globe, 
    Instagram, 
    Facebook, 
    Youtube,
    Eye, 
    EyeOff
} from 'lucide-react';
import {
    useProductDetails,
    useTrackInteraction,
    useToggleWishlist,
    useWishlist,
    useMerchantProducts,
    useMerchantStats,
    useSmartRecommendations
} from '../../hooks/queries/useShop';
import { shop, type Review } from '../../lib/api';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { Footer } from '../../components/Layout/Footer';
import { useStore } from '../../store/useStore';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency, formatAbbreviatedNumber, parseUTCDate } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { ReportProductModal } from '../../components/Modals/ReportProductModal';
import { ShareModal } from '../../components/Modals/ShareModal';
import { INDONESIA_REGIONS } from '../../constants/regions';
import { AnimatedCopyIcon } from '../../components/ui/AnimatedCopyIcon';
import { StarRating } from '../../components/Shop/StarRating';
import { Navbar } from '../../components/Layout/Navbar';

const XLogoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);

export const ProductDetailPage: React.FC = () => {
    const { slug, productId } = useParams<{ slug: string, productId: string }>();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [revealedContacts, setRevealedContacts] = useState<Record<string, boolean>>({});
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const toggleReveal = (key: string) => {
        setRevealedContacts(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const { user, isAuthenticated, logout, token } = useStore();

    // System Config
    const [systemSettings, setSystemSettings] = useState<any>(null);
    useEffect(() => {
        shop.getSystemSettings().then(res => setSystemSettings(res.settings));
    }, []);

    // Data Fetching
    const { data: product, isLoading: isLoadingProduct, refetch: refetchProduct } = useProductDetails(productId || '');
    const { data: wishlist = [] } = useWishlist(user?.id);
    const { data: merchantProducts = [] } = useMerchantProducts(product?.merchant_id);
    const { data: merchantStats } = useMerchantStats(product?.merchant_id);
    const { data: recommendations = [] } = useSmartRecommendations(productId, product?.kategori_produk);
    const [visibleRecs, setVisibleRecs] = useState(4);

    const toggleWishlistMutation = useToggleWishlist();
    const track = useTrackInteraction();

    const isWishlisted = wishlist.some((item: any) => item.id === product?.id);

    // Minimalist Secure Contact Component
    const SecureContactItem = ({ 
        id, 
        icon: Icon, 
        label, 
        value, 
        isLink = false,
        iconColor = "text-[#0A1128]",
        customIcon = null
    }: { 
        id: string, 
        icon?: any, 
        label: string, 
        value?: string, 
        isLink?: boolean,
        iconColor?: string,
        customIcon?: React.ReactNode
    }) => {
        if (!value) return null;
        const isRevealed = revealedContacts[id];

        const handleOpenLink = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!isRevealed) return;

            let url = value.startsWith('http') ? value : `https://${value}`;
            if (id === 'wa' || id === 'phone') {
                const cleanNumber = value.replace(/\D/g, '');
                url = `https://wa.me/${cleanNumber}`;
            } else if (id === 'ig' && !value.includes('instagram.com')) {
                url = `https://instagram.com/${value.replace('@', '')}`;
            } else if (id === 'tiktok' && !value.includes('tiktok.com')) {
                url = `https://tiktok.com/@${value.replace('@', '')}`;
            }
            window.open(url, '_blank');
        };

        return (
            <div 
                onClick={() => {
                    if (!isAuthenticated) {
                        toast.error('Silakan login untuk melihat detail kontak vendor.');
                        navigate('/login');
                        return;
                    }
                    if (!isRevealed) {
                        toggleReveal(id);
                        if (product?.id) {
                            track.mutate({ merchantId: product.merchant_id, actionType: 'CLICK_CONTACT', metadata: JSON.stringify({ contact_type: id, product_id: product.id }) } as any);
                        }
                    }
                }}
                className={`flex items-center gap-2.5 py-3 px-3 transition-all duration-300 border border-slate-50 rounded-xl hover:bg-slate-50/50 ${!isRevealed ? 'cursor-pointer' : ''}`}
            >
                <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0 group-hover:scale-110 transition-transform ${iconColor}`}>
                    {customIcon || (Icon && <Icon size={14} />)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="relative">
                        {!isRevealed ? (
                            <div className="flex items-center gap-1 text-indigo-600 font-black uppercase tracking-tighter italic text-[9px]">
                                <Eye className="w-2.5 h-2.5" />
                                <span>Tampilkan</span>
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold text-[#0A1128] truncate">
                                {value}
                            </p>
                        )}
                    </div>
                </div>
                {isRevealed && isLink && (
                    <button 
                        onClick={handleOpenLink}
                        className="w-6 h-6 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all border border-slate-100"
                        title="Buka Tautan"
                    >
                        <ArrowUpRight className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    };

    const MarketplaceIcon = ({ url, src, alt }: { url?: string, src: string, alt: string }) => {
        if (!url) return null;
        return (
            <a 
                href={url.startsWith('http') ? url : `https://${url}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300 group"
                onClick={() => {
                    if (product?.id) track.mutate({ merchantId: product.merchant_id, actionType: 'CLICK_CONTACT', metadata: JSON.stringify({ contact_type: alt.toLowerCase(), product_id: product.id }) } as any);
                }}
                title={`Kunjungi ${alt}`}
            >
                <img src={src} alt={alt} className="w-7 h-7 object-contain filter grayscale group-hover:grayscale-0 transition-all" />
            </a>
        );
    };

    // Reviews State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const fetchReviews = async () => {
        if (!productId) return;
        setIsLoadingReviews(true);
        try {
            const data = await shop.getProductReviews(productId);
            setReviews(data);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const hasUserReviewed = useMemo(() => {
        return reviews.some(r => r.user_id === user?.id);
    }, [reviews, user?.id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !token) {
            toast.error('Silakan login untuk memberikan ulasan');
            return;
        }
        if (!productId) return;

        setIsSubmittingReview(true);
        try {
            await shop.submitReview(productId, { rating: userRating, comment: userComment }, token);
            toast.success('Ulasan berhasil dikirim!');
            setUserComment('');
            fetchReviews();
            refetchProduct(); 
        } catch (err: any) {
            toast.error(err.message || 'Gagal mengirim ulasan');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const otherProducts = useMemo(() => 
        (merchantProducts || [])
            .filter((p: any) => 
                p.id !== productId && 
                p.status === 'PUBLISHED' && 
                p.is_approved === 1
            )
            .slice(0, 10),
    [merchantProducts, productId]);

    useSEO({
        title: product ? `${product.nama_produk} | Tamuu Shop` : 'Product Details - Tamuu Shop',
        description: product?.deskripsi || 'Detail produk terbaik di Tamuu Shop.'
    });

    useEffect(() => {
        if (product?.id) {
            track.mutate({ merchantId: product.merchant_id, actionType: 'VIEW_PRODUCT', productId: product.id });
        }
    }, [product?.id]);

    const handleWhatsApp = () => {
        const text = `Halo, saya tertarik dengan produk ${product?.nama_produk} di Tamuu Shop. Apakah masih tersedia?`;
        const waNumber = product?.whatsapp || product?.m_whatsapp || merchantStats?.whatsapp || '';
        window.open(`https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleChat = () => {
        if (!isAuthenticated) {
            toast.error('Silakan login untuk memulai chat.');
            navigate('/login');
            return;
        }
        navigate(`/dashboard?tab=messages&merchantId=${product.merchant_id}`);
    };

    const handlePrimaryContact = () => {
        // Analytics
        if (product?.id) {
            track.mutate({ merchantId: product.merchant_id, actionType: 'CLICK_CONTACT', productId: product.id });
        }

        // Resolve the primary contact mode
        // 1. Product-specific choice (STRICT)
        // 2. Merchant-level fallback choice
        // 3. Default to whatsapp
        const mode = product?.kontak_utama ?? (product as any)?.m_kontak_utama ?? merchantStats?.kontak_utama ?? 'whatsapp';

        // Check global mode preference as a secondary override/fallback
        const globalMode = systemSettings?.global_chat_mode;
        
        const getUrl = (val: string | undefined, platform: string) => {
            if (!val || val.length < 2) return null;
            if (val.startsWith('http')) return val;
            switch(platform) {
                case 'instagram': return `https://instagram.com/${val.replace('@', '')}`;
                case 'tiktok': return `https://tiktok.com/@${val.replace('@', '')}`;
                case 'facebook': return `https://facebook.com/${val}`;
                case 'x': return `https://x.com/${val.replace('@', '')}`;
                case 'youtube': return val.includes('youtube.com') ? val : `https://youtube.com/${val}`;
                case 'tokopedia': return val.startsWith('tokopedia.com') ? `https://${val}` : `https://tokopedia.com/${val}`;
                case 'shopee': return val.startsWith('shopee.co.id') ? `https://${val}` : `https://shopee.co.id/${val}`;
                default: return `https://${val}`;
            }
        };

        const fallbackToGlobal = () => {
            if (globalMode === 'internal') return handleChat();
            handleWhatsApp();
        };

        switch (mode) {
            case 'chat': 
            case 'internal':
                return handleChat();
            
            case 'phone': {
                const phone = product.phone || (product as any).m_phone || merchantStats?.phone;
                if (phone) window.open(`tel:${phone}`, '_self');
                else handleWhatsApp();
                break;
            }
            
            case 'instagram': {
                const url = getUrl(product.instagram || (product as any).m_instagram || merchantStats?.instagram, 'instagram');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'facebook': {
                const url = getUrl(product.facebook || (product as any).m_facebook || merchantStats?.facebook, 'facebook');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'tiktok': {
                const url = getUrl(product.tiktok_url || (product as any).m_tiktok_url || merchantStats?.tiktok, 'tiktok');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'x': {
                const url = getUrl(product.x_url || (product as any).m_x_url || merchantStats?.x_url, 'x');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'youtube': {
                const url = getUrl(product.youtube_url || (product as any).m_youtube_url || merchantStats?.youtube_url, 'youtube');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'website': {
                const url = getUrl(product.website_url || (product as any).m_website || merchantStats?.website, 'website');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'tokopedia': {
                const url = getUrl(product.tokopedia_url || (product as any).m_tokopedia_url || merchantStats?.tokopedia_url, 'tokopedia');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'shopee': {
                const url = getUrl(product.shopee_url || (product as any).m_shopee_url || merchantStats?.shopee_url, 'shopee');
                if (url) window.open(url, '_blank');
                else handleWhatsApp();
                break;
            }
            
            case 'whatsapp':
                return handleWhatsApp();
                
            default: 
                return fallbackToGlobal();
        }
    };

    const getPrimaryButtonLabel = () => {
        if (!product) return 'Hubungi Sekarang';

        const mode = product?.kontak_utama || (product as any)?.m_kontak_utama || merchantStats?.kontak_utama || 'whatsapp';
        
        // If we want to respect global mode as a secondary label override
        const globalMode = systemSettings?.global_chat_mode;
        if (mode === 'whatsapp' && globalMode === 'internal') return 'Chat Penjual';

        switch (mode) {
            case 'chat': return 'Chat Sekarang';
            case 'internal': return 'Chat Sekarang';
            case 'phone': return 'Hubungi Telepon';
            case 'instagram': return 'Buka Instagram';
            case 'facebook': return 'Buka Facebook';
            case 'tiktok': return 'Buka TikTok';
            case 'x': return 'Buka X (Twitter)';
            case 'youtube': return 'Buka YouTube';
            case 'website': return 'Kunjungi Website';
            case 'tokopedia': return 'Beli di Tokopedia';
            case 'shopee': return 'Beli di Shopee';
            case 'whatsapp': return 'Chat WhatsApp';
            default: return 'Hubungi Sekarang';
        }
    };

    const getPrimaryButtonIcon = () => {
        if (!product) return <MessageCircle className="w-5 h-5" />;

        const mode = product?.kontak_utama || (product as any)?.m_kontak_utama || merchantStats?.kontak_utama || 'whatsapp';
        
        switch (mode) {
            case 'chat': return <MessageSquare className="w-5 h-5" />;
            case 'internal': return <MessageSquare className="w-5 h-5" />;
            case 'phone': return <Phone className="w-5 h-5" />;
            case 'instagram': return <Instagram className="w-5 h-5" />;
            case 'facebook': return <Facebook className="w-5 h-5" />;
            case 'tiktok': return <TikTokIcon className="w-5 h-5" />;
            case 'x': return <XLogoIcon className="w-5 h-5" />;
            case 'youtube': return <Youtube className="w-5 h-5" />;
            case 'website': return <Globe className="w-5 h-5" />;
            case 'tokopedia': return <img src="/images/logos/marketplace/logo_tokopedia.png" className="w-5 h-5 object-contain" alt="" />;
            case 'shopee': return <img src="/images/logos/marketplace/logo_shopee.png" className="w-5 h-5 object-contain" alt="" />;
            case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
            default: return <MessageCircle className="w-5 h-5" />;
        }
    };

    const toggleWishlist = () => {
        if (!user) {
            toast.error('Silakan login untuk menambahkan ke wishlist');
            navigate('/login');
            return;
        }

        toggleWishlistMutation.mutate({ userId: user.id, productId: product?.id || '' });
        toast.success(isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist', {
            icon: <Heart className={`w-4 h-4 ${!isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />,
        });
    };

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    if (isLoadingProduct) return <div className="min-h-screen bg-white flex items-center justify-center"><PremiumLoader color="#0A1128" /></div>;
    if (!product) return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#0A1128]">
        <h2 className="text-2xl font-black mb-4">Produk Tidak Ditemukan</h2>
        <button onClick={() => navigate(`/shop/${slug === 'admin' ? 'umum' : (slug || 'umum')}`)} className="text-[#FFBF00] font-bold">Kembali ke Toko</button>
    </div>;

    const images = product.images || [];

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            <Navbar />

            <main className="pt-[140px] md:pt-40 pb-40">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* LEFT: Image Gallery */}
                    <div className="space-y-6">
                        <div className="relative aspect-square max-h-[550px] w-full rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 group shadow-sm">
                            <AnimatePresence mode="wait">
                                <m.img
                                    key={currentImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    src={images[currentImageIndex]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'}
                                    alt={product.nama_produk}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {images.map((img: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                                        idx === currentImageIndex ? 'border-[#FFBF00]' : 'border-transparent opacity-60'
                                    }`}
                                >
                                    <img src={img.image_url} className="w-full h-full object-cover" alt="Thumb" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="flex flex-col">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                                    <span className="px-3 py-1 rounded-lg bg-[#FFBF00]/10 text-[#FFBF00] text-[9px] font-black uppercase tracking-widest border border-[#FFBF00]/20 truncate">
                                        {product.kategori_produk}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1 truncate">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {product.kota}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button 
                                        onClick={handleShare}
                                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white transition-all shadow-sm"
                                        title="Bagikan Produk"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-2 pl-3 pr-4 py-2 bg-rose-50 border border-rose-100 rounded-xl min-w-[80px]">
                                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                        <span className="text-xs font-black text-rose-600 uppercase tracking-tighter whitespace-nowrap">
                                            {formatAbbreviatedNumber(product.wishlist_count || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-[#0A1128] uppercase tracking-tight italic leading-none">{product.nama_produk}</h1>
                                <div className="flex flex-col gap-3 pt-1">
                                    <StarRating 
                                        rating={product.avg_rating || 0} 
                                        count={product.review_count || 0} 
                                        size={18} 
                                    />
                                    {(product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url || product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url) && (
                                        <div className="flex items-center gap-4">
                                            <MarketplaceIcon url={product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url} src="/images/logos/marketplace/logo_shopee.png" alt="Shopee" />
                                            <MarketplaceIcon url={product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url} src="/images/logos/marketplace/logo_tokopedia.png" alt="Tokopedia" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="py-6 border-y border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimasi Harga</p>
                                <p className="text-4xl font-black text-[#0A1128] tracking-tighter">
                                    {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                        ? formatCurrency(product.harga_estimasi) 
                                        : (product.harga_estimasi || 'Tanyakan Harga')}
                                </p>
                            </div>

                            {/* Merchant & Contact Section (Repositioned & Compact) */}
                            <div className="p-6 md:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                {/* Store Card */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100/50">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg flex-shrink-0">
                                        <img 
                                            src={product.is_admin_listing ? `https://api.dicebear.com/7.x/initials/svg?seed=${product.custom_store_name || 'Admin'}` : (product.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${product.nama_toko}`)} 
                                            alt={product.is_admin_listing ? product.custom_store_name : product.nama_toko} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 text-center sm:text-left">
                                        <h3 className="text-lg font-black text-[#0A1128] truncate">
                                            {product.is_admin_listing ? (product.custom_store_name || 'Official Partner') : product.nama_toko}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1 mb-2">
                                            <MapPin className="w-3 h-3 text-[#FFBF00]" />
                                            {product.kota || 'Nasional'}
                                        </p>
                                        
                                        <div className="flex items-center justify-center sm:justify-start gap-4 mt-1">
                                            <div className="flex items-center gap-1">
                                                <ShoppingBag className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                    {(merchantStats?.total_products || 0)} Produk
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                    {(merchantStats?.avg_rating || product.avg_rating) ? Number(merchantStats?.avg_rating || product.avg_rating).toFixed(1) : "0.0"} ({(merchantStats?.review_count || product.review_count || 0)})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                    {(merchantStats?.total_wishlist || product.wishlist_count || 0)} Love
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!product.is_admin_listing && (
                                        <Link to={`/shop/${product.merchant_slug === 'admin' ? 'umum' : (slug || 'umum')}`} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center hover:bg-[#0A1128] hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    )}
                                </div>

                                {/* Compact Contact Grid (Seamless) */}
                                <div className="space-y-4">
                                    {/* Baris 1: WhatsApp & Chat Internal */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><SecureContactItem id="wa" label="WhatsApp" value={product.whatsapp || product.m_whatsapp || merchantStats?.whatsapp} icon={MessageCircle} iconColor="text-[#25D366]" isLink /></div>
                                        <div><SecureContactItem id="chat" label="Chat" value="Tanya di Sini" icon={MessageSquare} iconColor="text-indigo-600" isLink /></div>
                                    </div>

                                    {/* Baris 2: No Telepon & Sosmed Utama */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><SecureContactItem id="phone" label="Telepon" value={product.phone || product.m_phone || merchantStats?.phone} icon={Phone} iconColor="text-slate-600" isLink /></div>
                                        <div><SecureContactItem id="ig" label="Instagram" value={product.instagram || product.m_instagram || merchantStats?.instagram} icon={Instagram} iconColor="text-[#E4405F]" isLink /></div>
                                    </div>

                                    {/* Baris 3: Sosial Media & Website */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><SecureContactItem id="web" label="Website" value={product.website_url || product.m_website || merchantStats?.website} icon={Globe} iconColor="text-indigo-600" isLink /></div>
                                        <div><SecureContactItem id="tiktok" label="TikTok" value={product.tiktok_url || product.m_tiktok_url || merchantStats?.tiktok} customIcon={<TikTokIcon className="w-3.5 h-3.5" />} iconColor="text-black" isLink /></div>
                                    </div>

                                    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                                        {product.facebook && <div><SecureContactItem id="fb" label="" value={product.facebook} icon={Facebook} iconColor="text-[#1877F2]" isLink /></div>}
                                        {product.x_url && <div><SecureContactItem id="x" label="" value={product.x_url} customIcon={<XLogoIcon className="w-3.5 h-3.5" />} iconColor="text-black" isLink /></div>}
                                        {product.youtube_url && <div><SecureContactItem id="yt" label="" value={product.youtube_url} icon={Youtube} iconColor="text-[#FF0000]" isLink /></div>}
                                    </div>

                                    {/* Baris 4: Marketplace (Icons Only) */}
                                    {(product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url || product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url) && (
                                        <div className="flex items-center gap-6 px-3 pt-2">
                                            <div className="w-10 h-10 flex items-center justify-center">
                                                <MarketplaceIcon url={product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url} src="/images/logos/marketplace/logo_shopee.png" alt="Shopee" />
                                            </div>
                                            <div className="w-10 h-10 flex items-center justify-center">
                                                <MarketplaceIcon url={product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url} src="/images/logos/marketplace/logo_tokopedia.png" alt="Tokopedia" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM CONTENT SECTION */}
                <div className="max-w-7xl mx-auto px-6 mt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 flex flex-col gap-8">
                            {/* Deskripsi Card - Main Position */}
                            <m.div 
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 flex flex-col"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                                    <h2 className="text-xl font-black uppercase tracking-tighter italic">Deskripsi Produk</h2>
                                </div>
                                
                                <div className="relative">
                                    <m.div 
                                        animate={{ height: isDescriptionExpanded ? 'auto' : '200px' }}
                                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        className="overflow-hidden relative"
                                    >
                                        <div className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                                            {product.deskripsi || "Vendor belum memberikan deskripsi lengkap untuk produk ini."}
                                        </div>
                                        
                                        {!isDescriptionExpanded && product.deskripsi && product.deskripsi.length > 300 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                        )}
                                    </m.div>

                                    {product.deskripsi && product.deskripsi.length > 300 && (
                                        <button 
                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            className="mt-4 flex items-center gap-2 text-[#FFBF00] font-black uppercase tracking-widest text-[10px] hover:text-[#0A1128] transition-colors group"
                                        >
                                            {isDescriptionExpanded ? (
                                                <>Tampilkan Lebih Sedikit <ChevronDown className="w-3 h-3 rotate-180 transition-transform" /></>
                                            ) : (
                                                <>Baca Selengkapnya <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" /></>
                                            )}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between mt-auto gap-4">
                                    <div 
                                        className="group flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all w-full sm:w-auto justify-center"
                                    >
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            No. Produk: <span className="text-slate-600 font-black">tamuu-shop-{product.id.substring(0, 8).toUpperCase()}</span>
                                        </span>
                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#FFBF00] transition-all">
                                            <AnimatedCopyIcon text={`tamuu-shop-${product.id.substring(0, 8).toUpperCase()}`} size={16} successMessage="ID Produk disalin!" />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-100 text-rose-500 transition-all w-full sm:w-auto"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Lapor</span>
                                    </button>
                                </div>
                            </m.div>
                        </div>

                        {/* Right Column (Spans 5/12) - Alamat Stacked */}
                        <div className="lg:col-span-5 flex flex-col gap-8">
                            <m.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                                        <h2 className="text-xl font-black uppercase tracking-tighter italic">Alamat Lengkap</h2>
                                    </div>
                                    {product.alamat_lengkap && (
                                        <div className="p-1 bg-slate-50 hover:bg-[#FFBF00]/10 rounded-2xl transition-all">
                                            <AnimatedCopyIcon text={product.alamat_lengkap} size={20} className="text-slate-400 hover:text-[#0A1128]" successMessage="Alamat disalin!" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    {product.alamat_lengkap ? (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                                                <p className="text-slate-600 text-lg font-bold leading-relaxed uppercase tracking-tight">
                                                    {product.alamat_lengkap}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                                {product.kota || "Lokasi Terverifikasi"}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 space-y-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                                <MapPin className="w-6 h-6 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Alamat belum tersedia</p>
                                        </div>
                                    )}
                                </div>

                                {product.google_maps_url && (
                                    <a 
                                        href={product.google_maps_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full h-14 bg-[#0A1128] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
                                    >
                                        <Map className="w-4 h-4 text-[#FFBF00]" />
                                        Buka Di Google Maps
                                    </a>
                                )}
                            </m.div>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <section className="max-w-7xl mx-auto px-6 mt-32">
                    <div className="bg-white rounded-[3rem] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-8 md:p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-1.5 bg-[#FFBF00] rounded-full" />
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0A1128]">Ulasan & Penilaian</h2>
                                </div>
                                <p className="text-slate-500 font-medium max-w-md">Apa kata mereka yang telah merasakan pengalaman terbaik dengan produk ini.</p>
                            </div>
                            
                            <div className="flex items-center gap-6 bg-slate-50/80 p-6 rounded-3xl border border-slate-100 self-start md:self-auto">
                                <div className="text-center">
                                    <p className="text-4xl font-black text-[#0A1128] leading-none mb-1">{product.avg_rating?.toFixed(1) || '0.0'}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average</p>
                                </div>
                                <div className="h-10 w-px bg-slate-200" />
                                <div className="flex flex-col items-center">
                                    <StarRating rating={product.avg_rating || 0} count={product.review_count || 0} size={18} showCount={false} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{product.review_count || 0} Reviews</p>
                                </div>
                            </div>
                        </div>

                        {isAuthenticated && !hasUserReviewed && (
                            <m.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-20"
                            >
                                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 space-y-8 relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-[#0A1128]">Tulis Ulasan</h3>
                                            <p className="text-xs text-slate-400 font-medium tracking-tight">Bagikan pengalaman autentik Anda.</p>
                                        </div>
                                        <div className="flex gap-1.5 bg-slate-50/50 p-2 rounded-2xl border border-slate-100/50 self-start md:self-auto">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button 
                                                    key={s} 
                                                    onClick={() => setUserRating(s)}
                                                    className="transition-all hover:scale-110 active:scale-90"
                                                >
                                                    <Star 
                                                        size={22}
                                                        className={`transition-colors ${s <= userRating ? 'fill-[#FFBF00] text-[#FFBF00]' : 'text-slate-200'}`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={handleReviewSubmit} className="space-y-5">
                                        <textarea
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            placeholder="Bagaimana pelayanan vendor ini?"
                                            className="w-full h-28 p-5 bg-slate-50/30 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-0 focus:border-[#FFBF00]/40 outline-none transition-all placeholder:text-slate-300 resize-none"
                                            required
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmittingReview}
                                                className="px-8 py-3.5 bg-[#0A1128] text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-black/5"
                                            >
                                                {isSubmittingReview ? <PremiumLoader size="sm" color="white" /> : <Send className="w-3.5 h-3.5 text-[#FFBF00]" />}
                                                Kirim Ulasan
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </m.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {isLoadingReviews ? (
                                <div className="col-span-full py-20 flex justify-center">
                                    <PremiumLoader size="md" />
                                </div>
                            ) : reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <m.div 
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="p-8 bg-white border border-slate-50 rounded-[2rem] space-y-6 hover:shadow-xl hover:shadow-slate-100 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0A1128] text-sm font-black uppercase tracking-widest border border-slate-100 group-hover:scale-110 transition-transform">
                                                    {review.user_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[#0A1128] truncate">{review.user_name || 'User Tamuu'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {parseUTCDate(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100 shrink-0">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star 
                                                        key={s}
                                                        size={10} 
                                                        className={`${s <= review.rating ? 'fill-[#FFBF00] text-[#FFBF00]' : 'text-slate-200'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <p className="text-slate-600 text-base font-medium leading-relaxed italic pr-4">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    </m.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 space-y-6">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                                        <Star className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-black text-[#0A1128]">Belum Ada Ulasan</p>
                                        <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Jadilah yang pertama memberikan penilaian untuk produk ini.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Horizontal Grid: Other Products from Store - MOVED BELOW REVIEWS */}
                {otherProducts.length > 0 && !product.is_admin_listing && (
                    <div className="max-w-7xl mx-auto px-6 mt-32 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-[#FFBF00] rounded-full" />
                            <h2 className="text-xl font-black uppercase tracking-widest text-[#0A1128] italic">Produk Lain Dari Toko Ini</h2>
                        </div>
                        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-2 px-2">
                            {otherProducts.map((p: any) => (
                                <m.div
                                    key={p.id}
                                    whileHover={{ y: -8 }}
                                    onClick={() => navigate(`/shop/${product.merchant_slug === 'admin' ? 'umum' : product.merchant_slug}/${p.slug || p.id}`)}
                                    className="w-48 flex-shrink-0 cursor-pointer group bg-white p-3 rounded-[2rem] border border-slate-50 hover:shadow-2xl hover:shadow-slate-100 transition-all"
                                >
                                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-4 relative">
                                        <img src={p.images?.[0]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.nama_produk} />
                                    </div>
                                    <div className="px-1 space-y-1">
                                        <p className="text-[11px] font-black text-[#0A1128] uppercase truncate leading-tight group-hover:text-[#FFBF00] transition-colors">{p.nama_produk}</p>
                                        <p className="text-[10px] font-bold text-[#FFBF00]">{p.harga_estimasi && !isNaN(Number(p.harga_estimasi)) ? formatCurrency(p.harga_estimasi) : p.harga_estimasi}</p>
                                    </div>
                                </m.div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-6 mt-24 space-y-24">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Mungkin Kamu Suka</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 md:gap-8">
                            {recommendations.slice(0, visibleRecs).map((p: any) => (
                                <m.div
                                    key={p.id}
                                    whileHover={{ y: -8 }}
                                    onClick={() => navigate(`/shop/${p.merchant_slug}/${p.slug || p.id}`)}
                                    className="group cursor-pointer bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden hover:shadow-xl transition-all relative w-full md:w-[195px] h-[320px] md:h-[380px] flex-shrink-0 flex flex-col"
                                >
                                    <div className="relative h-[140px] md:h-[180px] overflow-hidden flex-shrink-0">
                                        <img src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.nama_produk} />
                                    </div>

                                    <div className="p-3 md:p-4 flex flex-col flex-1 min-w-0">
                                        <h4 className="text-[10px] md:text-xs font-black text-[#0A1128] uppercase line-clamp-3 group-hover:text-[#FFBF00] transition-colors leading-tight min-h-[2.2rem] md:min-h-[2.8rem] mb-1.5 md:mb-2 pb-1">
                                            {p.nama_produk}
                                        </h4>
                                        <StarRating rating={p.avg_rating || 0} count={p.review_count || 0} size={10} className="mb-2" />
                                        <div className="mt-auto space-y-2">
                                            <div className="pt-2 border-t border-slate-50">
                                                <p className="text-[11px] md:text-sm font-black text-[#0A1128] tracking-tight truncate">
                                                    {p.harga_estimasi && !isNaN(Number(p.harga_estimasi)) ? formatCurrency(p.harga_estimasi) : p.harga_estimasi}
                                                </p>
                                                <p className="text-[8px] md:text-[9px] font-black text-[#FFBF00] uppercase tracking-widest truncate mt-1">
                                                    {p.nama_toko}
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <span className="flex items-center gap-1 text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                    <MapPin className="w-2 h-2" />
                                                    {p.kota?.replace(/^(kota|kab\.)\s+/gi, '') || 'Nasional'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                    <Tag className="w-2 h-2" />
                                                    {p.kategori_produk || 'Umum'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </m.div>
                            ))}
                        </div>

                        {recommendations.length > visibleRecs && visibleRecs < 10 && (
                            <div className="flex justify-center mt-8">
                                <button 
                                    onClick={() => setVisibleRecs(prev => Math.min(prev + 4, 10))}
                                    className="px-10 py-4 bg-[#0A1128] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-100"
                                >
                                    Tampilkan Lebih Banyak
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-10 pt-8 pointer-events-none">
                <div className="max-w-3xl mx-auto flex gap-4 pointer-events-auto">
                    <button
                        onClick={toggleWishlist}
                        className={`w-16 h-16 rounded-[2rem] border flex items-center justify-center transition-all shadow-xl ${isWishlisted
                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                            : 'bg-white border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-200'
                            }`}
                    >
                        <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={handlePrimaryContact}
                        className="flex-1 h-16 bg-[#0A1128] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {getPrimaryButtonIcon()}
                        {getPrimaryButtonLabel()}
                    </button>
                </div>
            </div>

            <ReportProductModal 
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                productId={product.id}
                productName={product.nama_produk}
            />

            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={product.nama_produk}
                url={window.location.href}
                type="product"
            />
        </div>
    );
};

export default ProductDetailPage;
