import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, Layer, LayerType } from '@/store/useStore';
import { generateId } from '@/lib/utils';
import {
    Type, Image as ImageIcon, Clock, MailOpen,
    Heart, Square, Film, MapPin, Video, Sparkles, X,
    MessageSquare, Users, Circle, Triangle, Diamond, Star, Zap, Wind, Layout,
    Gift, Music, QrCode, Waves, Layers, Monitor, Share2, Sun, Hash, PlaySquare,
    Component, Palette, Eye, Shield, CreditCard
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
    },
    // ============================================
    // ENTERPRISE V3 ELEMENTS (Unicorn Standard)
    // ============================================
    {
        type: 'confetti',
        icon: <Sparkles className="w-5 h-5" />,
        label: 'Confetti',
        color: 'hover:bg-yellow-500/10 hover:border-yellow-500/30',
        createDefault: () => ({
            width: 320,
            height: 320,
            confettiConfig: {
                colors: ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00'],
                particleCount: 50,
                spread: 70,
                origin: { x: 0.5, y: 0.5 },
                gravity: 1,
                drift: 0,
                ticks: 200
            }
        })
    },
    {
        type: 'fireworks',
        icon: <Zap className="w-5 h-5" />,
        label: 'Fireworks',
        color: 'hover:bg-orange-500/10 hover:border-orange-500/30',
        createDefault: () => ({
            width: 414,
            height: 400,
            fireworksConfig: {
                colors: ['#FFD700', '#FF4500', '#FF00FF'],
                burstCount: 3,
                particleCount: 40,
                speed: 3
            }
        })
    },
    {
        type: 'bubbles',
        icon: <Circle className="w-5 h-5" />,
        label: 'Bubbles',
        color: 'hover:bg-blue-300/10 hover:border-blue-300/30',
        createDefault: () => ({
            width: 414,
            height: 896,
            particlesConfig: {
                type: 'bubbles',
                color: '#ffffff',
                density: 20,
                speed: 1,
                size: 8
            }
        })
    },
    {
        type: 'snow',
        icon: <Wind className="w-5 h-5" />,
        label: 'Snow',
        color: 'hover:bg-slate-100/10 hover:border-slate-100/30',
        createDefault: () => ({
            width: 414,
            height: 896,
            particlesConfig: {
                type: 'snow',
                color: '#ffffff',
                density: 50,
                speed: 0.5,
                size: 3
            }
        })
    },
    {
        type: 'music_player',
        icon: <Music className="w-5 h-5" />,
        label: 'Music',
        color: 'hover:bg-violet-500/10 hover:border-violet-500/30',
        createDefault: () => ({
            width: 300,
            height: 80,
            musicPlayerConfig: {
                audioUrl: '',
                title: 'Song Title',
                artist: 'Artist Name',
                autoplay: true,
                loop: true,
                visualizerEnabled: true,
                visualizerColor: '#bfa181'
            }
        })
    },
    {
        type: 'love_story',
        icon: <Heart className="w-5 h-5" />,
        label: 'Love Story',
        color: 'hover:bg-premium-accent/10 hover:border-premium-accent/30',
        createDefault: () => ({
            width: 380,
            height: 600,
            loveStoryConfig: {
                variant: 'zigzag',
                markerStyle: 'heart',
                themeColor: '#bfa181',
                lineThickness: 2,
                events: [
                    {
                        id: generateId('event'),
                        date: '2023-01-01',
                        title: 'Pertemuan Pertama',
                        description: 'Di sinilah segalanya dimulai, di sebuah kafe kecil di sudut kota.',
                    },
                    {
                        id: generateId('event'),
                        date: '2024-05-20',
                        title: 'Lamaran',
                        description: 'Momen tak terlupakan saat janji suci diucapkan di bawah langit berbintang.',
                    }
                ]
            }
        })
    },
    {
        type: 'calendar_sync',
        icon: <Clock className="w-5 h-5" />,
        label: 'Calendar',
        color: 'hover:bg-blue-500/10 hover:border-blue-500/30',
        createDefault: () => ({
            width: 200,
            height: 50
        })
    },
    {
        type: 'svg_wave',
        icon: <Waves className="w-5 h-5" />,
        label: 'Wave',
        color: 'hover:bg-blue-400/10 hover:border-blue-400/30',
        createDefault: () => ({
            width: 414,
            height: 100,
            waveConfig: {
                type: 'wave',
                color: '#bfa181',
                opacity: 0.5,
                amplitude: 20,
                frequency: 0.01,
                points: 3,
                speed: 1
            }
        })
    },
    {
        type: 'generative_blob',
        icon: <Component className="w-5 h-5" />,
        label: 'Blob',
        color: 'hover:bg-indigo-400/10 hover:border-indigo-400/30',
        createDefault: () => ({
            width: 200,
            height: 200,
            waveConfig: {
                type: 'blob',
                color: '#bfa181',
                opacity: 0.3,
                amplitude: 40,
                frequency: 0.02,
                points: 6,
                speed: 0.5
            }
        })
    },
    {
        type: 'glass_card',
        icon: <Palette className="w-5 h-5" />,
        label: 'Glass',
        color: 'hover:bg-white/10 hover:border-white/30',
        createDefault: () => ({
            width: 300,
            height: 200,
            glassCardConfig: {
                blur: 10,
                opacity: 0.1,
                borderColor: '#ffffff',
                borderWidth: 1,
                saturation: 100
            }
        })
    },
    {
        type: 'infinite_marquee',
        icon: <Hash className="w-5 h-5" />,
        label: 'Marquee',
        color: 'hover:bg-lime-500/10 hover:border-lime-500/30',
        createDefault: () => ({
            width: 414,
            height: 60,
            content: 'ENTERPRISE LEVEL • UNICORN STANDARDS • AWARD WINNING DESIGN',
            infiniteMarqueeConfig: {
                enabled: true,
                mode: 'seamless',
                speed: 50,
                direction: 'left'
            }
        })
    },
    {
        type: 'tilt_card',
        icon: <Layers className="w-5 h-5" />,
        label: '3D Card',
        color: 'hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30',
        createDefault: () => ({
            width: 300,
            height: 400
        })
    },
    {
        type: 'social_mockup',
        icon: <Monitor className="w-5 h-5" />,
        label: 'Social',
        color: 'hover:bg-sky-500/10 hover:border-sky-500/30',
        createDefault: () => ({
            width: 320,
            height: 120,
            socialMockupConfig: {
                platform: 'instagram',
                username: 'tamuu_id',
                avatarUrl: '',
                content: 'Special invitation for our closest friends...',
                timestamp: '2h ago',
                verified: true
            }
        })
    },
    {
        type: 'weather_widget',
        icon: <Sun className="w-5 h-5" />,
        label: 'Weather',
        color: 'hover:bg-yellow-400/10 hover:border-yellow-400/30',
        createDefault: () => ({
            width: 200,
            height: 100,
            weatherConfig: {
                city: 'Jakarta',
                unit: 'c',
                showIcon: true,
                theme: 'glass'
            }
        })
    },
    {
        type: 'directions_hub',
        icon: <MapPin className="w-5 h-5" />,
        label: 'Directions',
        color: 'hover:bg-red-400/10 hover:border-red-400/30',
        createDefault: () => ({
            width: 300,
            height: 150
        })
    },
    {
        type: 'share_context',
        icon: <Share2 className="w-5 h-5" />,
        label: 'Share',
        color: 'hover:bg-emerald-400/10 hover:border-emerald-400/30',
        createDefault: () => ({
            width: 200,
            height: 50
        })
    },
    {
        type: 'interaction',
        icon: <Zap className="w-5 h-5" />,
        label: 'Blast',
        color: 'hover:bg-premium-accent/10 hover:border-premium-accent/30',
        createDefault: () => ({
            width: 100,
            height: 100,
            type: 'interaction',
            interactionConfig: {
                triggerType: 'click',
                effect: 'confetti',
                greetingStyle: 'cinematic',
                duration: 5000
            }
        })
    },
    {
        type: 'digital_gift',
        icon: <CreditCard className="w-5 h-5" />,
        label: 'Cards',
        color: 'hover:bg-red-500/10 hover:border-red-500/30',
        createDefault: () => ({
            width: 380,
            height: 240,
            digitalGiftConfig: {
                title: 'Kado Digital',
                description: 'Doa restu Anda adalah kado terindah...',
                bankName: 'Bank Central Asia',
                accountNumber: '1234567890',
                accountHolder: 'John Doe',
                buttonText: 'Salin Rekening',
                theme: 'gold'
            }
        })
    },
    {
        type: 'gift_address',
        icon: <Gift className="w-5 h-5" />,
        label: 'Gift Addr',
        color: 'hover:bg-slate-500/10 hover:border-slate-500/30',
        createDefault: () => ({
            width: 380,
            height: 240,
            giftAddressConfig: {
                title: 'Kirim Kado',
                recipientName: 'Nama Penerima',
                phoneNumber: '081234567890',
                address: 'Jl. Alamat Lengkap No. 123, Kota, Provinsi',
                note: 'Mohon konfirmasi sebelum mengirim.',
                buttonText: 'Salin Alamat',
                customColor: '#f8fafc'
            }
        })
    },
    {
        type: 'name_board' as LayerType,
        icon: <Users className="w-5 h-5" />,
        label: 'Name Board',
        color: 'hover:bg-amber-500/10 hover:border-amber-500/30',
        createDefault: () => ({
            width: 400,
            height: 120,
            type: 'name_board',
            nameBoardConfig: {
                variant: 1,
                displayText: 'Guest Name',
                fontFamily: 'Playfair Display',
                fontSize: 48,
                textColor: '#f8f9fa',
                backgroundColor: '#1a1a2e',
                borderColor: '#4a4a6a',
                borderWidth: 2,
                borderRadius: 16,
                shadowEnabled: true,
                gradientEnabled: false,
                gradientStart: '#667eea',
                gradientEnd: '#764ba2'
            }
        })
    },

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

