import React from 'react';
import { m } from 'framer-motion';
import { Copy, Shield, Type, Image as ImageIcon, MapPin, Clock, Heart, Monitor, Quote, Share2, CreditCard, Home } from 'lucide-react';
import { Layer } from '@/store/useStore';

interface BaseCardWrapperProps {
    element: Layer;
    permissions: any;
    isProtected: boolean;
    children: React.ReactNode;
}

export const BaseCardWrapper: React.FC<BaseCardWrapperProps> = ({ element, permissions, isProtected, children }) => {
    const getIcon = () => {
        switch (element.type) {
            case 'text': return <Type className="w-4 h-4" />;
            case 'image': return <ImageIcon className="w-4 h-4" />;
            case 'gif': return <ImageIcon className="w-4 h-4" />;
            case 'maps_point': return <MapPin className="w-4 h-4" />;
            case 'countdown': return <Clock className="w-4 h-4" />;
            case 'love_story': return <Heart className="w-4 h-4 text-pink-500" />;
            case 'live_streaming': return <Monitor className="w-4 h-4" />;
            case 'quote': return <Quote className="w-4 h-4" />;
            case 'social_mockup': return <Share2 className="w-4 h-4" />;
            case 'profile_photo': return <ImageIcon className="w-4 h-4" />;
            case 'photo_frame': return <ImageIcon className="w-4 h-4" />;
            case 'profile_card': return <Type className="w-4 h-4" />;
            case 'digital_gift': return <CreditCard className="w-4 h-4" />;
            case 'gift_address': return <Home className="w-4 h-4" />;
            default: return <Type className="w-4 h-4" />;
        }
    };

    return (
        <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-teal-500 transition-colors">
                        {getIcon()}
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-800 tracking-tight uppercase tracking-widest">
                            {element.name || 'Element'}
                        </span>
                        {(() => {
                            const isLocked = isProtected ||
                                (element.type === 'text' && !permissions.canEditText) ||
                                ((element.type === 'image' || element.type === 'gif' || element.type === 'profile_photo' || element.type === 'photo_frame') && !permissions.canEditImage) ||
                                (element.type === 'gift_address' && !permissions.canEditContent) ||
                                (element.type === 'digital_gift' && !permissions.canEditContent) ||
                                (element.type === 'rsvp_wishes' && !permissions.canEditContent) ||
                                (element.type === 'rsvp_form' && !permissions.canEditContent);

                            if (!isLocked) return null;

                            return (
                                <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                                    <Shield className="w-2.5 h-2.5" />
                                    {isProtected ? 'Protected' : 'Locked by Admin'}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <button
                    onClick={() => navigator.clipboard.writeText(element.content || '')}
                    className="p-2 text-slate-300 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-all"
                    title="Copy content"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>
            {children}
        </m.div>
    );
};
