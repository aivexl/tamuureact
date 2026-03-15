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

    const [sidebarAds, setSidebarAds] = useState<any[]>([]);
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const ads = await shop.getAds('PRODUCT_DETAIL_SIDEBAR');
                setSidebarAds(ads || []);
            } catch (err) {
                console.error('Failed to fetch sidebar ads:', err);
            }
        };
        fetchAds();
    }, []);

    const toggleWishlistMutation = useToggleWishlist();
    const track = useTrackInteraction();

    const isWishlisted = wishlist.some((item: any) => item.id === product?.id);

    // Premium Vendor Contact Component
    const VendorContactItem = ({ 
        id, 
        icon: Icon, 
        label, 
        value, 
        type = 'link', 
        iconColor = "text-[#0A1128]",
        customIcon = null,
        imgSrc = null,
        logoOnly = false,
        compact = false,
        noHide = false
    }: { 
        id: string, 
        icon?: any, 
        label: string, 
        value?: string, 
        type?: 'link' | 'copy' | 'chat' | 'marketplace',
        iconColor?: string,
        customIcon?: React.ReactNode,
        imgSrc?: string | null,
        logoOnly?: boolean,
        compact?: boolean,
        noHide?: boolean
    }) => {
        if (!value) return <div className={`h-11 bg-slate-50/10 border border-dashed border-slate-100/20 rounded-xl ${logoOnly ? 'w-full' : ''}`} />;
        const isRevealed = noHide || revealedContacts[id];

        const handleAction = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!isAuthenticated) {
                toast.error('Silakan login untuk detail kontak vendor.');
                navigate('/login');
                return;
            }

            if (!isRevealed) {
                toggleReveal(id);
                if (product?.id) {
                    track.mutate({ merchantId: product.merchant_id, actionType: 'CLICK_CONTACT', metadata: JSON.stringify({ contact_type: id, product_id: product.id }) } as any);
                }
                return;
            }

            if (type === 'chat') {
                handleChat();
            } else if (type === 'link' || type === 'marketplace') {
                const getUrl = (val: string, platform: string) => {
                    if (val.startsWith('http')) return val;
                    switch(platform) {
                        case 'wa': return `https://wa.me/${val.replace(/\D/g, '')}`;
                        case 'ig': return `https://instagram.com/${val.replace('@', '')}`;
                        case 'tiktok': return `https://tiktok.com/@${val.replace('@', '')}`;
                        case 'fb': return `https://facebook.com/${val}`;
                        case 'tokopedia': return val.includes('tokopedia.com') ? (val.startsWith('http') ? val : `https://${val}`) : `https://tokopedia.com/${val}`;
                        case 'shopee': return val.includes('shopee.co.id') ? (val.startsWith('http') ? val : `https://${val}`) : `https://shopee.co.id/${val}`;
                        case 'tiktokshop': return val.includes('tiktok.com') ? (val.startsWith('http') ? val : `https://${val}`) : `https://tiktok.com/${val}`;
                        default: return `https://${val}`;
                    }
                };
                const url = getUrl(value, id);
                if (url) window.open(url, '_blank');
            } else if (type === 'copy') {
                navigator.clipboard.writeText(value);
                toast.success(`${label} disalin!`);
            }
        };

        return (
            <div 
                onClick={handleAction}
                className={`h-11 flex items-center transition-all duration-300 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm group cursor-pointer ${logoOnly ? 'justify-center' : compact ? 'px-2 gap-2' : 'px-3.5 gap-3'}`}
                title={label}
            >
                <div className={`flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconColor} ${logoOnly ? '' : ''}`}>
                    {imgSrc ? (
                        <img src={imgSrc} alt={label} className={`${logoOnly ? 'w-8 h-8' : 'w-5 h-5'} object-contain`} />
                    ) : (
                        customIcon || (Icon && <Icon size={logoOnly ? 24 : 18} />)
                    )}
                </div>
                {!logoOnly && (
                    <div className="flex-1 min-w-0">
                        {!isRevealed ? (
                            <div className="flex items-center gap-1.5 text-indigo-600 font-black uppercase tracking-tight text-[10px]">
                                <Eye className="w-3 h-3" />
                                <span>Lihat</span>
                            </div>
                        ) : (
                            <p className={`font-black text-[#0A1128] truncate leading-none tracking-tight ${compact ? 'text-[11px]' : 'text-[13px]'}`}>
                                {value === 'Tanya di Sini' ? 'Mulai Chat' : value}
                            </p>
                        )}
                    </div>
                )}
                {!logoOnly && isRevealed && (
                    <div className="flex-shrink-0 ml-auto">
                        {type === 'copy' ? (
                            <div className="text-slate-300 group-hover:text-[#FFBF00] transition-colors">
                                <AnimatedCopyIcon text={value} size={12} showToast={false} />
                            </div>
                        ) : (type === 'link' || type === 'chat') && (
                            <div className="text-slate-300 group-hover:text-[#0A1128] transition-colors">
                                <ArrowUpRight size={12} />
                            </div>
                        )}
                    </div>
                )}
            </div>
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

    const resolvedContactMode = useMemo(() => {
        if (!product) return 'whatsapp';
        
        // MEGA CORE RESOLUTION: Prioritize Product setting (DB Column shop_products.kontak_utama)
        // If it's explicitly set to anything truthy, we use it.
        const productChoice = product.kontak_utama || (product as any).product_kontak_utama;
        if (productChoice) return productChoice;

        // Fallback 1: Merchant level setting
        const merchantChoice = (product as any)?.m_kontak_utama || merchantStats?.kontak_utama;
        if (merchantChoice) return merchantChoice;

        // Fallback 2: Default
        return 'whatsapp';
    }, [product, merchantStats]);

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

        switch (resolvedContactMode) {
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
            
            case 'tiktokshop': {
                const url = getUrl(product.tiktokshop_url || (product as any).m_tiktokshop_url || merchantStats?.tiktokshop_url, 'tiktokshop');
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
        
        // If we want to respect global mode as a secondary label override
        const globalMode = systemSettings?.global_chat_mode;
        if (resolvedContactMode === 'whatsapp' && globalMode === 'internal') return 'Chat Penjual';

        switch (resolvedContactMode) {
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
            case 'tiktokshop': return 'Beli di TikTok Shop';
            case 'whatsapp': return 'Chat WhatsApp';
            default: return 'Hubungi Sekarang';
        }
    };

    const getPrimaryButtonIcon = () => {
        if (!product) return <MessageCircle className="w-5 h-5" />;
        
        switch (resolvedContactMode) {
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
            case 'tiktokshop': return <img src="/images/logos/marketplace/logo-tiktokshop.png" className="w-5 h-5 object-contain" alt="" />;
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
                                    {(product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url || product.tiktokshop_url || product.m_tiktokshop_url || merchantStats?.tiktokshop_url || product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url) && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300">
                                                {product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url ? (
                                                    <a href={product.shopee_url?.startsWith('http') ? product.shopee_url : `https://${product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url}`} target="_blank" rel="noreferrer">
                                                        <img src="/images/logos/marketplace/logo_shopee.png" alt="Shopee" className="w-7 h-7 object-contain" />
                                                    </a>
                                                ) : null}
                                            </div>
                                            <div className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300">
                                                {product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url ? (
                                                    <a href={product.tokopedia_url?.startsWith('http') ? product.tokopedia_url : `https://${product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url}`} target="_blank" rel="noreferrer">
                                                        <img src="/images/logos/marketplace/logo_tokopedia.png" alt="Tokopedia" className="w-7 h-7 object-contain" />
                                                    </a>
                                                ) : null}
                                            </div>
                                            <div className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300">
                                                {product.tiktokshop_url || product.m_tiktokshop_url || merchantStats?.tiktokshop_url ? (
                                                    <a href={product.tiktokshop_url?.startsWith('http') ? product.tiktokshop_url : `https://${product.tiktokshop_url || product.m_tiktokshop_url || merchantStats?.tiktokshop_url}`} target="_blank" rel="noreferrer">
                                                        <img src="/images/logos/marketplace/logo-tiktokshop.png" alt="TikTok Shop" className="w-7 h-7 object-contain" />
                                                    </a>
                                                ) : null}
                                            </div>
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

                            {/* Merchant Section (Sidebar - Compact) */}
                            <div className="p-6 md:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                {/* Store Card */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM CONTENT SECTION */}
                <div className="max-w-7xl mx-auto px-6 mt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        <div className="lg:col-span-12 flex flex-col h-full gap-8">
                            {/* Vendor Contact Card - New Position */}
                            <m.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                                    <h2 className="text-xl font-black uppercase tracking-tighter">Kontak Vendor</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Marketplace Row (Top - Horizontal 3 Columns) */}
                                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                                        <VendorContactItem 
                                            id="shopee" 
                                            label="Shopee" 
                                            value={product.shopee_url || product.m_shopee_url || merchantStats?.shopee_url} 
                                            imgSrc="/images/logos/marketplace/logo_shopee.png" 
                                            type="marketplace" 
                                            logoOnly
                                            noHide
                                        />
                                        <VendorContactItem 
                                            id="tokopedia" 
                                            label="Tokopedia" 
                                            value={product.tokopedia_url || product.m_tokopedia_url || merchantStats?.tokopedia_url} 
                                            imgSrc="/images/logos/marketplace/logo_tokopedia.png" 
                                            type="marketplace" 
                                            logoOnly
                                            noHide
                                        />
                                        <VendorContactItem 
                                            id="tiktokshop" 
                                            label="TikTok Shop" 
                                            value={product.tiktokshop_url || product.m_tiktokshop_url || merchantStats?.tiktokshop_url} 
                                            imgSrc="/images/logos/marketplace/logo-tiktokshop.png" 
                                            type="marketplace" 
                                            logoOnly
                                            noHide
                                        />
                                    </div>

                                    {/* Direct & Social Columns (Bottom - 2 Columns) */}
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-4 md:gap-6">
                                        {/* Kolom 1: Direct Communication (Balanced 3-Row) */}
                                        <div className="space-y-3">
                                            {!product.hide_chat ? (
                                                <VendorContactItem 
                                                    id="chat" 
                                                    label="Chat" 
                                                    value="Tanya di Sini" 
                                                    icon={MessageSquare} 
                                                    iconColor="text-indigo-600" 
                                                    type="chat" 
                                                    noHide
                                                />
                                            ) : <div className="h-11" />}
                                            <VendorContactItem 
                                                id="wa" 
                                                label="WhatsApp" 
                                                value={product.whatsapp || product.m_whatsapp || merchantStats?.whatsapp} 
                                                icon={MessageCircle} 
                                                iconColor="text-[#25D366]" 
                                                type="link" 
                                            />
                                            <VendorContactItem 
                                                id="phone" 
                                                label="Nomor Telepon" 
                                                value={product.phone || product.m_phone || merchantStats?.phone} 
                                                icon={Phone} 
                                                iconColor="text-slate-600" 
                                                type="copy" 
                                            />
                                        </div>

                                        {/* Kolom 2: Social Media (2 Columns x 3 Rows Grid) */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <VendorContactItem 
                                                id="ig" 
                                                label="Instagram" 
                                                value={product.instagram || product.m_instagram || merchantStats?.instagram} 
                                                icon={Instagram} 
                                                iconColor="text-[#E4405F]" 
                                                type="link" 
                                                compact
                                            />
                                            <VendorContactItem 
                                                id="tiktok" 
                                                label="TikTok" 
                                                value={product.tiktok_url || product.m_tiktok_url || merchantStats?.tiktok} 
                                                customIcon={<TikTokIcon className="w-4 h-4" />} 
                                                iconColor="text-black" 
                                                type="link" 
                                                compact
                                            />
                                            <VendorContactItem 
                                                id="fb" 
                                                label="Facebook" 
                                                value={product.facebook || (product as any).m_facebook || merchantStats?.facebook} 
                                                icon={Facebook} 
                                                iconColor="text-[#1877F2]" 
                                                type="link" 
                                                compact
                                            />
                                            <VendorContactItem 
                                                id="x" 
                                                label="X (Twitter)" 
                                                value={product.x_url || (product as any).m_x_url || merchantStats?.x_url} 
                                                customIcon={<XLogoIcon className="w-4 h-4" />} 
                                                iconColor="text-black" 
                                                type="link" 
                                                compact
                                            />
                                            <VendorContactItem 
                                                id="yt" 
                                                label="YouTube" 
                                                value={product.youtube_url || (product as any).m_youtube_url || merchantStats?.youtube_url} 
                                                icon={Youtube} 
                                                iconColor="text-[#FF0000]" 
                                                type="link" 
                                                compact
                                            />
                                            <VendorContactItem 
                                                id="web" 
                                                label="Website" 
                                                value={product.website_url || product.m_website || merchantStats?.website} 
                                                icon={Globe} 
                                                iconColor="text-indigo-600" 
                                                type="link" 
                                                compact
                                            />
                                        </div>
                                    </div>
                                </div>
                            </m.div>

                            {/* Deskripsi Card - Main Position */}
                            <m.div 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 flex flex-col h-full"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                                    <h2 className="text-xl font-black uppercase tracking-tighter">Deskripsi Produk</h2>
                                </div>
                                
                                <div className="relative flex-1 flex flex-col">
                                    <div className="flex-1" />
                                    <m.div 
                                        animate={{ height: isDescriptionExpanded ? 'auto' : '450px' }}
                                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        className="overflow-hidden relative"
                                    >
                                        <div className="text-slate-600 text-[13px] leading-relaxed font-medium whitespace-pre-wrap">
                                            {product.deskripsi || "Vendor belum memberikan deskripsi lengkap untuk produk ini."}
                                        </div>
                                    </m.div>

                                    {product.deskripsi && product.deskripsi.length > 800 && (
                                        <button 
                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            className="mt-6 flex items-center gap-2 text-[#FFBF00] font-black uppercase tracking-widest text-[10px] hover:text-[#0A1128] transition-colors group"
                                        >
                                            {isDescriptionExpanded ? (
                                                <>Tampilkan Lebih Sedikit <ChevronDown className="w-3 h-3 rotate-180 transition-transform" /></>
                                            ) : (
                                                <>Baca Selengkapnya <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" /></>
                                            )}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
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

                        {/* Alamat Card */}
                        <div className="lg:col-span-6 flex flex-col h-full">
                            <m.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col h-full"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                                        <h2 className="text-xl font-black uppercase tracking-tighter">Alamat Lengkap</h2>
                                    </div>
                                    {product.alamat_lengkap && (
                                        <div className="p-1 bg-slate-50 hover:bg-[#FFBF00]/10 rounded-2xl transition-all">
                                            <AnimatedCopyIcon text={product.alamat_lengkap} size={20} className="text-slate-400 hover:text-[#0A1128]" successMessage="Alamat disalin!" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1" />
                                    {product.alamat_lengkap ? (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <p className="text-slate-600 text-[11px] font-normal leading-relaxed uppercase tracking-tight">
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

                        {/* Sponsor Banner Card */}
                        <div className="lg:col-span-6 flex flex-col h-full">
                            <m.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 flex flex-col min-h-[400px] overflow-hidden group h-full"
                            >
                                {sidebarAds.length > 0 ? (
                                    <a 
                                        href={sidebarAds[0].link_url || '#'} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="relative w-full h-full flex-1 overflow-hidden block"
                                    >
                                        <img 
                                            src={sidebarAds[0].image_url} 
                                            alt="Sponsor" 
                                            className="w-full h-full object-cover" 
                                        />
                                        {/* Minimal Ads Tag */}
                                        <div className="absolute top-6 right-6 px-2.5 py-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/20">
                                            <p className="text-white text-[7px] font-black uppercase tracking-widest opacity-80">Ads</p>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100">
                                            <Megaphone className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sponsorship Space</h3>
                                            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">Promosikan brand Anda di sini</p>
                                        </div>
                                        <button className="px-6 py-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#0A1128] hover:text-white transition-all">
                                            Kontak Admin
                                        </button>
                                    </div>
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
