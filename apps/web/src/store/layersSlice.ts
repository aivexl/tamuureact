import { StateCreator } from 'zustand';
import { generateId } from '@/lib/utils';

// ============================================
// ELEMENT TYPES (from tamuu legacy)
// ============================================
export type LayerType =
    | 'image'
    | 'gif'
    | 'text'
    | 'icon'
    | 'countdown'
    | 'button'
    | 'open_invitation_button'
    | 'video'
    | 'sticker'
    | 'shape'
    | 'maps_point'
    | 'rsvp_form'
    | 'guest_wishes'
    | 'rsvp_wishes'
    | 'lottie'
    | 'flying_bird'
    | 'photo_grid'
    // ENTERPRISE V2 TYPES
    | 'confetti'
    | 'fireworks'
    | 'bubbles'
    | 'snow'
    | 'digital_gift'
    | 'guestbook_ticker'
    | 'music_player'
    | 'calendar_sync'
    | 'svg_wave'
    | 'generative_blob'
    | 'glass_card'
    | 'infinite_marquee'
    | 'tilt_card'
    | 'parallax_layer'
    | 'hologram_overlay'
    | 'gradient_mesh'
    | 'info_ticker'
    | 'social_mockup'
    | 'weather_widget'
    | 'directions_hub'
    | 'share_context'
    | 'interaction'
    | 'name_board'
    | 'love_story'
    | 'qr_code'
    | 'gift_address';


// ============================================
// ANIMATION TYPES
// ============================================
export type AnimationType =
    | 'none'
    | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
    | 'slide-in-left' | 'slide-in-right' | 'slide-out-left' | 'slide-out-right'
    | 'zoom-in' | 'zoom-out' | 'zoom-in-down' | 'zoom-in-up'
    | 'flip-x' | 'flip-y' | 'rotate-in-down-left' | 'rotate-in-down-right'
    | 'bounce' | 'pop-in' | 'blur-in' | 'twirl-in'
    | 'float' | 'pulse' | 'sway' | 'spin' | 'glow' | 'heartbeat' | 'sparkle'
    | 'flap-bob' | 'float-flap' | 'fly-left' | 'fly-right' | 'fly-up' | 'fly-down' | 'fly-random' | 'twirl' | 'elegant-spin';

// ============================================
// STYLE CONFIGS
// ============================================
export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textAlign: 'left' | 'center' | 'right';
    color: string;
    textDecoration?: 'none' | 'underline';
    lineHeight?: number;
    letterSpacing?: number;
    multiline?: boolean; // CTO: Enable multi-line wrapping when true
}

export interface IconStyle {
    iconName: string;
    iconColor: string;
    iconSize: number;
}

// ============================================
// COUNTDOWN VARIANTS (20 Premium Designs)
// ============================================
export type CountdownVariant =
    // Classic Category (3)
    | 'elegant'           // Refined serif typography with gold accents
    | 'classic'           // Traditional with colon separators
    | 'minimal'           // Clean, no decorations, mono font
    // Flip & Card Category (3)
    | 'flip'              // Animated flip clock with 3D effect
    | 'flip-dark'         // Dark theme flip with neon accents
    | 'flip-neon'         // Cyberpunk-style flip with glow
    // Box & Card Category (4)
    | 'boxed'             // Individual solid boxes for each unit
    | 'boxed-gradient'    // Boxes with gradient backgrounds
    | 'card-glass'        // Glassmorphism transparent cards
    | 'card-solid'        // Solid colored cards with shadows
    // Circle Category (3)
    | 'circle-progress'   // Circular progress rings showing remaining time
    | 'circle-minimal'    // Minimal circles with centered numbers
    | 'ring'              // Thin ring outlines with numbers
    // Modern Category (3)
    | 'modern-split'      // Split design with large numbers and small labels
    | 'neon-glow'         // Glowing neon effect
    | 'cyber'             // Futuristic tech/cyberpunk theme
    // Luxury Category (3)
    | 'luxury-gold'       // Gold gradients with premium fonts
    | 'luxury-rose'       // Rose gold theme
    | 'wedding-script'    // Elegant script fonts for weddings
    // Unique Category (1)
    | 'typewriter';       // Typewriter-style monospace with animation

