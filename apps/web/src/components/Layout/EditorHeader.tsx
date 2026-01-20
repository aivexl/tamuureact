import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, useTemporalStore } from '@/store/useStore';
import {
    ArrowLeft, Play, Save, Sparkles, Check,
    Undo2, Redo2, Edit2, X, ExternalLink, Zap, Link, Wand2, Shield, Monitor
} from 'lucide-react';
import { PremiumLoader } from '../ui/PremiumLoader';

// ============================================
// TYPES
// ============================================
interface EditorHeaderProps {
    templateId?: string;
    templateName?: string;
    onBack?: () => void;
    onPreview?: () => void;
    onSave?: () => Promise<void>;
    onPublish?: () => Promise<void>;
    isSyncing?: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type PublishStatus = 'draft' | 'publishing' | 'published';

// ============================================
// EDITOR HEADER COMPONENT
// ============================================
export const EditorHeader: React.FC<EditorHeaderProps> = ({
    templateId,
    templateName = 'Untitled Template',
    onBack,
    onPreview,
    onSave,
    onPublish,
    isSyncing
}) => {
    const {
        layers,
        isAnimationPlaying,
        setAnimationPlaying,
        slug,
        sanitizeAllLayers,
        sanitizeAllSectionElements,
        isSimulationMode,
        setIsSimulationMode,
        isTemplate
    } = useStore();
    const { undo, redo } = useTemporalStore();

    // ============================================
    // STATE
    // ============================================
    const [isFixing, setIsFixing] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(templateName);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [publishStatus, setPublishStatus] = useState<PublishStatus>('draft');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);

    // ============================================
    // EFFECTS
    // ============================================

