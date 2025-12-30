import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, Layer, LayerType } from '@/store/useStore';
import { generateId } from '@/lib/utils';
import {
    Type, Image as ImageIcon, Clock, MailOpen,
    Heart, Square, Film, MapPin, Video, Sparkles, X,
    MessageSquare, Users, Circle, Triangle, Diamond, Star, Zap, Wind, Layout
} from 'lucide-react';

const CANVAS_WIDTH = 414;

interface ElementConfig {
    type: LayerType;
    icon: React.ReactNode;
    label: string;
    color: string;
    createDefault: () => Partial<Layer>;
}

const elementConfigs: ElementConfig[] = [
    {
        type: 'text',
        icon: <Type className="w-5 h-5" />,
        label: 'Text',
        color: 'hover:bg-blue-500/10 hover:border-blue-500/30',
        createDefault: () => ({
            width: 200,
            height: 50,
            content: 'New Text',
            animation: { entrance: 'fade-in' as const },
            textStyle: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fontWeight: 'normal' as const,
                fontStyle: 'normal' as const,
                textAlign: 'center' as const,
                color: '#ffffff'
            }
        })
    },
    {
        type: 'image',
        icon: <ImageIcon className="w-5 h-5" />,
        label: 'Image',
        color: 'hover:bg-green-500/10 hover:border-green-500/30',
        createDefault: () => ({
            width: 200,
            height: 200
        })
    },
    {
        type: 'icon',
        icon: <Heart className="w-5 h-5" />,
        label: 'Icon',
        color: 'hover:bg-pink-500/10 hover:border-pink-500/30',
        createDefault: () => ({
            width: 64,
            height: 64,
            iconStyle: { iconName: 'heart', iconColor: '#bfa181', iconSize: 48 }
        })
    },
    {
        type: 'countdown',
        icon: <Clock className="w-5 h-5" />,
        label: 'Countdown',
        color: 'hover:bg-orange-500/10 hover:border-orange-500/30',
        createDefault: () => ({
            width: 340,
            height: 100,
            animation: { entrance: 'zoom-in' as const },
            countdownConfig: {
                targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                variant: 'elegant' as const,
                showDays: true, showHours: true, showMinutes: true, showSeconds: true,
                showLabels: true, showSeparators: true,
                labels: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
                separatorStyle: 'colon' as const,
                backgroundColor: 'transparent',
                textColor: '#ffffff',
                accentColor: '#bfa181',
                labelColor: '#888888',
                fontFamily: 'Outfit',
                fontSize: 32,
                fontWeight: 'bold' as const,
                borderRadius: 12,
                boxPadding: 16,
                boxGap: 12,
                boxShadow: 'none' as const,
                borderStyle: 'none' as const,
                animateOnChange: true,
                animationType: 'fade' as const,
            }
        })
    },
    {
        type: 'button',
        icon: <MailOpen className="w-5 h-5" />,
        label: 'Button',
        color: 'hover:bg-amber-500/10 hover:border-amber-500/30',
        createDefault: () => ({
            width: 280,
            height: 60,
            animation: { entrance: 'slide-up' as const, looping: 'glow' as const },
            buttonConfig: {
                buttonText: 'Buka Undangan',
                buttonColor: '#bfa181',
                textColor: '#0a0a0a',
                buttonStyle: 'elegant' as const,
                buttonShape: 'pill' as const,
                showIcon: true,
                iconName: 'mail-open'
            }
        })
    },
    {
        type: 'shape',
        icon: <Square className="w-5 h-5" />,
        label: 'Shape',
        color: 'hover:bg-purple-500/10 hover:border-purple-500/30',
        createDefault: () => ({
            width: 150,
            height: 150,
            shapeConfig: {
                shapeType: 'rectangle' as const,
                fill: '#bfa181',
                stroke: undefined,
                strokeWidth: 2,
                cornerRadius: 8
            }
        })
    },
    {
        type: 'open_invitation_button',
        icon: <MailOpen className="w-5 h-5" />,
        label: 'Open Btn',
        color: 'hover:bg-teal-500/10 hover:border-teal-500/30',
        createDefault: () => ({
            width: 220,
            height: 50,
            type: 'open_invitation_button',
            content: 'Buka Undangan',
            openInvitationConfig: {
                buttonText: 'Buka Undangan',
                subText: '',
                buttonStyle: 'elegant' as const,
                buttonShape: 'pill' as const,
                fontFamily: 'Inter',
                fontSize: 16,
                buttonColor: '#722f37',
                textColor: '#ffffff',
                showIcon: true,
                iconName: 'mail-open',
                enabled: true,
                position: 'bottom-center' as const
            }
        })
    },
    {
        type: 'maps_point',
        icon: <MapPin className="w-5 h-5" />,
        label: 'Maps',
        color: 'hover:bg-red-500/10 hover:border-red-500/30',
        createDefault: () => ({
            width: 300,
            height: 180,
            mapsConfig: {
                googleMapsUrl: '',
                displayName: 'Location',
                pinColor: '#EF4444',
                showLabel: true,
                showLinkButton: true,
                buttonText: 'View Map'
            }
        })
    },
    {
        type: 'gif',
        icon: <Film className="w-5 h-5" />,
        label: 'GIF',
        color: 'hover:bg-indigo-500/10 hover:border-indigo-500/30',
        createDefault: () => ({
            width: 200,
            height: 200
        })
    },
    {
        type: 'video',
        icon: <Video className="w-5 h-5" />,
        label: 'Video',
        color: 'hover:bg-cyan-500/10 hover:border-cyan-500/30',
        createDefault: () => ({
            width: 320,
            height: 180
        })
    },
    {
        type: 'rsvp_form',
        icon: <MessageSquare className="w-5 h-5" />,
        label: 'RSVP',
        color: 'hover:bg-emerald-500/10 hover:border-emerald-500/30',
        createDefault: () => ({
            width: 320,
            height: 200,
            rsvpFormConfig: {
                title: 'RSVP Form',
                showNameField: true,
                showEmailField: true,
                showPhoneField: false,
                showMessageField: true,
                showAttendanceField: true,
                buttonColor: '#bfa181',
                submitButtonText: 'Kirim Ucapan',
                style: 'modern'
            }
        })
    },
    {
        type: 'lottie',
        icon: <Zap className="w-5 h-5" />,
        label: 'Lottie',
        color: 'hover:bg-purple-500/10 hover:border-purple-500/30',
        createDefault: () => ({
            width: 200,
            height: 200,
            lottieConfig: {
                url: '',
                loop: true,
                autoplay: true,
                speed: 1,
                direction: 'left'
            }
        })
    },
    {
        type: 'flying_bird',
        icon: <Wind className="w-5 h-5" />,
        label: 'Bird',
        color: 'hover:bg-blue-500/10 hover:border-blue-500/30',
        createDefault: () => ({
            width: 80,
            height: 80,
            flyingBirdConfig: {
                direction: 'left',
                birdColor: '#1a1a1a',
                flapSpeed: 0.3
            }
        })
    },
    {
        type: 'guest_wishes',
        icon: <Users className="w-5 h-5" />,
        label: 'Wishes',
        color: 'hover:bg-rose-500/10 hover:border-rose-500/30',
        createDefault: () => ({
            width: 320,
            height: 250
        })
    },
    {
        type: 'rsvp_wishes',
        icon: <MessageSquare className="w-5 h-5" />,
        label: 'RSVP+Wishes',
        color: 'hover:bg-gradient-to-r from-emerald-500/10 to-rose-500/10 hover:border-emerald-500/30',
        createDefault: () => ({
            width: 360,
            height: 600,
            rsvpWishesConfig: {
                variant: 'modern-glass',
                title: 'Konfirmasi Kehadiran',
                subtitle: 'Kami menantikan kehadiran Anda',
                submitButtonText: 'Kirim RSVP',
                wishesTitle: 'Ucapan & Doa',
                wishesSubtitle: 'Dari para tamu undangan',
                thankYouMessage: 'Terima kasih atas konfirmasi dan ucapan Anda!',
                showNameField: true,
                showEmailField: false,
                showPhoneField: true,
                showAttendanceField: true,
                showGuestCountField: true,
                showMessageField: true,
                showMealPreference: false,
                showSongRequest: false,
                attendanceOptions: { attending: 'Hadir', notAttending: 'Tidak Hadir', maybe: 'Belum Pasti' },
                guestCountMax: 5,
                guestCountDefault: 1,
                primaryColor: '#bfa181',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                textColor: '#ffffff',
                borderRadius: 12,
                wishesLayout: 'list',
                wishesMaxDisplay: 50,
                showWishTimestamp: true,
                showWishAvatar: true,
                wishCardStyle: 'glass',
                wishesAutoScroll: false,
                nameMinLength: 2,
                nameMaxLength: 100,
                messageMinLength: 0,
                messageMaxLength: 500,
                requireMessage: false,
                enableCaptcha: false,
                formAnimation: 'fade',
                wishCardAnimation: 'slide',
                submitButtonAnimation: 'glow'
            }
        })
    },
    {
        type: 'photo_grid',
        icon: <Layout className="w-5 h-5" />,
        label: 'Photo Grid',
        color: 'hover:bg-blue-400/10 hover:border-blue-400/30',
        createDefault: () => ({
            width: 320,
            height: 320,
            photoGridConfig: {
                variant: 'quad',
                images: [],
                gap: 8,
                cornerRadius: 12,
                hoverEffect: 'none'
            }
        })
    }
];