export type CountdownSeparatorStyle = 'colon' | 'dot' | 'line' | 'slash' | 'none';
export type CountdownFontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
export type CountdownShadowStyle = 'none' | 'soft' | 'medium' | 'heavy' | 'glow' | 'neon';
export type CountdownBorderStyle = 'none' | 'solid' | 'gradient' | 'glow';
export type CountdownAnimationType = 'none' | 'fade' | 'slide' | 'flip' | 'bounce' | 'scale' | 'blur';

export interface CountdownConfig {
    // Target Date
    targetDate: string;

    // Variant Selection (backward compatible with 'style')
    variant: CountdownVariant;
    style?: CountdownVariant; // Legacy support

    // Visibility Controls
    showDays: boolean;
    showHours: boolean;
    showMinutes: boolean;
    showSeconds: boolean;
    showLabels: boolean;
    showSeparators: boolean;

    // Labels
    labels: { days: string; hours: string; minutes: string; seconds: string };
    separatorStyle: CountdownSeparatorStyle;

    // Colors
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    labelColor: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientAngle?: number;
    glowColor?: string;
    glowIntensity?: number; // 0-100

    // Typography
    fontFamily: string;
    numberFontFamily?: string; // Separate font for digits
    fontSize: number;
    fontWeight: CountdownFontWeight;
    labelFontSize?: number;
    labelFontWeight?: CountdownFontWeight;
    letterSpacing?: number;

    // Box/Card Styling
    borderRadius: number;
    boxPadding: number;
    boxGap: number;
    boxShadow: CountdownShadowStyle;
    borderStyle: CountdownBorderStyle;
    borderWidth?: number;
    borderColor?: string;

    // Circle Progress (for circle variants)
    progressColor?: string;
    progressBgColor?: string;
    progressWidth?: number;
    showProgressRing?: boolean;

    // Animation
    animateOnChange: boolean;
    animationType: CountdownAnimationType;
    animationDuration?: number; // ms

    // Advanced
    useFlipAnimation?: boolean;
    use3DEffect?: boolean;
    showReflection?: boolean;
}

// Default countdown configuration
export const DEFAULT_COUNTDOWN_CONFIG: CountdownConfig = {
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    variant: 'elegant',
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    showLabels: true,
    showSeparators: true,
    labels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
    separatorStyle: 'colon',
    backgroundColor: 'transparent',
    textColor: '#ffffff',
    accentColor: '#bfa181',
    labelColor: '#888888',
    fontFamily: 'Outfit',
    fontSize: 32,
    fontWeight: 'bold',
    borderRadius: 12,
    boxPadding: 16,
    boxGap: 12,
    boxShadow: 'none',
    borderStyle: 'none',
    animateOnChange: true,
    animationType: 'fade',
};


export interface ButtonConfig {
    buttonText: string;
    buttonColor: string;
    textColor: string;
    buttonStyle: 'elegant' | 'modern' | 'glass' | 'neon';
    buttonShape: 'pill' | 'rounded' | 'rectangle';
    showIcon: boolean;
    iconName?: string;
}

export interface ShapeConfig {
    shapeType: 'rectangle' | 'rounded-rectangle' | 'circle' | 'triangle' | 'diamond' | 'heart' | 'star' | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    pathData?: string;
}

export interface MapsConfig {
    googleMapsUrl: string;
    displayName: string;
    pinColor: string;
    showLabel: boolean;
    showLinkButton: boolean;
    buttonText: string;
}

export interface MotionPathPoint {
    x: number;
    y: number;
    rotation?: number;      // Rotation at this point (degrees, -360 to 360)
    scale?: number;         // Scale at this point (0.1 to 3.0, default 1)
    duration?: number;      // Time to reach this point from previous (ms)
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';  // Easing function
}

export interface MotionPathConfig {
    enabled: boolean;
    points: MotionPathPoint[];
    duration: number;
    loop: boolean;
}

export interface FlyingBirdConfig {
    direction: 'left' | 'right';
    birdColor: string;
    flapSpeed: number;
}

export interface LottieConfig {
    url: string;
    loop: boolean;
    autoplay: boolean;
    speed: number;
    direction: 'left' | 'right';
}

// ============================================
// RSVP VARIANT TYPES (20 Styles)
// ============================================
export type RSVPVariantId =
    | 'classic' | 'minimal' | 'modern' | 'elegant' | 'rustic'
    | 'romantic' | 'floral' | 'boho' | 'luxury' | 'dark'
    | 'glass' | 'neon' | 'vintage' | 'bold' | 'outline'
    | 'pastel' | 'geometric' | 'brutalist' | 'cloud' | 'monochrome';