    // Track unsaved changes
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [layers]);

    // Focus input when editing
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    // Sync state with prop updates (e.g. from Project Settings)
    useEffect(() => {
        setEditedName(templateName);
    }, [templateName]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleSave = useCallback(async () => {
        if (saveStatus === 'saving') return;

        setSaveStatus('saving');
        try {
            if (onSave) {
                await onSave();
            }
            setSaveStatus('saved');
            setLastSavedAt(new Date());
            setHasUnsavedChanges(false);

            // Reset to idle after showing success
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    }, [onSave, saveStatus]);

    const handlePublish = useCallback(async () => {
        if (publishStatus === 'publishing') return;

        // Save first
        await handleSave();

        setPublishStatus('publishing');
        try {
            if (onPublish) {
                await onPublish();
            }
            // Simulate publish for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPublishStatus('published');
        } catch (error) {
            setPublishStatus('draft');
        }
    }, [onPublish, publishStatus, handleSave]);

    const handlePreview = useCallback(() => {
        if (onPreview) {
            onPreview();
        } else {
            // Priority: Slug > ID > draft
            const target = slug || templateId || 'draft';
            window.open(`/preview/${target}`, '_blank');
        }
    }, [onPreview, templateId, slug]);

    const handleNameSubmit = useCallback(() => {
        setIsEditingName(false);
        // TODO: Save name via API
    }, []);

    const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSubmit();
        } else if (e.key === 'Escape') {
            setEditedName(templateName);
            setIsEditingName(false);
        }
    }, [handleNameSubmit, templateName]);

    const handleAutoFix = useCallback(() => {
        setIsFixing(true);
        sanitizeAllLayers();
        sanitizeAllSectionElements();

        // Show success briefly
        setTimeout(() => {
            setIsFixing(false);
        }, 1000);
    }, [sanitizeAllLayers, sanitizeAllSectionElements]);

    // ============================================
    // COMPUTED VALUES
    // ============================================

    const [copied, setCopied] = useState(false);

    const handleCopyLink = useCallback(() => {
        const target = slug || templateId || 'draft';
        const url = `${window.location.origin}/preview/${target}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [templateId, slug]);

    const formattedLastSaved = (() => {
        if (!lastSavedAt) return null;
        const now = new Date();
        const diffMs = now.getTime() - lastSavedAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Saved just now';
        if (diffMins < 60) return `Saved ${diffMins}m ago`;
        return `Saved ${Math.floor(diffMins / 60)}h ago`;
    })();

    const getSaveButtonContent = () => {
        switch (saveStatus) {
            case 'saving':
                return (
                    <>
                        <PremiumLoader variant="inline" color="white" />
                        <span>Saving...</span>
                    </>
                );
            case 'saved':
                return (
                    <>
                        <Check className="w-4 h-4" />
                        <span>Saved</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <X className="w-4 h-4" />
                        <span>Error</span>
                    </>
                );
            default:
                return (
                    <>
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                    </>
                );
        }
    };

    const getPublishButtonContent = () => {
        switch (publishStatus) {
            case 'publishing':
                return (
                    <>
                        <PremiumLoader variant="inline" color="white" />
                        <span>Publishing...</span>
                    </>
                );
            case 'published':
                return (
                    <>
                        <Check className="w-4 h-4" />
                        <span>Published</span>
                    </>
                );
            default:
                return (
                    <>
                        <Sparkles className="w-4 h-4" />
                        <span>Publish</span>
                    </>
                );
        }
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <header className="fixed top-0 left-0 w-full h-14 glass-panel border-b border-white/10 flex items-center justify-between px-4 z-[60]">
            {/* LEFT SECTION: Back, Logo, Name */}
            <div className="flex items-center gap-4">
                {/* Back Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>

                {/* Logo */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-premium-accent to-premium-accent/60 flex items-center justify-center font-bold text-premium-dark text-lg shadow-lg shadow-premium-accent/20">
                    T
                </div>

                {/* Template Name + Status */}
                <div className="flex flex-col">
                    {isEditingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={handleNameKeyDown}
                            className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-premium-accent w-48"
                        />
                    ) : (
                        <button
                            onClick={() => setIsEditingName(true)}
                            className="flex items-center gap-2 group"
                        >
                            <h2 className="text-sm font-bold tracking-tight group-hover:text-premium-accent transition-colors">
                                {editedName}
                            </h2>
                            <Edit2 className="w-3 h-3 text-white/20 group-hover:text-premium-accent transition-colors" />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] text-white/40">{layers.length} elements</p>
                        {isSyncing && (
                            <>
                                <span className="text-white/20">•</span>
                                <div className="flex items-center gap-1.5 animate-pulse">
                                    <PremiumLoader variant="inline" color="#bfa181" />
                                    <p className="text-[10px] text-premium-accent font-bold uppercase tracking-tighter">Syncing Cloud...</p>
                                </div>
                            </>
                        )}
                        {!isSyncing && formattedLastSaved && (
                            <>
                                <span className="text-white/20">•</span>
                                <p className="text-[10px] text-white/40">{formattedLastSaved}</p>
                            </>
                        )}
                        {hasUnsavedChanges && saveStatus === 'idle' && !isSyncing && (
                            <>
                                <span className="text-white/20">•</span>
                                <span className="text-[10px] text-yellow-500/80">Unsaved Changes</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* CENTER SECTION: History Controls */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => undo()}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => redo()}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                    title="Redo (Ctrl+Y)"
                >
                    <Redo2 className="w-4 h-4" />
                </motion.button>

                {/* Slug / Link Display (CTO Touch) */}
                <div className="h-6 px-2 flex items-center gap-2 border-l border-white/10 ml-1">
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                        {slug ? 'SLUG:' : 'ID:'}
                    </span>
                    <span className="text-[9px] font-mono text-white/40 truncate max-w-[80px]">
                        {slug || templateId || 'draft'}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.1, color: '#bfa181' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopyLink}
                        className="p-1 rounded text-white/20 transition-colors"
                        title="Copy Preview Link"
                    >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Link className="w-3 h-3" />}
                    </motion.button>
                </div>
            </div>

            {/* RIGHT SECTION: Actions */}
            <div className="flex items-center gap-2">
                {/* Auto-Fix Layout (Magic Wand) */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAutoFix}
                    className={`p-2 rounded-lg transition-colors ${isFixing ? 'bg-premium-accent text-premium-dark' : 'hover:bg-premium-accent/10 text-white/40 hover:text-premium-accent'}`}
                    title="Fix Global Scaling (Auto-Sanitize)"
                    disabled={isFixing}
                >
                    {isFixing ? <PremiumLoader variant="inline" color="white" /> : <Wand2 className="w-4 h-4" />}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePreview}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 hover:border-premium-accent/30 rounded-xl text-xs font-semibold transition-all text-white/70 hover:text-premium-accent shadow-lg shadow-black/20"
                >
                    <Play className="w-4 h-4 fill-current opacity-70" />
                    <span>Live Preview</span>
                    <ExternalLink className="w-3 h-3 opacity-30" />
                </motion.button>

                {/* Simulation Mode Toggle (Admin Only) */}
                {isTemplate && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsSimulationMode(!isSimulationMode)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isSimulationMode
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                            : 'hover:bg-white/5 text-white/40 hover:text-white border border-transparent'
                            }`}
                        title={isSimulationMode ? "Exit Simulation" : "Enter Simulation Mode (User View)"}
                    >
                        <Monitor className={`w-4 h-4 ${isSimulationMode ? 'animate-pulse' : ''}`} />
                        <span>{isSimulationMode ? 'Simulation ON' : 'Simulation'}</span>
                    </motion.button>
                )}

                {/* Simulation Toggle */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAnimationPlaying(!isAnimationPlaying)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isAnimationPlaying
                        ? 'bg-premium-accent/20 text-premium-accent border border-premium-accent/30 shadow-lg shadow-premium-accent/10'
                        : 'hover:bg-white/5 text-white/40 hover:text-white border border-transparent'
                        }`}
                    title={isAnimationPlaying ? "Stop Simulation" : "Simulate Animations"}
                >
                    <Zap className={`w-4 h-4 ${isAnimationPlaying ? 'fill-current animate-pulse' : ''}`} />
                    <span>{isAnimationPlaying ? 'Live' : 'Simulate'}</span>
                </motion.button>

                {/* Save Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border ${saveStatus === 'saved'
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : saveStatus === 'error'
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        }`}
                >
                    {getSaveButtonContent()}
                </motion.button>

                {/* Publish Button */}
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(191,161,129,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePublish}
                    disabled={publishStatus === 'publishing'}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${publishStatus === 'published'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/20'
                        : 'bg-gradient-to-r from-premium-accent to-premium-accent/80 text-premium-dark shadow-premium-accent/20'
                        }`}
                >
                    {getPublishButtonContent()}
                </motion.button>
            </div>
        </header>
    );
};
