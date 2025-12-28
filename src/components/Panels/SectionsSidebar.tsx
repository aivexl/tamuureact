import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useStore, SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES } from '@/store/useStore';
import {
    Plus, MoreVertical, Eye, EyeOff, Trash2, Copy,
    ChevronDown, ChevronRight, GripVertical, Settings
} from 'lucide-react';

// ============================================
// SECTIONS SIDEBAR
// ============================================
export const SectionsSidebar: React.FC = () => {
    const {
        sections,
        activeSectionId,
        setActiveSection,
        addSection,
        removeSection,
        updateSection,
        duplicateSection
    } = useStore();

    const [showAddMenu, setShowAddMenu] = useState(false);
    const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    const handleReorder = (reorderedSections: typeof sections) => {
        // Update order property based on new positions
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
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Sections
                </h3>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-premium-accent transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                </motion.button>
            </div>

            {/* Add Section Menu */}
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
                                    <span>{SECTION_ICONS[type]}</span>
                                    <span>{SECTION_LABELS[type]}</span>
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
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
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

                                {/* More Menu */}
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedMenuId(expandedMenuId === section.id ? null : section.id);
                                        }}
                                        className="p-1 text-white/30 hover:text-white rounded transition-colors"
                                    >
                                        <MoreVertical className="w-3 h-3" />
                                    </motion.button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {expandedMenuId === section.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-xl py-1 min-w-[120px]"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateSection(section.id);
                                                        setExpandedMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                    Duplicate
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeSection(section.id);
                                                        setExpandedMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                                                    disabled={sections.length <= 1}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            {/* Footer Info */}
            <div className="px-4 py-2 border-t border-white/10">
                <p className="text-[10px] text-white/30 text-center">
                    {sections.length} sections • Drag to reorder
                </p>
            </div>
        </div>
    );
};