// ============================================
// RSVP WISHES CONFIG (Enterprise-grade)
// ============================================
export interface RSVPWishesConfig {
    // Style Selection
    style: RSVPVariantId;
    variant: RSVPVariantId; // Kept for backward compat

    // Content Labels
    title: string;
    subtitle?: string;
    submitButtonText: string;
    wishesTitle: string;
    wishesSubtitle?: string;
    thankYouMessage: string;

    // Form Fields Toggle
    showNameField: boolean;
    showEmailField: boolean;
    showPhoneField: boolean;
    showAttendanceField: boolean;
    showGuestCountField: boolean;
    showMessageField: boolean;
    showMealPreference: boolean;
    showSongRequest: boolean;

    // Field Labels (Customizable)
    nameLabel?: string;
    emailLabel?: string;
    phoneLabel?: string;
    attendanceLabel?: string;
    guestCountLabel?: string;
    messageLabel?: string;
    mealPreferenceLabel?: string;
    songRequestLabel?: string;

    // Attendance Options
    attendanceOptions: {
        attending: string;
        notAttending: string;
        maybe?: string;
    };

    // Guest Count Settings
    guestCountMax: number;
    guestCountDefault: number;

    // Meal Options
    mealOptions?: string[];

    // Styling
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor: string;
    textColor: string;
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    buttonTextColor?: string;
    borderRadius: number;
    fontFamily?: string;

    // Wishes Display
    wishesLayout: 'list' | 'grid' | 'masonry' | 'carousel' | 'ticker';
    wishesMaxDisplay: number;
    showWishTimestamp: boolean;
    showWishAvatar: boolean;
    wishCardStyle: 'minimal' | 'bordered' | 'shadow' | 'glass';
    wishesAutoScroll: boolean;
    wishesScrollSpeed?: number;

    // Validation
    nameMinLength: number;
    nameMaxLength: number;
    messageMinLength: number;
    messageMaxLength: number;
    requireMessage: boolean;

    // Anti-Spam
    enableCaptcha: boolean;
    captchaType?: 'simple' | 'recaptcha';

    // Animations
    formAnimation: 'none' | 'fade' | 'slide-up' | 'scale';
    wishCardAnimation: 'none' | 'fade' | 'slide' | 'pop';
    submitButtonAnimation: 'none' | 'pulse' | 'glow' | 'shine';
}

// Legacy interfaces kept for backward compatibility
export interface RSVPFormConfig {
    title: string;
    showNameField: boolean;
    showEmailField: boolean;
    showPhoneField: boolean;
    showMessageField: boolean;
    showAttendanceField: boolean;
    buttonColor: string;
    submitButtonText: string;
    style: 'classic' | 'modern' | 'glass';
}

export interface GuestWishesConfig {
    style: 'classic' | 'modern' | 'glass';
    layout: 'list' | 'grid' | 'masonry';
    maxDisplayCount: number;
    showTimestamp: boolean;
    cardBackgroundColor: string;
    textColor: string;
}


export interface OpenInvitationConfig {
    buttonText: string;
    subText?: string;
    buttonStyle: 'elegant' | 'modern' | 'glass' | 'minimal' | 'luxury';
    buttonShape: 'pill' | 'rounded' | 'rectangle';
    fontFamily: string;
    fontSize: number;
    buttonColor: string;
    textColor: string;
    showIcon: boolean;
    iconName?: string;
    enabled: boolean;
    position: 'bottom-center' | 'center';
}

// ============================================
// LAYER INTERFACE
// ============================================
export interface ElegantSpinConfig {
    enabled?: boolean;
    duration?: number;
    spinDuration?: number;
    scaleDuration?: number;
    delay?: number;
    direction?: 'cw' | 'ccw';
    minScale?: number;
    maxScale?: number;
    trigger?: 'scroll' | 'click' | 'open_btn' | 'load';
    looping?: boolean | string; // Added for enterprise timing
}

export interface InfiniteMarqueeConfig {
    enabled?: boolean;
    mode?: 'tile' | 'scroll' | 'seamless'; // tile = pattern, scroll = bounce, seamless = infinite
    speed?: number;     // Speed in px/s
    angle?: number;     // 0-360 deg (for tile mode) or direction preset
    direction?: 'left' | 'right' | 'up' | 'down'; // For seamless mode
    reverse?: boolean;
    distance?: number;  // For scroll mode: how far to travel before reset
}

