import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type, Image as ImageIcon, Clock, MailOpen,
    Heart, Square, Film, MapPin, Video, Sparkles, X,
    MessageSquare, Users, Circle, Triangle, Diamond, Star,
    Music, Camera, Gift, Flower2, Bell, Check, Cloud,
    Sun, Moon, Smile, ThumbsUp, Upload, Monitor, Loader2
} from 'lucide-react';
import { LayerType } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

interface AssetSelectionModalProps {
    type: LayerType | null;
    onSelect: (config: any) => void;
    onClose: () => void;
    direction?: 'left' | 'right';
}

// ... (PRESETS remain unchanged - I will preserve them in the full replacement below or assume they are kept if I target carefully)
// Since I can't easily target just the function without context of imports, I will replace the whole file for safety/correctness given the import changes.
// RE-DECLARING PRESETS TO ENSURE COMPLETENESS

const TEXT_PRESETS = [
    { label: 'Heading 1', style: { fontSize: 48, fontWeight: 'bold' }, preview: 'Add a Heading', description: 'Large title text' },
    { label: 'Heading 2', style: { fontSize: 32, fontWeight: 'bold' }, preview: 'Add a Subheading', description: 'Medium section title' },
    { label: 'Body Text', style: { fontSize: 16, fontWeight: 'normal' }, preview: 'Add a little bit of body text', description: 'Regular paragraph text' },
    { label: 'Quote', style: { fontSize: 20, fontStyle: 'italic' }, preview: '"Add a quote here"', description: 'Italicized quote style' },
];

const BUTTON_PRESETS = [
    { label: 'Pill Button', config: { buttonShape: 'pill', buttonStyle: 'elegant' }, icon: <div className="w-20 h-8 rounded-full bg-premium-accent" /> },
    { label: 'Rounded Button', config: { buttonShape: 'rounded', buttonStyle: 'modern' }, icon: <div className="w-20 h-8 rounded-lg bg-premium-accent" /> },
    { label: 'Sharp Button', config: { buttonShape: 'rectangle', buttonStyle: 'glass' }, icon: <div className="w-20 h-8 rounded-none border border-premium-accent" /> },
    { label: 'Ghost Button', config: { buttonShape: 'pill', buttonStyle: 'glass', buttonColor: 'transparent', textColor: '#bfa181' }, icon: <div className="w-20 h-8 rounded-full border border-premium-accent text-premium-accent flex items-center justify-center text-[10px]">Ghost</div> },
];

const SHAPE_PRESETS = [
    { label: 'Rectangle', type: 'rectangle', icon: <Square className="w-6 h-6" /> },
    { label: 'Circle', type: 'circle', icon: <Circle className="w-6 h-6" /> },
    { label: 'Triangle', type: 'triangle', icon: <Triangle className="w-6 h-6" /> },
    { label: 'Diamond', type: 'diamond', icon: <Diamond className="w-6 h-6" /> },
    { label: 'Heart', type: 'heart', icon: <Heart className="w-6 h-6" /> },
    { label: 'Star', type: 'star', icon: <Star className="w-6 h-6" /> },
];

const ICON_LIST = [
    { name: 'heart', icon: <Heart className="w-5 h-5" /> },
    { name: 'star', icon: <Star className="w-5 h-5" /> },
    { name: 'mail', icon: <MailOpen className="w-5 h-5" /> },
    { name: 'clock', icon: <Clock className="w-5 h-5" /> },
    { name: 'map-pin', icon: <MapPin className="w-5 h-5" /> },
    { name: 'music', icon: <Music className="w-5 h-5" /> },
    { name: 'camera', icon: <Camera className="w-5 h-5" /> },
    { name: 'gift', icon: <Gift className="w-5 h-5" /> },
    { name: 'flower-2', icon: <Flower2 className="w-5 h-5" /> },
    { name: 'bell', icon: <Bell className="w-5 h-5" /> },
    { name: 'check', icon: <Check className="w-5 h-5" /> },
    { name: 'cloud', icon: <Cloud className="w-5 h-5" /> },
    { name: 'sun', icon: <Sun className="w-5 h-5" /> },
    { name: 'moon', icon: <Moon className="w-5 h-5" /> },
    { name: 'smile', icon: <Smile className="w-5 h-5" /> },
    { name: 'thumbs-up', icon: <ThumbsUp className="w-5 h-5" /> },
    { name: 'monitor', icon: <Monitor className="w-5 h-5" /> },
    { name: 'message-square', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'users', icon: <Users className="w-5 h-5" /> },
    { name: 'sparkles', icon: <Sparkles className="w-5 h-5" /> },
];

