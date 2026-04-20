import React, { useState } from 'react';
import { m } from 'framer-motion';
import { 
    MessageCircle, Instagram, Facebook, Globe, Phone, 
    MessageSquare, Eye, ArrowUpRight, ShoppingBag, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@tamuu/shared';
import { AnimatedCopyIcon } from '../ui/AnimatedCopyIcon';
import { TikTokIcon, XLogoIcon } from '../ui/Icons';

interface VendorContactCardProps {
    vendor: any;
    contacts: any;
    product?: any;
    isAuthenticated: boolean;
    navigate: (path: string) => void;
    track: any;
}

export const VendorContactCard: React.FC<VendorContactCardProps> = ({ 
    vendor, 
    contacts, 
    product, 
    isAuthenticated,
    navigate,
    track
}) => {
    const [revealedContacts, setRevealedContacts] = useState<Record<string, boolean>>({});

    const toggleReveal = (id: string) => {
        setRevealedContacts(prev => ({ ...prev, [id]: true }));
    };

    const handleChat = () => {
        if (!isAuthenticated) {
            toast.error('Silakan login untuk memulai chat.');
            navigate('/login');
            return;
        }
        navigate(`/dashboard?tab=chat&vendorId=${vendor.id}`);
    };

    const VendorContactItem = ({ 
        id, 
        icon: Icon, 
        label, 
        value, 
        type = 'link', 
        iconColor = 'text-slate-400',
        customIcon,
        imgSrc,
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
                track.mutate({ 
                    vendorId: vendor.id, 
                    actionType: 'CLICK_CONTACT', 
                    metadata: JSON.stringify({ 
                        contact_type: id, 
                        product_id: product?.id || 'profile' 
                    }) 
                } as any);
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
                <div className={`flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconColor}`}>
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

    return (
        <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8"
        >
            <div className="flex items-center gap-3">
                <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                <h2 className="text-xl font-black uppercase tracking-tighter text-[#0A1128]">Kontak Vendor</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Row 1: Marketplace */}
                <VendorContactItem 
                    id="shopee" 
                    label="Shopee" 
                    value={contacts.shopee_url} 
                    imgSrc="/images/logos/marketplace/logo_shopee.png" 
                    type="marketplace" 
                    logoOnly
                    noHide
                />
                <VendorContactItem 
                    id="tokopedia" 
                    label="Tokopedia" 
                    value={contacts.tokopedia_url} 
                    imgSrc="/images/logos/marketplace/logo_tokopedia.png" 
                    type="marketplace" 
                    logoOnly
                    noHide
                />
                <VendorContactItem 
                    id="tiktokshop" 
                    label="TikTok Shop" 
                    value={contacts.tiktokshop_url} 
                    imgSrc="/images/logos/marketplace/logo-tiktokshop.png" 
                    type="marketplace" 
                    logoOnly
                    noHide
                />

                {/* Row 2: Chat + 2 Socials */}
                {!(product?.hide_chat || vendor.hide_chat) ? (
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
                    id="ig" 
                    label="Instagram" 
                    value={contacts.instagram} 
                    icon={Instagram} 
                    iconColor="text-[#E4405F]" 
                    type="link" 
                    compact
                />
                <VendorContactItem 
                    id="tiktok" 
                    label="TikTok" 
                    value={contacts.tiktok} 
                    customIcon={<TikTokIcon className="w-4 h-4" />} 
                    iconColor="text-black" 
                    type="link" 
                    compact
                />

                {/* Row 3: WA + 2 Socials */}
                <VendorContactItem 
                    id="wa" 
                    label="WhatsApp" 
                    value={contacts.whatsapp} 
                    icon={MessageCircle} 
                    iconColor="text-[#25D366]" 
                    type="link" 
                />
                <VendorContactItem 
                    id="fb" 
                    label="Facebook" 
                    value={contacts.facebook} 
                    icon={Facebook} 
                    iconColor="text-[#1877F2]" 
                    type="link" 
                    compact
                />
                <VendorContactItem 
                    id="web" 
                    label="Website" 
                    value={contacts.website} 
                    icon={Globe} 
                    iconColor="text-indigo-400" 
                    type="link" 
                    compact
                />

                {/* Row 4: Phone + 2 Empty/Placeholders */}
                <VendorContactItem 
                    id="phone" 
                    label="Telepon" 
                    value={contacts.phone} 
                    icon={Phone} 
                    iconColor="text-slate-400" 
                    type="copy" 
                />
                <div className="h-11 hidden md:block" />
                <div className="h-11 hidden md:block" />
            </div>
        </m.div>
    );
};