export interface PhotoGridConfig {
    variant: 'single' | 'split-h' | 'split-v' | 'quad' | 'triple-h' | 'hero-left' | 'hero-right' | 'mosaic' | 'featured' | 'cluster';
    images: string[];
    gap: number;
    cornerRadius: number;
    hoverEffect: 'none' | 'zoom' | 'zoom-rotate' | 'brightness' | 'grayscale' | 'blur-reveal' | 'overlay' | 'tilt' | 'glow';
}

// ============================================
// ENTERPRISE V2 CONFIGS ($100B Standard)
// ============================================
export interface MaskConfig {
    enabled: boolean;
    type: 'circle' | 'arch' | 'hexagon' | 'diamond' | 'flower' | 'blob' | 'custom';
    pathData?: string; // For custom SVG masking
    imageUrl?: string; // For image-based masking
}

export interface CurvedTextConfig {
    enabled: boolean;
    radius: number;
    spacing: number;
    angle: number;
    reverse: boolean;
}

// ============================================
// ENTERPRISE V4 PERMISSIONS & ANCHORING
// ============================================
export interface LayerPermissions {
    canEditText?: boolean;      // Can change text content
    canEditImage?: boolean;     // Can change image/media
    canEditStyle?: boolean;     // Can change colors/fonts (color, size, weight)
    canEditPosition?: boolean;  // Can move the element via drag/inputs
    canDelete?: boolean;        // Can remove the element from the section
    isVisibleInUserEditor?: boolean; // If false, element is hidden from User's Layer Panel
    isContentProtected?: boolean;   // Advanced: protects against even indirect changes
    canEditContent?: boolean;       // Legacy support
    showCopyButton?: boolean;       // Legacy support
}

export interface LayerAnchoring {
    targetId?: string;          // ID of the target element to anchor to
    edge?: 'top' | 'bottom' | 'left' | 'right'; // Edge of target to follow
    offset?: number;            // Distance in pixels from the target edge
    isRelative?: boolean;       // Enable dynamic shifting behavior (Liquid Layout)
}

// ============================================
// ENTERPRISE V3 CONFIGS (Unicorn Grade)
// ============================================

export interface ConfettiConfig {
    colors: string[];
    particleCount: number;
    spread: number;
    origin: { x: number; y: number };
    gravity: number;
    drift: number;
    ticks: number;
}

export interface FireworksConfig {
    colors: string[];
    burstCount: number;
    particleCount: number;
    speed: number;
}

export interface ParticlesConfig {
    type: 'bubbles' | 'snow' | 'stars' | 'bokeh';
    color: string;
    density: number;
    speed: number;
    size: number;
}

export interface DigitalGiftConfig {
    title: string;
    description: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrImage?: string;
    buttonText: string;
    theme: 'gold' | 'silver' | 'glass' | 'custom';
    customColor?: string;
}

export interface GiftAddressConfig {
    title: string;
    recipientName: string;
    phoneNumber: string;
    address: string;
    note?: string;
    buttonText: string;
    customColor?: string;
}

export interface LoveStoryMoment {
    id: string;
    date: string;
    title: string;
    description: string;
    imageUrl?: string;
}

export interface LoveStoryConfig {
    variant: 'elegant' | 'modern' | 'zigzag' | 'cards';
    themeColor: string;
    markerStyle: 'heart' | 'dot' | 'diamond' | 'star';
    lineThickness: number;
    titleColor?: string;
    descriptionColor?: string;
    dateColor?: string;
    events: LoveStoryMoment[];
}

export interface MusicPlayerConfig {
    audioUrl: string;
    title: string;
    artist: string;
    coverUrl?: string;
    autoplay: boolean;
    loop: boolean;
    visualizerEnabled: boolean;
    visualizerColor: string;
}

export interface QRCodeConfig {
    value: string;
    size: number;
    foreground?: string;
    background?: string;
    darkColor?: string;
    lightColor?: string;
    logoUrl?: string;
    includeMargin: boolean;
    interactiveEnabled?: boolean;
    successEffect?: LayersState['activeEffect'];
}

export interface WaveConfig {
    type: 'wave' | 'blob' | 'steps';
    color: string;
    opacity: number;
    amplitude: number;
    frequency: number;
    points: number;
    speed: number;
}

