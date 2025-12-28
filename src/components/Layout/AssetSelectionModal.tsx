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

const COUNTDOWN_PRESETS = [
    { label: 'Elegant', style: 'elegant', preview: '00 : 00 : 00' },
    { label: 'Classic', style: 'classic', preview: '00 : 00 : 00' },
    { label: 'Minimal', style: 'minimal', preview: '00 00 00' },
    { label: 'Flip', style: 'flip', preview: 'Flip Style' },
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

                {/* COUNTDOWN */}
                {type === 'countdown' && (
                    <div className="space-y-2">
                        {COUNTDOWN_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect({ countdownConfig: { style: preset.style } })}
                                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all"
                            >
                                <div className="text-center font-mono text-premium-accent tracking-widest">{preset.preview}</div>
                                <div className="text-center text-[10px] text-white/40 mt-1 uppercase tracking-wider">{preset.label}</div>
                            </button>
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