// Shape sub-options
const shapeOptions = [
    { type: 'rectangle', icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
    { type: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
    { type: 'triangle', icon: <Triangle className="w-4 h-4" />, label: 'Triangle' },
    { type: 'diamond', icon: <Diamond className="w-4 h-4" />, label: 'Diamond' },
    { type: 'heart', icon: <Heart className="w-4 h-4" />, label: 'Heart' },
    { type: 'star', icon: <Star className="w-4 h-4" />, label: 'Star' }
];

// ... (imports remain)

// ... (previous imports)
import { AssetSelectionModal } from './AssetSelectionModal';

interface ElementToolbarProps {
    embedded?: boolean;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ embedded = false }) => {
    const { activeSectionId, addElementToSection, selectLayer } = useStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTool, setActiveTool] = useState<LayerType | null>(null);

    // This function now receives specific config from the modal
    const handleElementSelect = (additionalConfig: any = {}) => {
        if (!activeSectionId || !activeTool) return;

        // Find the base config for the active tool
        const config = elementConfigs.find(c => c.type === activeTool);
        if (!config) return;

        const defaults = config.createDefault();
        const newLayerId = generateId('layer');

        // Merge defaults with granular config from modal
        // Note: We need to be careful about deep merging if needed, 
        // but for now shallow merge of specific keys is likely enough or we construct the object.

        const newLayer: Layer = {
            id: newLayerId,
            type: config.type,
            name: `New ${config.label}`,
            x: CANVAS_WIDTH / 2 - (defaults.width || 100) / 2,
            y: 200 + Math.random() * 100,
            width: defaults.width || 100,
            height: defaults.height || 100,
            rotation: 0,
            scale: 1,
            opacity: 1,
            zIndex: 10,
            isLocked: false,
            isVisible: true,
            ...defaults,
            ...additionalConfig, // Apply potential overrides like image URL, text styles, etc.
            // Merge nested configs if they exist in both
            ...(additionalConfig.textStyle && defaults.textStyle ? { textStyle: { ...defaults.textStyle, ...additionalConfig.textStyle } } : {}),
            ...(additionalConfig.buttonConfig && defaults.buttonConfig ? { buttonConfig: { ...defaults.buttonConfig, ...additionalConfig.buttonConfig } } : {}),
            ...(additionalConfig.shapeConfig && defaults.shapeConfig ? { shapeConfig: { ...defaults.shapeConfig, ...additionalConfig.shapeConfig } } : {}),
            ...(additionalConfig.iconStyle && defaults.iconStyle ? { iconStyle: { ...defaults.iconStyle, ...additionalConfig.iconStyle } } : {}),
            ...(additionalConfig.countdownConfig && defaults.countdownConfig ? { countdownConfig: { ...defaults.countdownConfig, ...additionalConfig.countdownConfig } } : {}),
        };

        addElementToSection(activeSectionId, newLayer);
        selectLayer(newLayerId);

        // Reset interaction state
        setActiveTool(null);
        setIsExpanded(false);
    };

    const allTools = elementConfigs; // Use all tools if embedded

    if (embedded) {
        return (
            <div className="relative z-50">
                {/* Modal for Embedded Mode opens to the LEFT */}
                <AnimatePresence>
                    {activeTool && (
                        <AssetSelectionModal
                            type={activeTool}
                            onSelect={handleElementSelect}
                            onClose={() => setActiveTool(null)}
                            direction="left"
                        />
                    )}
                </AnimatePresence>

                {/* Grid Layout for Embedded Mode */}
                <SectionComponent title="Add Elements" icon={<Sparkles className="w-4 h-4" />}>
                    <div className="grid grid-cols-4 gap-2">
                        {allTools.map((config) => (
                            <motion.button
                                key={config.type}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTool(activeTool === config.type ? null : config.type)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all aspect-square border ${activeTool === config.type
                                    ? 'bg-premium-accent text-premium-dark border-premium-accent'
                                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20'}`}
                                title={config.label}
                            >
                                {config.icon}
                                <span className="text-[9px] mt-1 truncate w-full text-center">{config.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </SectionComponent>
            </div>
        );
    }

    const quickTools = elementConfigs.slice(0, 5);
    const moreTools = elementConfigs.slice(5);

    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
            {/* Modal */}
            <AnimatePresence>
                {activeTool && (
                    <AssetSelectionModal
                        type={activeTool}
                        onSelect={handleElementSelect}
                        onClose={() => setActiveTool(null)}
                    />
                )}
            </AnimatePresence>

            {/* Main Toolbar */}
            <motion.div layout className="glass-panel p-2 rounded-2xl flex flex-col gap-2">
                {/* Quick Tools */}
                {quickTools.map((config) => (
                    <motion.button
                        key={config.type}
                        whileHover={{ scale: 1.1, x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            // Close expanded if open, and set active tool
                            setIsExpanded(false);
                            setActiveTool(activeTool === config.type ? null : config.type);
                        }}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative group border border-transparent ${activeTool === config.type ? 'bg-premium-accent text-premium-dark' : `text-white/60 ${config.color}`}`}
                    >
                        {config.icon}
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-premium-accent text-premium-dark text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-20">
                            Add {config.label}
                        </div>
                    </motion.button>
                ))}

                <div className="w-7 h-[1px] bg-white/10 mx-auto my-1" />

                {/* More Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setIsExpanded(!isExpanded);
                        setActiveTool(null); // Close any active modal
                    }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-premium-accent/20 text-premium-accent' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                        }`}
                >
                    {isExpanded ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </motion.button>
            </motion.div>

            {/* Expanded Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className="absolute left-full top-0 ml-3 glass-panel p-4 rounded-2xl w-72"
                    >
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">More Elements</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {moreTools.map((config) => (
                                <motion.button
                                    key={config.type}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setActiveTool(config.type);
                                        // Keeping isExpanded true so they can pick more? Or false? 
                                        // Usually better to close or maybe keep open but show modal on top?
                                        // Let's close the More menu when a selection is made to focus on the modal.
                                        setIsExpanded(false);
                                    }}
                                    className={`flex flex-col items-center justify-center h-20 rounded-xl border border-white/5 bg-white/[0.02] text-white/60 transition-all ${config.color}`}
                                >
                                    {config.icon}
                                    <span className="text-[9px] mt-1.5">{config.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper component for embedded mode structure
const SectionComponent: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-white/60">
            {icon}
            <h4 className="text-[10px] font-bold uppercase tracking-widest">{title}</h4>
        </div>
        {children}
    </div>
);