export interface InteractionConfig {
    effect: LayersState['activeEffect'];
    greetingStyle: 'cinematic' | 'simple' | 'none';
    triggerType: 'click' | 'hover' | 'auto' | 'test' | 'on_checkin' | 'manual';
    autoClose?: boolean;
    duration?: number;
    resetDuration?: number; // CTO: Auto-reset duration in MS (default 8000)
    testName?: string;
}

export interface NameBoardConfig {
    variant: number;
    displayText: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    shadowEnabled: boolean;
    gradientEnabled: boolean;
    gradientStart: string;
    gradientEnd: string;
}

export interface GlassCardConfig {
    blur: number;
    opacity: number;
    borderColor: string;
    borderWidth: number;
    saturation: number;
}


export interface SocialMockupConfig {
    platform: 'instagram' | 'twitter' | 'whatsapp' | 'tiktok';
    username: string;
    handle?: string;
    avatarUrl: string;
    content: string;
    timestamp: string;
    likes?: string;
    verified?: boolean;
}

export interface WeatherConfig {
    city: string;
    temp?: string;
    unit: 'c' | 'f';
    showIcon: boolean;
    theme: 'minimal' | 'glass' | 'dynamic';
}

export interface Layer {
    id: string;
    type: LayerType;
    name: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    scale?: number;
    opacity?: number;
    zIndex: number;
    isLocked?: boolean;
    isVisible?: boolean;

    // Filters
    filters?: {
        brightness?: number; // 0-200
        contrast?: number;   // 0-200
        blur?: number;       // 0-20
        sepia?: number;      // 0-100
        grayscale?: number;  // 0-100
        hueRotate?: number;  // 0-360
        saturate?: number;   // 0-200
        invert?: number;     // 0-100
    };

    // Style properties (Enterprise level)
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    shadow?: {
        color: string;
        blur: number;
        x: number;
        y: number;
        spread: number;
    };

    // Enterprise Asset Management
    assetMetadata?: {
        id?: string;
        source?: string;
        alt?: string;
        optimizedUrl?: string;
        aspectRatio?: number;
        naturalWidth?: number;
        naturalHeight?: number;
    };

    // Parallax & Advanced Motion
    parallaxFactor?: number;

    // Type-specific configs
    textStyle?: TextStyle;
    iconStyle?: IconStyle;
    countdownConfig?: CountdownConfig;
    buttonConfig?: ButtonConfig;
    openInvitationConfig?: any;
    shapeConfig?: ShapeConfig;
    mapsConfig?: MapsConfig;
    motionPathConfig?: any;
    elegantSpinConfig?: any;
    infiniteMarqueeConfig?: InfiniteMarqueeConfig;
    photoGridConfig?: PhotoGridConfig;
    lottieConfig?: any;
    flyingBirdConfig?: any;
    rsvpFormConfig?: any;
    guestWishesConfig?: any;
    rsvpWishesConfig?: any;
    interactionConfig?: InteractionConfig;

    // ENTERPRISE V3 CONFIGS
    confettiConfig?: ConfettiConfig;
    fireworksConfig?: FireworksConfig;
    particlesConfig?: ParticlesConfig;
    digitalGiftConfig?: DigitalGiftConfig;
    musicPlayerConfig?: MusicPlayerConfig;
    qrCodeConfig?: QRCodeConfig;
    waveConfig?: WaveConfig;
    glassCardConfig?: GlassCardConfig;
    loveStoryConfig?: LoveStoryConfig;

    socialMockupConfig?: SocialMockupConfig;
    weatherConfig?: WeatherConfig;
    calendarSyncConfig?: any;
    tickerConfig?: any;
    parallaxConfig?: any;
    hologramConfig?: any;
    gradientMeshConfig?: any;
    nameBoardConfig?: NameBoardConfig;
    giftAddressConfig?: GiftAddressConfig;

    // ENTERPRISE V2 FEATURES
    maskConfig?: MaskConfig;
    curvedTextConfig?: CurvedTextConfig;
    groupId?: string; // For grouping system

    animation?: {
        entrance?: any;
        loop?: any;
        trigger?: 'scroll' | 'click' | 'load' | 'open_btn';
        delay?: number;
        duration?: number;
        entranceType?: AnimationType;
        looping?: boolean | string; // Root level animation looping status
    };

    // ENTERPRISE V4: PERMISSIONS & ANCHORING
    permissions?: LayerPermissions;
    anchoring?: LayerAnchoring;

