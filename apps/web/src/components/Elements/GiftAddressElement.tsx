import React from 'react';
import { Layer } from '@/store/layersSlice';
import { Home, User, Phone, MapPin } from 'lucide-react';

export const GiftAddressElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    React.useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = (layer as any).giftAddressConfig || {
        receiverName: '',
        phoneNumber: '',
        fullAddress: '',
        customColor: '#bfa181'
    };

    return (
        <div className="w-full h-full p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white">
                <Home className="w-4 h-4 text-premium-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest">Alamat Pengiriman</span>
            </div>
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <User className="w-3 h-3 text-white/40 mt-0.5" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{(config as any).receiverName || (config as any).recipientName || 'Nama Penerima'}</span>
                </div>
                <div className="flex items-start gap-2">
                    <Phone className="w-3 h-3 text-white/40 mt-0.5" />
                    <span className="text-[10px] font-medium text-white/80">{(config as any).phoneNumber || 'Nomor Telepon'}</span>
                </div>
                <div className="flex items-start gap-2 border-t border-white/5 pt-2">
                    <MapPin className="w-3 h-3 text-white/40 mt-0.5" />
                    <p className="text-[9px] text-white/60 leading-relaxed">{(config as any).fullAddress || (config as any).address || 'Alamat Lengkap'}</p>
                </div>
            </div>
        </div>
    );
};