// Import enterprise countdown variants
import { COUNTDOWN_VARIANT_PRESETS, COUNTDOWN_CATEGORIES, CountdownVariantPreset } from '@/components/Countdown';


const PHOTO_GRID_PRESETS = [
    { label: 'Single', variant: 'single', icon: <div className="w-full h-full bg-white/20 rounded" /> },
    { label: 'Split H', variant: 'split-h', icon: <div className="grid grid-cols-2 gap-0.5 w-full h-full"><div className="bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /></div> },
    { label: 'Split V', variant: 'split-v', icon: <div className="grid grid-rows-2 gap-0.5 w-full h-full"><div className="bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /></div> },
    { label: 'Quad', variant: 'quad', icon: <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full"><div className="bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /><div className="bg-white/10 rounded-sm" /><div className="bg-white/20 rounded-sm" /></div> },
    { label: 'Triple H', variant: 'triple-h', icon: <div className="grid grid-cols-3 gap-0.5 w-full h-full"><div className="bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /><div className="bg-white/20 rounded-sm" /></div> },
    { label: 'Hero Left', variant: 'hero-left', icon: <div className="grid grid-cols-3 grid-rows-2 gap-0.5 w-full h-full"><div className="col-span-2 row-span-2 bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /><div className="bg-white/10 rounded-sm" /></div> },
    { label: 'Hero Right', variant: 'hero-right', icon: <div className="grid grid-cols-3 grid-rows-2 gap-0.5 w-full h-full"><div className="bg-white/10 rounded-sm" /><div className="col-span-2 row-span-2 bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /></div> },
    { label: 'Mosaic', variant: 'mosaic', icon: <div className="grid grid-cols-3 gap-0.5 w-full h-full"><div className="row-span-2 bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /><div className="bg-white/10 rounded-sm" /></div> },
    { label: 'Featured', variant: 'featured', icon: <div className="grid grid-cols-2 grid-rows-3 gap-0.5 w-full h-full"><div className="col-span-2 row-span-2 bg-white/20 rounded-sm" /><div className="bg-white/10 rounded-sm" /><div className="bg-white/10 rounded-sm" /></div> },
    { label: 'Cluster', variant: 'cluster', icon: <div className="relative w-full h-full"><div className="absolute top-0 left-0 w-3/5 h-3/5 bg-white/20 rounded-sm rotate-[-10deg]" /><div className="absolute bottom-0 right-0 w-3/5 h-3/5 bg-white/10 rounded-sm rotate-[10deg] border border-white/20" /></div> },
];

// RSVP + Wishes Variant Presets (matches legacy ElementStyle types)
const RSVP_WISHES_PRESETS = [
    // Row 1: Basic Styles
    {
        label: 'Classic',
        style: 'classic',
        preview: <div className="w-full h-full bg-white border border-gray-100 rounded p-1 flex flex-col gap-0.5">
            <div className="h-1.5 bg-amber-600/20 rounded w-3/4" />
            <div className="h-0.5 bg-gray-100 rounded w-1/2" />
            <div className="h-1.5 bg-amber-600 rounded mt-auto" />
        </div>
    },
    {
        label: 'Minimal',
        style: 'minimal',
        preview: <div className="w-full h-full bg-white rounded-lg shadow-sm p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-gray-100 w-full rounded" />
            <div className="h-1 bg-gray-100 w-2/3 rounded" />
            <div className="h-1.5 bg-black rounded-full mt-auto" />
        </div>
    },
    {
        label: 'Modern',
        style: 'modern',
        preview: <div className="w-full h-full bg-white rounded-xl shadow-md p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-blue-50 rounded-full w-full" />
            <div className="h-1 bg-blue-50 rounded-full w-2/3" />
            <div className="h-2 bg-blue-600 rounded-lg mt-auto" />
        </div>
    },
    {
        label: 'Elegant',
        style: 'elegant',
        preview: <div className="w-full h-full bg-[#fdfbf7] border border-amber-200 rounded p-1 flex flex-col gap-0.5 shadow-inner">
            <div className="h-1.5 bg-amber-100 w-3/4 italic" />
            <div className="h-2 bg-amber-800 rounded mt-auto" />
        </div>
    },
    // Row 2: Nature & Romantic
    {
        label: 'Rustic',
        style: 'rustic',
        preview: <div className="w-full h-full bg-[#fffaf0] border-t-4 border-[#8b4513] rounded p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-amber-200/50 w-3/4 rounded-sm" />
            <div className="h-2 bg-[#8b4513] rounded-sm mt-auto" />
        </div>
    },
    {
        label: 'Romantic',
        style: 'romantic',
        preview: <div className="w-full h-full bg-[#fff0f5] rounded-[2rem] shadow-lg shadow-rose-100 p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-rose-200 w-full rounded-full" />
            <div className="h-2 bg-rose-400 rounded-full mt-auto" />
        </div>
    },
    {
        label: 'Floral',
        style: 'floral',
        preview: <div className="w-full h-full bg-white border-x-4 border-pink-200 rounded-xl p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-pink-100 w-3/4 rounded" />
            <div className="h-2 bg-pink-500 rounded mt-auto" />
        </div>
    },
    {
        label: 'Boho',
        style: 'boho',
        preview: <div className="w-full h-full bg-[#fbf7f5] border border-[#d2b48c]/30 rounded-2xl p-1.5 flex flex-col gap-1">
            <div className="h-1 bg-[#d2b48c] w-3/4" />
            <div className="h-2 bg-[#d2b48c] rounded-full mt-auto" />
        </div>
    },
    // Row 3: Premium & Dark
    {
        label: 'Luxury',
        style: 'luxury',
        preview: <div className="w-full h-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded p-1.5 flex flex-col gap-1 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
            <div className="h-1 bg-[#d4af37]/20 w-3/4" />
            <div className="h-2 bg-[#d4af37] mt-auto" />
        </div>
    },
    {
        label: 'Dark',
        style: 'dark',
        preview: <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-slate-700 w-3/4 rounded" />
            <div className="h-2 bg-indigo-500 rounded mt-auto" />
        </div>
    },
    {
        label: 'Glass',
        style: 'glass',
        preview: <div className="w-full h-full bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-white/40 w-full rounded" />
            <div className="h-2 bg-white rounded mt-auto shadow-lg" />
        </div>
    },
    {
        label: 'Neon',
        style: 'neon',
        preview: <div className="w-full h-full bg-black border-y border-cyan-400 rounded p-1.5 flex flex-col gap-1 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <div className="h-1 bg-cyan-900 w-3/4 uppercase text-[6px]" />
            <div className="h-2 bg-cyan-400 shadow-[0_0_5px_#22d3ee] mt-auto" />
        </div>
    },
    // Row 4: Design Forward
    {
        label: 'Vintage',
        style: 'vintage',
        preview: <div className="w-full h-full bg-[#f4f1ea] border-2 border-[#3d2b1f] shadow-[4px_4px_0_#3d2b1f] p-1 flex flex-col gap-0.5">
            <div className="h-1 bg-[#3d2b1f]/20 w-3/4" />
            <div className="h-1.5 bg-[#3d2b1f] mt-auto" />
        </div>
    },
    {
        label: 'Bold',
        style: 'bold',
        preview: <div className="w-full h-full bg-orange-500 border-2 border-black shadow-[4px_4px_0_#000] p-1 flex flex-col gap-0.5">
            <div className="h-2 bg-white border-2 border-black w-full" />
            <div className="h-2 bg-black mt-auto" />
        </div>
    },
    {
        label: 'Outline',
        style: 'outline',
        preview: <div className="w-full h-full bg-white border-2 border-gray-900 p-1.5 flex flex-col gap-1">
            <div className="h-1 bg-gray-100 border border-gray-900 w-3/4" />
            <div className="h-1.5 border border-gray-900 mt-auto" />
        </div>
    },
    {
        label: 'Pastel',
        style: 'pastel',
        preview: <div className="w-full h-full bg-purple-50 border-4 border-white rounded-3xl shadow-lg p-1.5 flex flex-col gap-1">
            <div className="h-1.5 bg-purple-200 w-full rounded-full" />
            <div className="h-2 bg-purple-400 rounded-full mt-auto" />
        </div>
    },
    // Row 5: Creative Styles
    {
        label: 'Geometric',
        style: 'geometric',
        preview: <div className="w-full h-full bg-white border border-indigo-600 p-1.5 flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 rounded-bl-lg" />
            <div className="h-1.5 bg-indigo-50 w-full" />
            <div className="h-1.5 bg-indigo-600 mt-auto" />
        </div>
    },
    {
        label: 'Brutalist',
        style: 'brutalist',
        preview: <div className="w-full h-full bg-[#ff90e8] border-2 border-black shadow-[4px_4px_0_#000] p-1 flex flex-col gap-1 rotate-[-2deg]">
            <div className="h-2 bg-white border-2 border-black w-3/4" />
            <div className="h-1.5 bg-black mt-auto" />
        </div>
    },
    {
        label: 'Cloud',
        style: 'cloud',
        preview: <div className="w-full h-full bg-white rounded-3xl shadow-xl p-2 flex flex-col items-center gap-1">
            <div className="h-1 bg-gray-100 rounded-full w-full" />
            <div className="h-2 bg-blue-400 rounded-full w-2/3 mt-auto shadow-lg shadow-blue-100" />
        </div>
    },
    {
        label: 'Monochrome',
        style: 'monochrome',
        preview: <div className="w-full h-full bg-white border-x border-black p-1.5 flex flex-col gap-1 items-center">
            <div className="h-0.5 bg-black w-full" />
            <div className="h-1.5 border border-black w-2/3 mt-auto" />
        </div>
    }
];

export const AssetSelectionModal: React.FC<AssetSelectionModalProps> = ({ type, onSelect, onClose, direction = 'right' }) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!type) return null;

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Only upload for media types
        if (type !== 'image' && type !== 'gif' && type !== 'video' && type !== 'sticker') return;

        setUploading(true);
        try {
            // 1. Generate unique path
            // For now, using 'anon' as user ID since we don't have auth context here yet
            // In a real app, use the actual user ID
            const userId = 'anon';
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 10000);
            const ext = file.name.split('.').pop();
            const fileName = `${timestamp}_${random}.${ext}`;
            const filePath = `${userId}/${fileName}`;

            console.log('Uploading to:', filePath);

            // 2. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from('invitation-assets') // Ensure this bucket exists and is PUBLIC
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('invitation-assets')
                .getPublicUrl(filePath);

            console.log('Upload success:', publicUrl);

            // 4. Pass URL to onSelect
            if (type === 'image' || type === 'gif' || type === 'sticker') {
                onSelect({ imageUrl: publicUrl });
            } else if (type === 'video') {
                onSelect({ videoUrl: publicUrl });
            }

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again. Make sure the bucket "invitation-assets" exists and is public.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'text': return 'Add Text';
            case 'image': return 'Add Image';
            case 'video': return 'Add Video';
            case 'gif': return 'Add GIF';
            case 'icon': return 'Select Icon';
            case 'shape': return 'Select Shape';
            case 'button': return 'Add Button';
            case 'countdown': return 'Add Countdown';
            case 'rsvp_form': return 'RSVP Form';
            case 'rsvp_wishes': return 'RSVP + Guest Wishes';
            case 'photo_grid': return 'Photo Grid Layout';
            default: return `Add ${type?.charAt(0).toUpperCase() + type?.slice(1)}`;
        }
    };


    // Use Portal to escape sidebar overflow
    return ReactDOM.createPortal(
        <motion.div
            initial={{ opacity: 0, scale: 0.95, x: direction === 'left' ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: direction === 'left' ? 20 : -20 }}
            className={`fixed top-24 z-[9999] w-80 glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${direction === 'left' ? 'right-[340px]' : 'left-[340px]'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <h3 className="font-bold text-white text-sm">{getTitle()}</h3>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto premium-scroll">

                {/* TEXT */}
                {type === 'text' && (
                    <div className="grid gap-2">
                        {TEXT_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ textStyle: { ...preset.style } })}
                                className="group text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all"
                            >
                                <div className="text-white text-sm" style={{ fontWeight: preset.style.fontWeight as any, fontStyle: preset.style.fontStyle }}>{preset.preview}</div>
                                <div className="text-[10px] text-white/40 mt-1">{preset.description}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* SHAPE */}
                {type === 'shape' && (
                    <div className="grid grid-cols-3 gap-3">
                        {SHAPE_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ shapeConfig: { shapeType: preset.type } })}
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all aspect-square"
                            >
                                <div className="text-white/80 mb-2">{preset.icon}</div>
                                <span className="text-[10px] text-white/50">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ICON */}
                {type === 'icon' && (
                    <div className="grid grid-cols-4 gap-2">
                        {ICON_LIST.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ iconStyle: { iconName: preset.name } })}
                                className="flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all aspect-square"
                                title={preset.name}
                            >
                                <div className="text-white/80">{preset.icon}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* BUTTON */}
                {type === 'button' && (
                    <div className="space-y-3">
                        {BUTTON_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ buttonConfig: preset.config })}
                                className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left"
                            >
                                <div className="shrink-0">{preset.icon}</div>
                                <div>
                                    <div className="text-xs font-bold text-white">{preset.label}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* COUNTDOWN - 20 Enterprise Variants */}
                {type === 'countdown' && (
                    <div className="space-y-4">
                        {COUNTDOWN_CATEGORIES.map((category) => (
                            <div key={category.id}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">{category.icon}</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">{category.name}</span>
                                    <span className="text-[9px] text-white/30">({category.count})</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {COUNTDOWN_VARIANT_PRESETS.filter(p => p.category === category.id).map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => onSelect({ countdownConfig: { variant: preset.id, ...preset.config } })}
                                            className="p-3 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all text-left group"
                                        >
                                            <div className="text-xs font-mono text-premium-accent tracking-wide truncate">{preset.previewText}</div>
                                            <div className="text-[10px] font-semibold text-white/80 mt-1">{preset.name}</div>
                                            <div className="text-[9px] text-white/40 truncate">{preset.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PHOTO GRID */}
                {type === 'photo_grid' && (
                    <div className="grid grid-cols-2 gap-3">
                        {PHOTO_GRID_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ photoGridConfig: { variant: preset.variant, images: [] } })}
                                className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all group"
                            >
                                <div className="w-full aspect-square p-2 bg-black/20 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                                    {preset.icon}
                                </div>
                                <span className="text-[10px] text-white/50 group-hover:text-white/80 font-medium">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* RSVP + WISHES */}
                {type === 'rsvp_wishes' && (
                    <div className="space-y-3">
                        <p className="text-xs text-white/50 text-center">Pilih gaya desain RSVP Form</p>

                        {/* Style Grid - 4 columns */}
                        <div className="grid grid-cols-4 gap-2">
                            {RSVP_WISHES_PRESETS.map((preset, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSelect({
                                        rsvpWishesConfig: {
                                            style: preset.style,
                                            title: 'Konfirmasi Kehadiran',
                                            wishesTitle: 'Ucapan & Doa',
                                            submitButtonText: 'Kirim RSVP',
                                            thankYouMessage: 'Terima kasih!',
                                            showNameField: true,
                                            showPhoneField: true,
                                            showEmailField: false,
                                            showAttendanceField: true,
                                            showGuestCountField: true,
                                            showMessageField: true,
                                            showMealPreference: false,
                                            showSongRequest: false,
                                            attendanceOptions: { attending: 'Hadir', notAttending: 'Tidak Hadir', maybe: 'Belum Pasti' },
                                            guestCountMax: 5,
                                            guestCountDefault: 1,
                                            backgroundColor: '#ffffff',
                                            textColor: '#1f2937',
                                            buttonColor: '#b8860b',
                                            buttonTextColor: '#ffffff',
                                            borderColor: '#e5e5e5',
                                            borderRadius: 8,
                                            wishesLayout: 'list',
                                            wishesMaxDisplay: 50,
                                            showWishTimestamp: true,
                                            showWishAvatar: true,
                                            wishCardStyle: 'minimal',
                                            wishesAutoScroll: false,
                                            variant: preset.style,
                                            nameMinLength: 2,
                                            nameMaxLength: 100,
                                            messageMinLength: 0,
                                            messageMaxLength: 500,
                                            requireMessage: false,
                                            enableCaptcha: false,
                                        }
                                    })}
                                    className="flex flex-col gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-premium-accent/20 border border-white/10 hover:border-premium-accent/40 transition-all group"
                                >
                                    <div className="w-full aspect-square rounded overflow-hidden group-hover:scale-105 transition-transform">
                                        {preset.preview}
                                    </div>
                                    <span className="text-[8px] text-white/50 group-hover:text-white/80 font-medium truncate text-center">
                                        {preset.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {/* MEDIA (Image, Video, GIF) */}

                {(type === 'image' || type === 'video' || type === 'gif') && (
                    <div className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative ${dragActive ? 'border-premium-accent bg-premium-accent/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept={type === 'video' ? "video/*" : "image/*"}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                disabled={uploading}
                            />

                            {uploading ? (
                                <>
                                    <Loader2 className="w-8 h-8 text-premium-accent animate-spin mb-3" />
                                    <p className="text-sm font-medium text-white mb-1">Uploading...</p>
                                    <p className="text-xs text-white/40">Please wait</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                        <Upload className="w-6 h-6 text-premium-accent" />
                                    </div>
                                    <p className="text-sm font-medium text-white mb-1">Click to Upload</p>
                                    <p className="text-xs text-white/40">or drag and drop your {type} file</p>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60">
                                Import from URL
                            </button>
                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60">
                                Stock Library
                            </button>
                        </div>
                    </div>
                )}

                {/* Open Invitation Button with Style Variants */}
                {type === 'open_invitation_button' && (
                    <div className="space-y-4">
                        <p className="text-sm text-white/60 text-center mb-4">Choose a button style</p>

                        {/* Style Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Elegant Style */}
                            <button
                                onClick={() => onSelect({
                                    buttonText: 'Buka Undangan',
                                    subText: '',
                                    buttonStyle: 'elegant',
                                    buttonShape: 'pill',
                                    buttonColor: '#bfa181',
                                    textColor: '#0a0a0a',
                                    showIcon: true
                                })}
                                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-premium-accent/50 transition-all"
                            >
                                <div className="w-full h-10 rounded-full bg-premium-accent flex items-center justify-center gap-2 mb-3">
                                    <MailOpen className="w-4 h-4 text-premium-dark" />
                                    <span className="text-sm font-bold text-premium-dark">Buka</span>
                                </div>
                                <span className="text-xs text-white/60 group-hover:text-white/80">Elegant</span>
                            </button>

                            {/* Glass Style */}
                            <button
                                onClick={() => onSelect({
                                    buttonText: 'Buka Undangan',
                                    subText: '',
                                    buttonStyle: 'glass',
                                    buttonShape: 'pill',
                                    buttonColor: 'rgba(255,255,255,0.1)',
                                    textColor: '#ffffff',
                                    showIcon: true
                                })}
                                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-premium-accent/50 transition-all"
                            >
                                <div className="w-full h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2 mb-3">
                                    <MailOpen className="w-4 h-4 text-white" />
                                    <span className="text-sm font-bold text-white">Buka</span>
                                </div>
                                <span className="text-xs text-white/60 group-hover:text-white/80">Glass</span>
                            </button>

                            {/* Minimal Style */}
                            <button
                                onClick={() => onSelect({
                                    buttonText: 'Buka Undangan',
                                    subText: '',
                                    buttonStyle: 'minimal',
                                    buttonShape: 'pill',
                                    buttonColor: '#bfa181',
                                    textColor: '#bfa181',
                                    showIcon: true
                                })}
                                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-premium-accent/50 transition-all"
                            >
                                <div className="w-full h-10 rounded-full border-2 border-premium-accent flex items-center justify-center gap-2 mb-3">
                                    <MailOpen className="w-4 h-4 text-premium-accent" />
                                    <span className="text-sm font-bold text-premium-accent">Buka</span>
                                </div>
                                <span className="text-xs text-white/60 group-hover:text-white/80">Minimal</span>
                            </button>

                            {/* Luxury Style */}
                            <button
                                onClick={() => onSelect({
                                    buttonText: 'Buka Undangan',
                                    subText: '',
                                    buttonStyle: 'luxury',
                                    buttonShape: 'pill',
                                    buttonColor: '#bfa181',
                                    textColor: '#0a0a0a',
                                    showIcon: true
                                })}
                                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-premium-accent/50 transition-all"
                            >
                                <div className="w-full h-10 rounded-full bg-gradient-to-r from-premium-accent to-amber-500 shadow-lg shadow-premium-accent/30 flex items-center justify-center gap-2 mb-3">
                                    <MailOpen className="w-4 h-4 text-premium-dark" />
                                    <span className="text-sm font-bold text-premium-dark">Buka</span>
                                </div>
                                <span className="text-xs text-white/60 group-hover:text-white/80">Luxury</span>
                            </button>

                            {/* Modern Style */}
                            <button
                                onClick={() => onSelect({
                                    buttonText: 'Buka Undangan',
                                    subText: '',
                                    buttonStyle: 'modern',
                                    buttonShape: 'rounded',
                                    buttonColor: '#0a0a0a',
                                    textColor: '#ffffff',
                                    showIcon: true
                                })}
                                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-premium-accent/50 transition-all"
                            >
                                <div className="w-full h-10 rounded-xl bg-black shadow-md flex items-center justify-center gap-2 mb-3">
                                    <MailOpen className="w-4 h-4 text-white" />
                                    <span className="text-sm font-bold text-white">Buka</span>
                                </div>
                                <span className="text-xs text-white/60 group-hover:text-white/80">Modern</span>
                            </button>

                            {/* Rounded Rectangle */}
                            <button
                                onClick={() => onSelect({
                                    buttonText: 'Buka Undangan',
                                    subText: '',
                                    buttonStyle: 'elegant',
                                    buttonShape: 'rounded',
                                    buttonColor: '#bfa181',
                                    textColor: '#0a0a0a',
                                    showIcon: true
                                })}
                                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-premium-accent/50 transition-all"
                            >
                                <div className="w-full h-10 rounded-xl bg-premium-accent flex items-center justify-center gap-2 mb-3">
                                    <MailOpen className="w-4 h-4 text-premium-dark" />
                                    <span className="text-sm font-bold text-premium-dark">Buka</span>
                                </div>
                                <span className="text-xs text-white/60 group-hover:text-white/80">Rounded</span>
                            </button>
                        </div>

                        <p className="text-[10px] text-white/30 text-center mt-4">
                            Pilih style lalu kustomisasi di Property Panel
                        </p>
                    </div>
                )}

                {/* Others (Generic fallback) - EXCLUDING open_invitation_button */}
                {['maps_point', 'lottie', 'flying_bird', 'guest_wishes', 'rsvp_form'].includes(type) && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-premium-accent" />
                        </div>
                        <p className="text-sm text-white/60 mb-4">Add {type.replace('_', ' ')} to canvas?</p>
                        <button
                            onClick={() => onSelect({})}
                            className="px-6 py-2 bg-premium-accent text-premium-dark rounded-full text-sm font-bold shadow-lg shadow-premium-accent/20 hover:scale-105 transition-transform"
                        >
                            Add Element
                        </button>
                    </div>
                )}

            </div>
        </motion.div>,
        document.body
    );
};