    // Animation Backwards Compatibility
    animationType?: AnimationType;
    animationDelay?: number;
    animationDuration?: number;
    trigger?: 'scroll' | 'click' | 'load' | 'open_btn';
    animationLoop?: AnimationType;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
}


// ============================================
// LAYERS STATE
// ============================================
export interface GlobalTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontHeading: string;
    fontBody: string;
    cornerRadius: number;
}

export interface LayersState {
    layers: Layer[];
    selectedLayerId: string | null;
    selectedLayerIds: string[];
    addLayer: (layer: Layer) => void;
    removeLayer: (id: string) => void;
    clearLayers: () => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    selectLayer: (id: string | null, isMulti?: boolean) => void;
    selectLayers: (ids: string[]) => void;
    clearSelection: () => void;
    duplicateLayer: (id: string) => void;
    reorderLayers: (startIndex: number, endIndex: number) => void;
    bringToFront: (id: string) => void;
    sendToBack: (id: string) => void;
    clipboard: Layer | null;
    copyLayer: (layer: Layer) => void;
    updateLayersBatch: (layers: Layer[]) => void;
    sanitizeAllLayers: () => void;

    // Feature 7: Global Theme
    globalTheme: GlobalTheme;
    updateGlobalTheme: (updates: Partial<GlobalTheme>) => void;

    // Feature 8: Global Effects
    activeEffect: 'none' | string;
    activeEffects: { id: string, type: string, origin: { x: number, y: number }, timestamp: number }[];
    greetingName: string;
    greetingStyle: 'cinematic' | 'simple' | 'none';
    lastInteractionId: number;
    interactionNonce: number; // Incrementing counter to force re-animation
    triggerGlobalEffect: (effect: string, origin?: { x: number, y: number }) => void;
    triggerInteraction: (name: string, effect: string, style?: 'cinematic' | 'simple' | 'none', origin?: { x: number, y: number }, customResetDuration?: number) => void;
    triggerBatchInteractions: (name: string, interactions: { effect: string, style?: 'cinematic' | 'simple' | 'none', origin?: { x: number, y: number }, resetDuration?: number }[]) => void;
    removeActiveEffect: (id: string) => void;
    // ENTERPRISE V5: Dimension Tracking for Smart Position
    elementDimensions: Record<string, { width: number, height: number }>;
    updateElementDimensions: (id: string, width: number, height: number) => void;

    resetInteractions: () => void; // CTO: Clear all interaction states synchronously
}

// ============================================
// DEFAULT DEMO LAYERS
// ============================================
// ============================================
// HELPERS
// ============================================
export const sanitizeLayer = (layer: Layer): Layer => {
    const MAX_SIZE = 2000; // CTO Refinement: Relaxed to 2000px for high-res decorative assets
    let sanitized = { ...layer };
    let changed = false;

    if (sanitized.width > MAX_SIZE || sanitized.height > MAX_SIZE) {
        const ratio = sanitized.width / (sanitized.height || 1);
        if (sanitized.width > sanitized.height) {
            sanitized.width = 1200; // Set to a generous max instead of 400
            sanitized.height = Math.round(1200 / ratio);
        } else {
            sanitized.height = 1200;
            sanitized.width = Math.round(1200 * ratio);
        }
        changed = true;
    }

    // CTO Refinement: Clamping scale to professional range (0.1 - 4.0)
    if (sanitized.scale !== undefined && (sanitized.scale > 4 || sanitized.scale < 0.1)) {
        sanitized.scale = 1;
        changed = true;
    }

    return changed ? sanitized : layer;
};

