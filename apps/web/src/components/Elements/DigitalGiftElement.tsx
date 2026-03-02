import React from 'react';
import { Layer } from '@/store/layersSlice';
import { CreditCard, Landmark, User } from 'lucide-react';

export const DigitalGiftElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    React.useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.digitalGiftConfig || {
        title: 'Kirim Hadiah',
        description: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        customColor: '#bfa181'
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{config.title}</h3>
            {config.description && <p className="text-[10px] text-white/60 mb-4 text-center">{config.description}</p>}
            <div 
                className="w-full p-4 rounded-xl space-y-2"
                style={{ backgroundColor: config.customColor || '#bfa181' }}
            >
                <div className="flex items-center gap-2 text-white/80">
                    <Landmark className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">{config.bankName}</span>
                </div>
                <div className="text-lg font-black text-white tracking-wider">{config.accountNumber}</div>
                <div className="flex items-center gap-2 text-white/80 border-t border-white/10 pt-2">
                    <User className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">{config.accountHolder}</span>
                </div>
            </div>
        </div>
    );
};