import { AssetSelectionModal } from './AssetSelectionModal';

interface ElementToolbarProps {
    embedded?: boolean;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ embedded = false }) => {
    const {
        activeSectionId,
        addElementToSection,
        addOrbitElement,
        activeCanvas,
        selectLayer
    } = useStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTool, setActiveTool] = useState<LayerType | null>(null);

    // This function now receives specific config from the modal
    const handleElementSelect = (additionalConfig: any = {}) => {
        if (!activeTool) return;
        if (activeCanvas === 'main' && !activeSectionId) return;

        // Find the base config for the active tool
        const config = elementConfigs.find(c => c.type === activeTool);
        if (!config) return;

        const defaults = config.createDefault();
        const newLayerId = generateId('layer');

        // Context-Aware Positioning
        let defaultX = 0;
        let defaultY = 200 + Math.random() * 100;

        if (activeCanvas === 'main') {
            defaultX = (activeCanvas === 'main' ? CANVAS_WIDTH : 1920) / 2 - (defaults.width || 100) / 2;
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            defaultX = 400 - (defaults.width || 100) / 2; // Center in 800px wide Orbit stage
            defaultY = 450 - (defaults.height || 100) / 2; // Center in 900px high Orbit stage
        }

        const newLayer: Layer = {
            id: newLayerId,
            type: config.type,
            name: `New ${config.label}`,
            x: defaultX,
            y: defaultY,
            width: defaults.width || 100,
            height: defaults.height || 100,
            rotation: 0,
            scale: 1,
            opacity: 1,
            zIndex: 10,
            isLocked: false,
            isVisible: true,
            ...defaults,
            ...additionalConfig,
            ...(additionalConfig.textStyle && defaults.textStyle ? { textStyle: { ...defaults.textStyle, ...additionalConfig.textStyle } } : {}),
            ...(additionalConfig.buttonConfig && defaults.buttonConfig ? { buttonConfig: { ...defaults.buttonConfig, ...additionalConfig.buttonConfig } } : {}),
            ...(additionalConfig.shapeConfig && defaults.shapeConfig ? { shapeConfig: { ...defaults.shapeConfig, ...additionalConfig.shapeConfig } } : {}),
            ...(additionalConfig.iconStyle && defaults.iconStyle ? { iconStyle: { ...defaults.iconStyle, ...additionalConfig.iconStyle } } : {}),
            ...(additionalConfig.countdownConfig && defaults.countdownConfig ? { countdownConfig: { ...defaults.countdownConfig, ...additionalConfig.countdownConfig } } : {}),
        };

        // Unified Injection Engine
        if (activeCanvas === 'main' && activeSectionId) {
            addElementToSection(activeSectionId, newLayer);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            addOrbitElement(activeCanvas, newLayer);
        }

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
                    <div className="grid grid-cols-4 gap-2 px-1">
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
                                <span className="text-[8px] mt-1 truncate w-full text-center leading-none">{config.label}</span>
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
            <motion.div layout className="glass-panel p-2 rounded-2xl flex flex-col gap-2 shadow-2xl overflow-hidden border border-white/10">
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
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        className="absolute left-full top-0 ml-3 glass-panel p-4 rounded-2xl w-80 shadow-2xl border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-premium-accent uppercase tracking-widest">Premium Assets</h3>
                            <button onClick={() => setIsExpanded(false)} className="text-white/20 hover:text-white/50 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[70vh] premium-scroll pr-1">
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
                                    <span className="text-[9px] mt-1.5 font-medium">{config.label}</span>
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