const createDefaultLayers = (): Layer[] => [
    {
        id: 'demo-text-1',
        type: 'text',
        name: 'Welcome Text',
        x: 57,
        y: 200,
        width: 300,
        height: 60,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        content: 'Welcome to Our Day',
        animation: {
            entrance: { type: 'fade-in', duration: 800, delay: 0, trigger: 'scroll' },
            loop: { type: 'float', duration: 2000, delay: 0, trigger: 'load' }
        },
        textStyle: {
            fontFamily: 'Outfit',
            fontSize: 28,
            fontWeight: 'bold',
            fontStyle: 'normal',
            textAlign: 'center',
            color: '#ffffff'
        }
    },
    {
        id: 'demo-countdown-1',
        type: 'countdown',
        name: 'Countdown Timer',
        x: 37,
        y: 350,
        width: 340,
        height: 100,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        animation: {
            entrance: { type: 'zoom-in', duration: 1000, delay: 200, trigger: 'scroll' }
        },
        countdownConfig: {
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            variant: 'elegant',
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            showLabels: true,
            showSeparators: true,
            labels: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
            separatorStyle: 'colon',
            backgroundColor: 'transparent',
            textColor: '#ffffff',
            accentColor: '#bfa181',
            labelColor: '#888888',
            fontFamily: 'Outfit',
            fontSize: 32,
            fontWeight: 'bold',
            borderRadius: 12,
            boxPadding: 16,
            boxGap: 12,
            boxShadow: 'none',
            borderStyle: 'none',
            animateOnChange: true,
            animationType: 'fade',
        }
    },
    {
        id: 'demo-button-1',
        type: 'button',
        name: 'Open Button',
        x: 67,
        y: 520,
        width: 280,
        height: 60,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 20,
        isLocked: false,
        isVisible: true,
        animation: {
            entrance: { type: 'slide-up', duration: 800, delay: 400, trigger: 'scroll' },
            loop: { type: 'glow', duration: 2000, delay: 0, trigger: 'load' }
        },
        buttonConfig: {
            buttonText: 'Buka Undangan',
            buttonColor: '#bfa181',
            textColor: '#0a0a0a',
            buttonStyle: 'elegant',
            buttonShape: 'pill',
            showIcon: true,
            iconName: 'mail-open'
        }
    }
];

