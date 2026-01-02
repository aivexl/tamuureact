/**
 * BACKGROUND REMOVER PAGE
 * Enterprise-grade AI-powered background removal tool
 * 
 * Features:
 * - Fast ONNX Runtime processing (<30 seconds)
 * - Direct transparent result display
 * - Private & Secure (100% Client-side)
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Upload,
    Download,
    RefreshCw,
    ArrowLeft,
    Sparkles,
    CheckCircle,
    AlertCircle,
    Edit2,
} from 'lucide-react';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';

// Preset background colors - Enterprise grade
const PRESET_COLORS = [
    { name: 'Pure White', value: '#ffffff', preview: 'bg-white' },
    { name: 'Studio Black', value: '#000000', preview: 'bg-black' },
    { name: 'Soft Gray', value: '#f5f5f7', preview: 'bg-[#f5f5f7]' },
    { name: 'Deep Navy', value: '#0a192f', preview: 'bg-[#0a192f]' },
    { name: 'Royal Gold', value: '#bfa181', preview: 'bg-[#bfa181]' },
    { name: 'Elite Rose', value: '#fde2e4', preview: 'bg-[#fde2e4]' },
];

// Premium Gradient Collection
const PRESET_GRADIENTS = [
    { name: 'Midnight', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
    { name: 'Sunrise', value: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' },
    { name: 'Aurora', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
    { name: 'Champagne', value: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' },
];

// Texture overlays (Mocked with CSS)
const PRESET_TEXTURES = [
    { name: 'Studio Grid', value: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)' },
    { name: 'Spotlight', value: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)' },
];

export const BackgroundRemoverPage: React.FC = () => {
    const {
        processImage,
        applyBackground,
        isLoading,
        isModelLoading,
        progress,
        downloadSpeed,
        originalImage,
        resultImage,
        error,
        reset,
    } = useBackgroundRemoval();

    const [isDragging, setIsDragging] = useState(false);
    const [selectedBgType, setSelectedBgType] = useState<'transparent' | 'color' | 'gradient' | 'texture'>('transparent');
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const [activeTab, setActiveTab] = useState<'colors' | 'gradients' | 'textures'>('colors');
    const [customColor, setCustomColor] = useState('#ffffff');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    }, [processImage]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
        // Reset input so user can upload same file again or new files
        e.target.value = '';
    }, [processImage]);

    const handleColorChange = async (color: string) => {
        setSelectedColor(color);
        if (color === 'transparent') {
            setSelectedBgType('transparent');
            await applyBackground('transparent');
        } else {
            setSelectedBgType('color');
            await applyBackground('color', color);
        }
    };

    const handleDownload = () => {
        if (!resultImage) return;

        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `background-removed-${Date.now()}.png`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-premium-accent selection:text-black">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-premium-accent/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.05] bg-black/20">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                        >
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                        </Link>
                        <div className="h-8 w-px bg-white/10 hidden sm:block" />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                Background Remover
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em]">Enterprise AI Tool</p>
                            </div>
                        </div>
                    </div>

                    {resultImage && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={reset}
                                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-medium text-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset
                            </button>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-2.5 bg-premium-accent text-black font-semibold rounded-xl hover:bg-premium-accent-light transition-all shadow-[0_8px_32px_rgb(191,161,129,0.3)] hover:shadow-[0_8px_32px_rgb(191,161,129,0.5)] active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                Download Result
                            </motion.button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 relative">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Side: Editor Section */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {!originalImage ? (
                                /* Upload Zone - Premium State */
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    onDragEnter={() => setIsDragging(true)}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`
                                        relative group aspect-[16/10] rounded-[32px] border-2 border-dashed
                                        flex flex-col items-center justify-center cursor-pointer
                                        transition-all duration-500 overflow-hidden
                                        ${isDragging
                                            ? 'border-premium-accent bg-premium-accent/10 scale-[1.01] shadow-[0_0_80px_rgba(191,161,129,0.15)]'
                                            : 'border-white/10 bg-white/[0.02] hover:border-premium-accent/30 hover:bg-white/[0.04]'
                                        }
                                    `}
                                >
                                    {/* Animated Background Elements */}
                                    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-premium-accent/5 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
                                    </div>

                                    <motion.div
                                        animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                                        className="relative z-10 flex flex-col items-center gap-8"
                                    >
                                        <div className={`
                                            w-28 h-28 rounded-3xl flex items-center justify-center
                                            bg-gradient-to-br from-white/10 to-white/5 border border-white/20
                                            shadow-2xl transition-all duration-300
                                            ${isDragging ? 'rotate-12 border-premium-accent' : 'group-hover:-rotate-6'}
                                        `}>
                                            <Upload className={`w-12 h-12 ${isDragging ? 'text-premium-accent' : 'text-white/60'} group-hover:text-premium-accent transition-colors`} />
                                        </div>
                                        <div className="text-center space-y-4">
                                            <h2 className="text-3xl font-bold tracking-tight">
                                                {isDragging ? 'Drop it here!' : 'Remove background in seconds'}
                                            </h2>
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-white/40 max-w-sm px-4">
                                                    Drag and drop your image, or click to browse files from your computer.
                                                </p>
                                                <div className="flex items-center gap-4 mt-4 py-2 px-6 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
                                                    <span>PNG</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                    <span>JPG</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                    <span>WEBP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </motion.div>
                            ) : (
                                /* Result View - Direct Transparent Result */
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    {/* Main Display Card - Direct Result */}
                                    <div
                                        className="relative aspect-[16/10] rounded-[32px] overflow-hidden border border-white/10 shadow-3xl ring-1 ring-white/5"
                                    >
                                        {/* Checkerboard Background for Transparency */}
                                        <div className="absolute inset-0">
                                            {selectedBgType === 'transparent' ? (
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        backgroundImage: `
                                                            linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
                                                            linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
                                                            linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
                                                            linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
                                                        `,
                                                        backgroundSize: '20px 20px',
                                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                                        backgroundColor: '#1a1a1a'
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="absolute inset-0 transition-all duration-700"
                                                    style={{ background: selectedColor }}
                                                />
                                            )}
                                        </div>

                                        {/* Result Image - Direct Display */}
                                        {resultImage && !isLoading && (
                                            <img
                                                src={resultImage}
                                                alt="Result"
                                                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                            />
                                        )}

                                        {/* Loading Overlay */}
                                        <AnimatePresence>
                                            {isLoading && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 z-50 backdrop-blur-3xl bg-black/60 flex flex-col items-center justify-center p-12 text-center"
                                                >
                                                    <div className="relative mb-12">
                                                        {/* Pulsing Orbitals */}
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                                            transition={{ duration: 3, repeat: Infinity }}
                                                            className="absolute inset-[-40px] rounded-full border border-premium-accent/30"
                                                        />
                                                        <motion.div
                                                            animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
                                                            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                                                            className="absolute inset-[-80px] rounded-full border border-premium-accent/20"
                                                        />

                                                        {/* Main Spinner Ring */}
                                                        <div className="relative w-32 h-32">
                                                            <svg className="w-full h-full -rotate-90">
                                                                <circle
                                                                    cx="64"
                                                                    cy="64"
                                                                    r="60"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                    fill="transparent"
                                                                    className="text-white/5"
                                                                />
                                                                <motion.circle
                                                                    cx="64"
                                                                    cy="64"
                                                                    r="60"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                    fill="transparent"
                                                                    strokeDasharray="376.99"
                                                                    initial={{ strokeDashoffset: 376.99 }}
                                                                    animate={{ strokeDashoffset: 376.99 - (376.99 * progress) / 100 }}
                                                                    className="text-premium-accent"
                                                                    style={{ strokeLinecap: 'round' }}
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Sparkles className="w-10 h-10 text-premium-accent animate-pulse" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 max-w-xs">
                                                        <h3 className="text-2xl font-bold tracking-tight">
                                                            {isModelLoading ? 'Mempersiapkan AI...' : 'Memproses Gambar...'}
                                                        </h3>
                                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-premium-accent shadow-[0_0_15px_rgba(191,161,129,0.8)]"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-white/30 uppercase">
                                                            <span>{downloadSpeed || 'Stabilizing...'}</span>
                                                            <span>{progress}%</span>
                                                        </div>
                                                    </div>

                                                    <p className="absolute bottom-12 text-[10px] text-white/20 font-medium tracking-widest uppercase">
                                                        Data Anda aman • Pemrosesan Lokal
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Result Badge */}
                                        {resultImage && !isLoading && (
                                            <div className="absolute top-6 right-6 pointer-events-none">
                                                <div className="px-4 py-2 backdrop-blur-md bg-premium-accent/80 rounded-full text-[10px] font-bold text-black tracking-widest uppercase shadow-xl flex items-center gap-2">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Hasil Transparan
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Secondary Action Bar */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all font-medium text-sm flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4 text-white/40" />
                                            Ganti Gambar
                                        </button>
                                        <div className="flex-1 h-px bg-white/5" />
                                        <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">
                                            ONNX Runtime • Pemrosesan Cepat
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Side: Sidebar Controls */}
                    {/* Right Side: Sidebar Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:w-[360px] flex flex-col gap-6"
                    >
                        {/* Background Selection Card */}
                        <div className="backdrop-blur-3xl bg-white/[0.04] border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                            {/* Sidebar Tabs */}
                            <div className="flex border-b border-white/10 p-2 gap-1 bg-black/20">
                                {(['colors', 'gradients', 'textures'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            flex-1 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all
                                            ${activeTab === tab
                                                ? 'bg-white/10 text-premium-accent'
                                                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'colors' && (
                                        <motion.div
                                            key="colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-6"
                                        >
                                            <div className="grid grid-cols-4 gap-3">
                                                <button
                                                    onClick={() => handleColorChange('transparent')}
                                                    className={`
                                                        aspect-square rounded-2xl border bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\'%3E%3Crect width=\'6\' height=\'6\' fill=\'%23333\'/%3E%3Crect x=\'6\' y=\'6\' width=\'6\' height=\'6\' fill=\'%23333\'/%3E%3C/svg%3E")]
                                                        ${selectedBgType === 'transparent' ? 'border-premium-accent ring-2 ring-premium-accent/20' : 'border-white/10'}
                                                    `}
                                                />
                                                {PRESET_COLORS.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => handleColorChange(color.value)}
                                                        className={`
                                                            aspect-square rounded-2xl border ${color.preview} transition-transform active:scale-90
                                                            ${selectedColor === color.value && selectedBgType === 'color' ? 'border-premium-accent ring-2 ring-premium-accent/20' : 'border-white/10'}
                                                        `}
                                                    />
                                                ))}
                                            </div>

                                            <div className="pt-6 border-t border-white/10">
                                                <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-4">Mewah & Klasik</p>
                                                <div className="flex items-center justify-between p-4 rounded-[24px] bg-white/[0.03] border border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="w-12 h-12 rounded-xl border border-white/20 shadow-inner"
                                                            style={{ backgroundColor: customColor }}
                                                        />
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-widest">Custom Tint</p>
                                                            <p className="text-[10px] text-white/30 font-mono mt-0.5">{customColor.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="color"
                                                        value={customColor}
                                                        onChange={(e) => {
                                                            setCustomColor(e.target.value);
                                                            handleColorChange(e.target.value);
                                                        }}
                                                        className="w-8 h-8 opacity-0 absolute pointer-events-none"
                                                        id="sidebarColorPicker"
                                                    />
                                                    <button
                                                        onClick={() => document.getElementById('sidebarColorPicker')?.click()}
                                                        className="p-2 ml-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-white/40" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'gradients' && (
                                        <motion.div
                                            key="gradients"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            {PRESET_GRADIENTS.map((gradient) => (
                                                <button
                                                    key={gradient.name}
                                                    onClick={() => handleColorChange(gradient.value)}
                                                    className="group relative h-20 rounded-2xl border border-white/10 overflow-hidden transition-all hover:scale-[1.02]"
                                                    style={{ background: gradient.value }}
                                                >
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <CheckCircle className="w-6 h-6 text-white" />
                                                    </div>
                                                    <p className="absolute bottom-2 left-3 text-[8px] font-bold uppercase tracking-widest text-white/60">{gradient.name}</p>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {activeTab === 'textures' && (
                                        <motion.div
                                            key="textures"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {PRESET_TEXTURES.map((texture) => (
                                                <button
                                                    key={texture.name}
                                                    onClick={() => handleColorChange(texture.value)}
                                                    className="w-full h-16 rounded-2xl border border-white/10 bg-[#111] overflow-hidden relative group"
                                                >
                                                    <div className="absolute inset-0" style={{ background: texture.value }} />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Apply {texture.name}</span>
                                                    </div>
                                                    <p className="absolute left-4 text-[9px] font-bold uppercase tracking-widest text-white/30">{texture.name}</p>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Pro Badge / Info */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-[#bfa181] via-[#8e7358] to-[#6d5641] rounded-[32px] p-8 text-black relative overflow-hidden group shadow-xl"
                        >
                            <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-white/20 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-px w-8 bg-black/20" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Exclusive AI</span>
                                </div>
                                <h4 className="font-black text-2xl tracking-tighter uppercase leading-tight">Elite Studio Engine</h4>
                                <p className="text-sm text-black/70 mt-3 font-semibold leading-relaxed">
                                    Professional-grade isolation and matte generation. Your data never leaves this device.
                                </p>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>

                {/* Bottom Error Notification */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md"
                        >
                            <div className="m-6 p-4 backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 shadow-2xl">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-red-200">System Error</p>
                                    <p className="text-xs text-red-500/60 truncate font-mono mt-0.5">{error}</p>
                                </div>
                                <button onClick={reset} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <RefreshCw className="w-4 h-4 text-white/40" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
