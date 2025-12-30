import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useStore, SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES } from '@/store/useStore';
import {
    Plus, MoreVertical, Eye, EyeOff, Trash2, Copy,
    ChevronDown, ChevronRight, GripVertical, Settings,
    Layout, Layers
} from 'lucide-react';
import { OrbitSidebar } from './OrbitSidebar';

// ============================================
// SECTIONS SIDEBAR (Director's View V3)
// ============================================
export const SectionsSidebar: React.FC = () => {
    const {
        sections,
        activeSectionId,
        setActiveSection,
        addSection,
        removeSection,
        updateSection,
        duplicateSection,
        // Orbit Context
        activeCanvas,
        setActiveCanvas
    } = useStore();

    const [showAddMenu, setShowAddMenu] = useState(false);
    const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    const handleReorder = (reorderedSections: typeof sections) => {
        reorderedSections.forEach((section, index) => {
            if (section.order !== index) {
                updateSection(section.id, { order: index });
            }
        });
    };

    const startRename = (sectionId: string, currentName: string) => {
        setEditingSectionId(sectionId);
        setEditName(currentName);
    };

    const finishRename = (sectionId: string) => {
        if (editName.trim()) {
            updateSection(sectionId, { title: editName.trim() });
        }
        setEditingSectionId(null);
        setEditName('');
    };

    const handleAddSection = (type: string) => {
        const isPredefined = PREDEFINED_SECTION_TYPES.includes(type as any);
        addSection({
            key: type,
            title: isPredefined ? SECTION_LABELS[type as keyof typeof SECTION_LABELS] : 'Custom Section',
        });
        setShowAddMenu(false);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Director's View Tabs */}
            <div className="flex bg-white/5 p-1 mx-2 mt-2 rounded-lg border border-white/5 shrink-0">
                <button
                    onClick={() => setActiveCanvas('main')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md transition-all ${activeCanvas === 'main' ? 'bg-premium-accent/10 border border-premium-accent/20 text-premium-accent' : 'text-white/40 hover:text-white/60'}`}
                >
                    <Layout className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Content</span>
                </button>
                <button
                    onClick={() => setActiveCanvas('left')} // Default to left stage
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md transition-all ${activeCanvas !== 'main' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white/60'}`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Stage</span>
                </button>
            </div>

            {/* Header / Actions Area */}
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    {activeCanvas === 'main' ? 'Sections' : 'Cinematic Stages'}
                </h3>
                {activeCanvas === 'main' && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-premium-accent transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeCanvas === 'main' ? (
                    <>
                        {/* Add Section Menu (Only for Main Content) */}
                        <AnimatePresence>
                            {showAddMenu && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-b border-white/10 overflow-hidden"
                                >
                                    <div className="p-2 grid grid-cols-2 gap-1">
                                        {PREDEFINED_SECTION_TYPES.map((type) => (
                                            <motion.button
                                                key={type}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAddSection(type)}
                                                className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] bg-white/5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                            >
                                                <span>{SECTION_ICONS[type as keyof typeof SECTION_ICONS]}</span>
                                                <span>{SECTION_LABELS[type as keyof typeof SECTION_LABELS]}</span>
                                            </motion.button>
                                        ))}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAddSection('custom')}
                                            className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] bg-premium-accent/10 hover:bg-premium-accent/20 rounded text-premium-accent transition-colors col-span-2"
                                        >
                                            <span>📄</span>
                                            <span>Custom Section</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Sections List */}
                        <div className="p-2">
                            <Reorder.Group
                                axis="y"
                                values={sortedSections}
                                onReorder={handleReorder}
                                className="space-y-1"
                            >
                                {sortedSections.map((section) => (
                                    <Reorder.Item
                                        key={section.id}
                                        value={section}
                                        className="list-none"
                                        whileDrag={{
                                            scale: 1.02,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                            zIndex: 50
                                        }}
                                    >
                                        <motion.div
                                            layout
                                            onClick={() => setActiveSection(section.id)}
                                            onDoubleClick={() => startRename(section.id, section.title)}
                                            className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all ${activeSectionId === section.id
                                                ? 'bg-premium-accent/20 ring-1 ring-premium-accent/30'
                                                : 'hover:bg-white/5'
                                                }`}
                                        >
                                            {/* Drag Handle */}
                                            <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50">
                                                <GripVertical className="w-3 h-3" />
                                            </div>

                                            {/* Icon */}
                                            <span className="text-sm flex-shrink-0">
                                                {SECTION_ICONS[section.key as keyof typeof SECTION_ICONS] || SECTION_ICONS.custom}
                                            </span>

                                            {/* Title - Editable */}
                                            <div className="flex-1 min-w-0">
                                                {editingSectionId === section.id ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onBlur={() => finishRename(section.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') finishRename(section.id);
                                                            if (e.key === 'Escape') setEditingSectionId(null);
                                                        }}
                                                        autoFocus
                                                        className="w-full bg-white/10 border border-premium-accent/50 rounded px-1 py-0.5 text-xs focus:outline-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className={`text-xs font-medium truncate block ${activeSectionId === section.id ? 'text-premium-accent' : 'text-white/70'
                                                        }`}>
                                                        {section.title}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Element Count */}
                                            <span className="text-[10px] text-white/30 tabular-nums">
                                                {section.elements.length}
                                            </span>

                                            {/* Visibility Toggle */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateSection(section.id, { isVisible: !section.isVisible });
                                                }}
                                                className={`p-1 rounded transition-colors ${section.isVisible
                                                    ? 'text-white/40 hover:text-white'
                                                    : 'text-red-400/60'
                                                    }`}
                                            >
                                                {section.isVisible ? (
                                                    <Eye className="w-3 h-3" />
                                                ) : (
                                                    <EyeOff className="w-3 h-3" />
                                                )}
                                            </motion.button>

                                            {/* Menu Toggle */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedMenuId(expandedMenuId === section.id ? null : section.id);
                                                }}
                                                className={`p-1 rounded hover:bg-white/10 ${expandedMenuId === section.id ? 'text-white' : 'text-white/20'}`}
                                            >
                                                <MoreVertical className="w-3 h-3" />
                                            </motion.button>
                                        </motion.div>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                            {expandedMenuId === section.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="ml-7 my-1 p-1 bg-black/20 rounded-lg border border-white/5 space-y-0.5">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                duplicateSection(section.id);
                                                                setExpandedMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] text-white/50 hover:text-white hover:bg-white/5 rounded transition-colors"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            Duplicate Section
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (sections.length > 1) {
                                                                    removeSection(section.id);
                                                                } else {
                                                                    alert("You must have at least one section.");
                                                                }
                                                                setExpandedMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] text-red-400/50 hover:text-red-400 hover:bg-red-400/5 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete Section
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                    </>
                ) : (
                    <OrbitSidebar />
                )}
            </div>
        </div>
    );
};