// ============================================
// SLICE IMPLEMENTATION
// ============================================
export const createLayersSlice: StateCreator<LayersState> = (set, get) => ({
    layers: createDefaultLayers(),
    selectedLayerId: null,
    selectedLayerIds: [],
    clipboard: null,
    elementDimensions: {},
    updateElementDimensions: (id, width, height) => set((state) => ({
        elementDimensions: {
            ...state.elementDimensions,
            [id]: { width, height }
        }
    })),

    addLayer: (layer) => set((state) => ({
        layers: [...state.layers, layer],
        selectedLayerId: layer.id
    })),

    removeLayer: (id) => set((state) => ({
        layers: state.layers.filter((l) => l.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
    })),

    clearLayers: () => set({ layers: [], selectedLayerId: null }),

    updateLayer: (id, updates) => set((state) => ({
        layers: state.layers.map((l) => l.id === id ? sanitizeLayer({ ...l, ...updates }) : l)
    })),

    selectLayer: (id, isMulti = false) => set((state) => {
        if (!id) return { selectedLayerId: null, selectedLayerIds: [] };

        if (!isMulti) {
            return { selectedLayerId: id, selectedLayerIds: [id] };
        }

        const newIds = state.selectedLayerIds.includes(id)
            ? state.selectedLayerIds.filter(idx => idx !== id)
            : [...state.selectedLayerIds, id];

        return {
            selectedLayerIds: newIds,
            selectedLayerId: newIds.length > 0 ? newIds[newIds.length - 1] : null
        };
    }),

    selectLayers: (ids) => set({
        selectedLayerIds: ids,
        selectedLayerId: ids.length > 0 ? ids[ids.length - 1] : null
    }),

    clearSelection: () => set({ selectedLayerId: null, selectedLayerIds: [] }),

    duplicateLayer: (id) => {
        const state = get();
        const layer = state.layers.find(l => l.id === id);
        if (!layer) return;

        const newLayer: Layer = {
            ...layer,
            id: generateId('layer'),
            name: `${layer.name} (Copy)`,
            x: layer.x + 20,
            y: layer.y + 20
        };

        set((state) => ({
            layers: [...state.layers, newLayer],
            selectedLayerId: newLayer.id
        }));
    },

    reorderLayers: (startIndex, endIndex) => set((state) => {
        const newLayers = Array.from(state.layers);
        const [removed] = newLayers.splice(startIndex, 1);
        newLayers.splice(endIndex, 0, removed);
        return { layers: newLayers };
    }),

    bringToFront: (id) => set((state) => {
        const maxZ = Math.max(...state.layers.map(l => l.zIndex));
        return {
            layers: state.layers.map(l => l.id === id ? { ...l, zIndex: maxZ + 1 } : l)
        };
    }),

    sendToBack: (id) => set((state) => {
        const minZ = Math.min(...state.layers.map(l => l.zIndex));
        return {
            layers: state.layers.map(l => l.id === id ? { ...l, zIndex: minZ - 1 } : l)
        };
    }),

    copyLayer: (layer: Layer) => set({ clipboard: layer }),

    updateLayersBatch: (layers) => set({ layers }),

    sanitizeAllLayers: () => set((state) => ({
        layers: state.layers.map(sanitizeLayer)
    })),

    // Feature 7: Global Theme Implementation
    globalTheme: {
        primaryColor: '#D4AF37', // Gold
        secondaryColor: '#FFFFFF',
        accentColor: '#B8860B', // Dark Gold
        backgroundColor: '#1E1E1E',
        textColor: '#FFFFFF',
        fontHeading: 'Playfair Display',
        fontBody: 'Lato',
        cornerRadius: 12
    },

    updateGlobalTheme: (updates) => set((state) => ({
        globalTheme: { ...state.globalTheme, ...updates }
    })),

    // Feature 8: Global Effects Implementation
    activeEffect: 'none',
    activeEffects: [],
    greetingName: '',
    greetingStyle: 'cinematic',
    lastInteractionId: 0,
    interactionNonce: 0,
    triggerGlobalEffect: (effect, origin) => {
        const id = generateId('effect');
        set((state) => ({
            activeEffect: effect, // Keep legacy sync
            activeEffects: [...state.activeEffects, {
                id,
                type: effect,
                origin: origin || { x: 0.5, y: 0.5 }, // 0.5 = Center relative
                timestamp: Date.now()
            }]
        }));

        // Auto-cleanup handles itself in VisualEffectsCanvas, but we safety clear here too
        setTimeout(() => {
            set((state) => ({
                activeEffects: state.activeEffects.filter(e => e.id !== id),
                activeEffect: state.activeEffects.length > 1 ? state.activeEffects[state.activeEffects.length - 2].type : 'none'
            }));
        }, 8000);
    },
    triggerInteraction: (name, effect, style = 'cinematic', origin, customResetDuration) => {
        get().triggerBatchInteractions(name, [{ effect, style, origin, resetDuration: customResetDuration }]);
    },
    triggerBatchInteractions: (name, interactions) => {
        if (!interactions.length) return;

        const timestamp = Date.now();
        const batchId = `batch-${timestamp}`;
        const primaryInteraction = interactions[0];
        const style = primaryInteraction.style || 'cinematic';

        console.log(`[Store] triggerBatchInteractions: ${name} | count: ${interactions.length} | nonce: ${get().interactionNonce + 1}`);

        // Dev Sync: Write to localStorage for cross-tab preview
        if (typeof window !== 'undefined') {
            localStorage.setItem('tamuu_interaction_event', JSON.stringify({
                name,
                interactions: interactions.map(i => ({
                    effect: i.effect,
                    style: i.style || 'cinematic',
                    origin: i.origin || { x: 0.5, y: 0.5 },
                    resetDuration: i.resetDuration
                })),
                timestamp
            }));
        }

        const newActiveEffects = interactions.map((i, idx) => ({
            id: `${batchId}-${idx}`,
            type: i.effect,
            origin: i.origin || { x: 0.5, y: 0.5 },
            timestamp
        }));

        set((state) => ({
            greetingName: name || state.greetingName,
            activeEffect: primaryInteraction.effect,
            greetingStyle: style,
            lastInteractionId: timestamp,
            interactionNonce: state.interactionNonce + 1,
            activeEffects: [...state.activeEffects, ...newActiveEffects]
        }));

        // Reset after duration
        interactions.forEach((i, idx) => {
            const effectId = newActiveEffects[idx].id;
            const duration = i.resetDuration || 8000;

            setTimeout(() => {
                set((state) => {
                    const isStillSame = state.lastInteractionId === timestamp;
                    return {
                        greetingName: isStillSame ? '' : state.greetingName,
                        activeEffects: state.activeEffects.filter(e => e.id !== effectId),
                        activeEffect: state.activeEffects.length > 1
                            ? state.activeEffects[state.activeEffects.length - 2].type
                            : 'none'
                    };
                });
            }, duration);
        });
    },
    removeActiveEffect: (id) => set((state) => ({
        activeEffects: state.activeEffects.filter(e => e.id !== id)
    })),
    resetInteractions: () => set(() => ({
        greetingName: '',
        activeEffect: 'none',
        activeEffects: [],
        lastInteractionId: 0,
        interactionNonce: 0
    }))
});
