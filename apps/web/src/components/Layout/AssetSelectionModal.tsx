import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type, Image as ImageIcon, Clock, MailOpen,
    Heart, Square, Film, MapPin, Video, Sparkles, X,
    MessageSquare, Users, Circle, Triangle, Diamond, Star,
    Music, Camera, Gift, Flower2, Bell, Check, Cloud,
    Sun, Moon, Smile, ThumbsUp, Upload, Monitor,
    Waves, Zap, Component, Share2, Layers
} from 'lucide-react';
import { PremiumLoader } from '../ui/PremiumLoader';
import { LayerType } from '@/store/useStore';
import { storage } from '@/lib/api';
import { useMusicLibrary, Song } from '@/hooks/queries';

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

const CONFETTI_PRESETS = [
    { label: 'Golden Rain', colors: ['#FFD700', '#F0E68C', '#DAA520'], icon: '✨' },
    { label: 'Party Pop', colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'], icon: '🎉' },
    { label: 'Soft Pink', colors: ['#FFC0CB', '#FFB6C1', '#FF69B4'], icon: '🌸' },
    { label: 'Ice Blue', colors: ['#E0FFFF', '#B0E0E6', '#ADD8E6'], icon: '❄️' },
];

const WAVE_PRESETS = [
    { label: 'Gentle Wave', config: { type: 'wave', amplitude: 20, frequency: 0.01, speed: 1 }, icon: <Waves className="w-6 h-6" /> },
    { label: 'Tech Steps', config: { type: 'steps', amplitude: 30, frequency: 0.02, speed: 0.5 }, icon: <Zap className="w-6 h-6" /> },
    { label: 'Organic Blob', config: { type: 'blob', amplitude: 40, frequency: 0.02, speed: 0.5 }, icon: <Component className="w-6 h-6" /> },
];

// MUSIC_LIBRARY removed in favor of dynamic API fetching

const TILT_CARD_PRESETS = [
    { label: 'Royal Gold', icon: <Star className="w-8 h-8 text-amber-500" />, config: { theme: 'gold' } },
    { label: 'Cyber Neon', icon: <Zap className="w-8 h-8 text-cyan-400" />, config: { theme: 'neon' } },
    { label: 'Glass Modern', icon: <Layers className="w-8 h-8 text-white/60" />, config: { theme: 'glass' } },
];

const WEATHER_PRESETS = [
    { label: 'Jakarta', temp: '28', icon: <Sun className="w-6 h-6" /> },
    { label: 'Surabaya', temp: '32', icon: <Sun className="w-6 h-6" /> },
    { label: 'Bandung', temp: '22', icon: <Cloud className="w-6 h-6" /> },
];

const QR_PRESETS = [
    { label: 'Standard', fg: '#000000', icon: '⬛' },
    { label: 'Premium Gold', fg: '#bfa181', icon: '👑' },
    { label: 'Royal Blue', fg: '#1a365d', icon: '🔷' },
];

const INTERACTIVE_QR_PRESETS = [
    {
        category: 'Celebratory',
        effects: [
            { id: 'confetti', label: 'Classic Confetti', icon: '🎉' },
            { id: 'gold_rain', label: 'Golden Rain', icon: '💰' },
            { id: 'party_poppers', label: 'Party Poppers', icon: '🎊' },
            { id: 'glitter', label: 'Glitter', icon: '✨' }
        ]
    },
    {
        category: 'Nature & Romance',
        effects: [
            { id: 'rose_petals', label: 'Rose Petals', icon: '🌹' },
            { id: 'sakura', label: 'Sakura Petals', icon: '🌸' },
            { id: 'autumn_leaves', label: 'Autumn Leaves', icon: '🍁' },
            { id: 'hearts', label: 'Hearts', icon: '❤️' }
        ]
    },
    {
        category: 'Atmospheric',
        effects: [
            { id: 'snow', label: 'Gentle Snow', icon: '❄️' },
            { id: 'fireflies', label: 'Fireflies', icon: '🏮' },
            { id: 'bubbles', label: 'Morning Bubbles', icon: '🫧' },
            { id: 'mist', label: 'Mist Glow', icon: '🌫️' }
        ]
    },
    {
        category: 'Techno & Matrix',
        effects: [
            { id: 'matrix', label: 'Digital Rain', icon: '📟' },
            { id: 'sparks', label: 'Cyber Sparks', icon: '⚡' },
            { id: 'glitch', label: 'Neon Glitch', icon: '📺' },
            { id: 'hexagons', label: 'Hexagons', icon: '⬢' }
        ]
    },
    {
        category: 'Magic & Mystical',
        effects: [
            { id: 'aurora', label: 'Aurora', icon: '🌌' },
            { id: 'stars', label: 'Star Night', icon: '⭐' },
            { id: 'orbs', label: 'Spirit Orbs', icon: '🔮' },
            { id: 'plasma', label: 'Plasma Swirl', icon: '🌀' }
        ]
    }
];

const PARTICLE_PRESETS = {
    fireworks: [
        { label: 'Victory Gold', colors: ['#FFD700', '#FFA500'], icon: '🚀' },
        { label: 'Magenta Mist', colors: ['#FF00FF', '#800080'], icon: '🎇' },
    ],
    bubbles: [
        { label: 'Crystal Clear', colorPath: 'white', icon: '🫧' },
        { label: 'Rainbow', colorPath: 'gradient', icon: '🌈' },
    ],
    snow: [
        { label: 'Winter Soft', color: '#ffffff', icon: '❄️' },
        { label: 'Mist Glow', color: '#e2e8f0', icon: '🌫️' },
    ]
};

export const AssetSelectionModal: React.FC<AssetSelectionModalProps> = ({ type, onSelect, onClose, direction = 'right' }) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { data: songs = [], isLoading: isLoadingSongs } = useMusicLibrary();

    if (!type) return null;

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Only upload for media types
        if (type !== 'image' && type !== 'gif' && type !== 'video' && type !== 'sticker') return;

        setUploading(true);
        try {
            console.log('Uploading file:', file.name);

            // Upload to Cloudflare R2
            // "gallery" is a safe default context for general asset uploads
            const result = await storage.upload(file, 'gallery');
            const publicUrl = result.url;

            // BlurHash is available in result.blurHash if needed for future UI updates
            console.log('Upload success:', publicUrl, result.blurHash ? '(BlurHash Generated)' : '');

            // Pass URL to onSelect
            if (type === 'image' || type === 'gif' || type === 'sticker') {
                onSelect({ imageUrl: publicUrl });
            } else if (type === 'video') {
                onSelect({ videoUrl: publicUrl });
            }

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
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
            case 'confetti': return 'Confetti Style';
            case 'music_player': return 'Music Library';
            case 'svg_wave': return 'Wave & Blob Presets';
            case 'digital_gift': return 'Angpao Theme';
            case 'social_mockup': return 'Social Platform';
            case 'interaction': return 'Select Cinematic Effect';
            default: {
                const label = type?.replace('_', ' ') || '';
                return `Add ${label.charAt(0).toUpperCase() + label.slice(1)}`;
            }
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

                {/* NAME BOARD - 27 Premium Variants */}
                {type === 'name_board' && (
                    <div className="space-y-4">
                        {[
                            {
                                id: 'classic', name: 'Classic', icon: '🎨', items: [
                                    { id: 1, name: 'Elegant', bg: '#1a1a2e', text: '#f8f9fa' },
                                    { id: 2, name: 'Light', bg: '#ffffff', text: '#2d3436' },
                                    { id: 3, name: 'Gold', bg: '#0a0a0a', text: '#d4af37' },
                                    { id: 4, name: 'Rose', bg: '#fff5f5', text: '#c53030' },
                                    { id: 5, name: 'Navy', bg: '#1a365d', text: '#ffffff' },
                                ]
                            },
                            {
                                id: 'glass', name: 'Glass', icon: '✨', items: [
                                    { id: 6, name: 'Frosted', bg: 'rgba(255,255,255,0.1)', text: '#ffffff' },
                                    { id: 7, name: 'Dark', bg: 'rgba(0,0,0,0.3)', text: '#ffffff' },
                                    { id: 8, name: 'Blue', bg: 'rgba(59,130,246,0.2)', text: '#ffffff' },
                                    { id: 9, name: 'Purple', bg: 'rgba(139,92,246,0.2)', text: '#ffffff' },
                                    { id: 10, name: 'Rose', bg: 'rgba(244,63,94,0.15)', text: '#ffffff' },
                                ]
                            },
                            {
                                id: 'neon', name: 'Neon', icon: '💡', items: [
                                    { id: 11, name: 'Cyan', bg: '#0a0a0a', text: '#00ffff' },
                                    { id: 12, name: 'Pink', bg: '#0a0a0a', text: '#ff00ff' },
                                    { id: 13, name: 'Green', bg: '#0a0a0a', text: '#00ff00' },
                                    { id: 14, name: 'Orange', bg: '#0a0a0a', text: '#ff6600' },
                                    { id: 15, name: 'Blue', bg: '#0a0a0a', text: '#0066ff' },
                                ]
                            },
                            {
                                id: 'badge', name: 'Badge', icon: '🏆', items: [
                                    { id: 16, name: 'VIP', bg: 'linear-gradient(135deg, #d4af37, #f4e4a6)', text: '#1a1a1a' },
                                    { id: 17, name: 'Premium', bg: 'linear-gradient(135deg, #667eea, #764ba2)', text: '#ffffff' },
                                    { id: 18, name: 'Royal', bg: 'linear-gradient(135deg, #1a1a2e, #4a4a6a)', text: '#d4af37' },
                                    { id: 19, name: 'Coral', bg: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)', text: '#ffffff' },
                                    { id: 20, name: 'Ocean', bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', text: '#ffffff' },
                                ]
                            },
                            {
                                id: 'luxury', name: 'Luxury', icon: '💎', items: [
                                    { id: 21, name: 'Black Tie', bg: '#000000', text: '#d4af37' },
                                    { id: 22, name: 'Champagne', bg: '#f5f5dc', text: '#8b7355' },
                                    { id: 23, name: 'Velvet', bg: '#800020', text: '#ffd700' },
                                    { id: 24, name: 'Midnight', bg: '#0c0c1e', text: '#e8e8e8' },
                                ]
                            },
                            {
                                id: 'minimal', name: 'Minimal', icon: '⬜', items: [
                                    { id: 25, name: 'Pure White', bg: '#ffffff', text: '#000000' },
                                    { id: 26, name: 'Pure Black', bg: '#000000', text: '#ffffff' },
                                    { id: 27, name: 'Soft Gray', bg: '#f0f0f0', text: '#333333' },
                                ]
                            },
                        ].map((category) => (
                            <div key={category.id}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">{category.icon}</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">{category.name}</span>
                                    <span className="text-[9px] text-white/30">({category.items.length})</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {category.items.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => onSelect({
                                                nameBoardConfig: {
                                                    variant: preset.id,
                                                    displayText: 'Guest Name',
                                                    fontFamily: 'Playfair Display',
                                                    fontSize: 48,
                                                    textColor: preset.text,
                                                    backgroundColor: preset.bg,
                                                    borderColor: preset.text + '40',
                                                    borderWidth: 2,
                                                    borderRadius: 16,
                                                    shadowEnabled: true,
                                                    gradientEnabled: false,
                                                    gradientStart: '#667eea',
                                                    gradientEnd: '#764ba2'
                                                }
                                            })}
                                            className="p-3 rounded-xl border border-white/10 hover:border-amber-500/50 transition-all text-center group"
                                            style={{ background: preset.bg.includes('gradient') ? preset.bg : preset.bg }}
                                        >
                                            <div className="text-[10px] font-bold truncate" style={{ color: preset.text }}>{preset.name}</div>
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


                {/* CONFETTI */}
                {type === 'confetti' && (
                    <div className="grid grid-cols-2 gap-3">
                        {CONFETTI_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ confettiConfig: { colors: preset.colors } })}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all gap-2"
                            >
                                <span className="text-2xl">{preset.icon}</span>
                                <span className="text-[10px] font-bold text-white/80">{preset.label}</span>
                                <div className="flex gap-1 mt-1">
                                    {preset.colors.slice(0, 3).map((c, j) => (
                                        <div key={j} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* MUSIC LIBRARY */}
                {type === 'music_player' && (
                    <div className="space-y-3">
                        {isLoadingSongs ? (
                            <div className="flex flex-col items-center justify-center p-8 gap-3">
                                <PremiumLoader variant="inline" showLabel label="Loading Library..." />
                            </div>
                        ) : songs.length > 0 ? (
                            songs.map((track: Song, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => onSelect({
                                        musicPlayerConfig: {
                                            audioUrl: track.url,
                                            title: track.title,
                                            artist: track.artist,
                                            id: track.id
                                        }
                                    })}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-premium-accent/20 flex items-center justify-center group-hover:bg-premium-accent/40 transition-colors">
                                        <Music className="w-5 h-5 text-premium-accent" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-white truncate">{track.title}</div>
                                        <div className="text-[10px] text-white/40 truncate">{track.artist}</div>
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-white/5 text-[8px] text-white/40 uppercase tracking-tighter">
                                        {track.category || 'Preview'}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-white/20">
                                <p className="text-[10px] uppercase tracking-widest">No music found</p>
                            </div>
                        )}
                        <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Or upload your own mp3 in Property Panel</p>
                        </div>
                    </div>
                )}

                {/* WAVE & BLOBS */}
                {type === 'svg_wave' && (
                    <div className="grid gap-3">
                        {WAVE_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ waveConfig: { ...preset.config } })}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-premium-accent/10 flex items-center justify-center text-premium-accent">
                                    {preset.icon}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">{preset.label}</div>
                                    <div className="text-[10px] text-white/40">Premium vector path</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* SOCIAL MOCKUP */}
                {type === 'social_mockup' && (
                    <div className="grid grid-cols-2 gap-3">
                        {['instagram', 'twitter', 'whatsapp', 'tiktok'].map((platform) => (
                            <button
                                key={platform}
                                onClick={() => onSelect({ socialMockupConfig: { platform: platform as any } })}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all gap-2 capitalize"
                            >
                                <Monitor className="w-6 h-6 text-white/60" />
                                <span className="text-[10px] font-bold text-white/80">{platform}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* DIGITAL GIFT */}
                {type === 'digital_gift' && (
                    <div className="grid gap-3">
                        <button
                            onClick={() => onSelect({ digitalGiftConfig: { theme: 'gold' } })}
                            className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-left relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Luxury Gold</span>
                                <p className="text-[10px] text-white/60 mt-1">Premium card for bank transfers</p>
                            </div>
                        </button>
                        <button
                            onClick={() => onSelect({ digitalGiftConfig: { theme: 'glass' } })}
                            className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-left group"
                        >
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Modern Glass</span>
                            <p className="text-[10px] text-white/60 mt-1">Clean and professional design</p>
                        </button>
                    </div>
                )}

                {/* TILT CARD (3D) */}
                {type === 'tilt_card' && (
                    <div className="grid grid-cols-2 gap-3">
                        {TILT_CARD_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ ...preset.config })}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all gap-2"
                            >
                                {preset.icon}
                                <span className="text-[10px] font-bold text-white/80">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* WEATHER WIDGET */}
                {type === 'weather_widget' && (
                    <div className="grid gap-2">
                        {WEATHER_PRESETS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ weatherConfig: { city: p.label, temp: p.temp } })}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    {p.icon}
                                    <span className="text-xs font-bold text-white">{p.label}</span>
                                </div>
                                <span className="text-xs text-premium-accent font-black">{p.temp}°C</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* QR CODE - Interactive & Static */}
                {type === 'qr_code' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-2">
                            {QR_PRESETS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSelect({ qrCodeConfig: { foreground: p.fg, interactiveEnabled: false } })}
                                    className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                                >
                                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{p.icon}</span>
                                    <span className="text-[8px] text-white/60 truncate w-full text-center">Static {p.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="h-px bg-white/10 mx-2" />

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-premium-accent uppercase tracking-[0.2em] px-1">Interactive Triggers</h3>

                            {INTERACTIVE_QR_PRESETS.map((cat, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-premium-accent/50" />
                                        {cat.category}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cat.effects.map((eff) => (
                                            <button
                                                key={eff.id}
                                                onClick={() => onSelect({
                                                    qrCodeConfig: {
                                                        interactiveEnabled: true,
                                                        successEffect: eff.id as any
                                                    }
                                                })}
                                                className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all group"
                                            >
                                                <span className="text-sm group-hover:rotate-12 transition-transform">{eff.icon}</span>
                                                <span className="text-[10px] text-white/70 group-hover:text-white font-medium truncate">{eff.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MARQUEE & TICKERS */}
                {type === 'infinite_marquee' && (
                    <div className="grid gap-2">
                        <button
                            onClick={() => onSelect({ content: 'AWARD WINNING DESIGN • ENTERPRISE STANDARDS • ' })}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/80 text-left"
                        >
                            Standard Enterprise Ticker
                        </button>
                        <button
                            onClick={() => onSelect({ content: 'SPECIAL INVITATION • UNLIMITED MAGIC • ' })}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/80 text-left"
                        >
                            Invitation Magic Ticker
                        </button>
                    </div>
                )}

                {/* UTILITY BUTTONS (Calendar, Directions, Share) */}
                {(type === 'calendar_sync' || type === 'directions_hub' || type === 'share_context') && (
                    <div className="p-4 rounded-xl bg-premium-accent/10 border border-premium-accent/20 text-center">
                        <Sparkles className="w-8 h-8 text-premium-accent mx-auto mb-2" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Standard Preset</h4>
                        <p className="text-[10px] text-white/40 mb-3">Add the default {type.replace('_', ' ')} logic to your canvas.</p>
                        <button
                            onClick={() => onSelect({})}
                            className="w-full py-2 bg-premium-accent text-premium-dark rounded-lg font-black text-[10px] uppercase tracking-widest"
                        >
                            Add Default Element
                        </button>
                    </div>
                )}

                {/* OTHER PARTICLES (Fireworks, Bubbles, Snow) */}
                {(type === 'fireworks' || type === 'bubbles' || type === 'snow') && (
                    <div className="grid grid-cols-2 gap-3">
                        {PARTICLE_PRESETS[type as keyof typeof PARTICLE_PRESETS]?.map((p: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => onSelect(type === 'fireworks' ? { fireworksConfig: { colors: p.colors } } : { particlesConfig: { color: p.color } })}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all gap-2"
                            >
                                <span className="text-2xl">{p.icon}</span>
                                <span className="text-[10px] font-bold text-white/80">{p.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* GLASS CARD */}
                {type === 'glass_card' && (
                    <div className="grid gap-3">
                        <button
                            onClick={() => onSelect({ glassCardConfig: { opacity: 0.1, blur: 20 } })}
                            className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-left"
                        >
                            <span className="text-xs font-black text-white uppercase tracking-widest">Ultra Glass</span>
                            <div className="text-[10px] text-white/40 mt-1">Maximum transparency & blur</div>
                        </button>
                    </div>
                )}


                {/* INTERACTION (BLAST) */}
                {type === 'interaction' && (
                    <div className="space-y-6">
                        <div className="p-3 bg-premium-accent/10 border border-premium-accent/20 rounded-xl mb-4">
                            <h4 className="text-xs font-bold text-premium-accent mb-1 flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                Cinematic Trigger
                            </h4>
                            <p className="text-[10px] text-white/60 leading-relaxed">
                                This element creates a hidden trigger area. When clicked by a guest, it will fire a synchronized visual "Blast" across the entire screen and reveal their name.
                            </p>
                        </div>

                        {INTERACTIVE_QR_PRESETS.map((cat, idx) => (
                            <div key={idx}>
                                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest px-1 mb-2">{cat.category}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {cat.effects.map((effect) => (
                                        <button
                                            key={effect.id}
                                            onClick={() => onSelect({ interactionConfig: { effect: effect.id } })}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-premium-accent/20 border border-white/5 hover:border-premium-accent/40 transition-all text-left group"
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{effect.icon}</span>
                                            <div>
                                                <div className="text-xs font-bold text-white">{effect.label}</div>
                                                <div className="text-[9px] text-white/40">Full screen burst</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
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
                                    <PremiumLoader variant="inline" showLabel label="Uploading..." labelColor="white" />
                                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Please wait</p>
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
        </motion.div >,
        document.body
    );
};
