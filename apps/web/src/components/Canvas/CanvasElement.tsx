import React, { useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { AnimatedLayer } from '../Preview/AnimatedLayer';
import { Lock, Edit3 } from 'lucide-react';

// ============================================
// CANVAS ELEMENT COMPONENT
// Enterprise-grade implementation: Pure Renderer
// Centralized transformation managed by parent Section
// ============================================
interface CanvasElementProps {
    layer: Layer;
    isSelected: boolean;
    onSelect: (isMulti?: boolean) => void;
    isPanMode?: boolean;
    elementRef?: React.Ref<HTMLDivElement>;
    onDimensionsDetected?: (width: number, height: number) => void;
    onContextMenu?: (e: React.MouseEvent) => void;
    updateLayer?: (id: string, updates: Partial<Layer>) => void;
    onDrag?: (pos: { x: number; y: number }) => void;
    onResize?: (size: { width: number; height: number; x?: number; y?: number }) => void;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
    layer,
    isSelected,
    onSelect,
    isPanMode = false,
    elementRef,
    onDimensionsDetected,
    onContextMenu,
    updateLayer
}) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const editableRef = useRef<HTMLDivElement>(null);
    const flipX = layer.flipHorizontal ? -1 : 1;
    const flipY = layer.flipVertical ? -1 : 1;

    // Transform value based on store state
    const transformValue = `rotate(${layer.rotation || 0}deg) scale(${flipX * (layer.scale || 1)}, ${flipY * (layer.scale || 1)})`;

    // CTO FIX: Auto-focus editable div when entering edit mode
    useEffect(() => {
        if (isEditing && editableRef.current) {
            editableRef.current.focus();
            // Select all text for easy replacement
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editableRef.current);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (layer.type === 'text' && !layer.isLocked) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        if (!isEditing) return;
        setIsEditing(false);
        const newContent = editableRef.current?.innerText || '';
        if (newContent !== layer.content) {
            updateLayer?.(layer.id, { content: newContent });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            // Restore original content
            if (editableRef.current) {
                editableRef.current.innerText = layer.content || '';
            }
        }
    };

    return (
        <div
            ref={elementRef}
            className={`canvas-element group outline-none ${isSelected ? 'ring-1 ring-premium-accent' : ''}`}
            data-element-id={layer.id}
            style={{
                position: 'absolute',
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                transform: transformValue,
                transformOrigin: 'center center',
                opacity: layer.opacity ?? 1,
                zIndex: layer.zIndex,
                cursor: isPanMode ? 'grab' : (layer.isLocked ? 'not-allowed' : 'grab'),
                touchAction: 'none',
                userSelect: isEditing ? 'text' : 'none',
            }}
            onMouseDown={(e) => {
                if (isEditing) return; // Don't interfere with text selection
                e.stopPropagation();
                if (layer.isLocked || isPanMode) return;
                const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
                onSelect(isMulti);
            }}
            onDoubleClick={handleDoubleClick}
            onContextMenu={onContextMenu}
        >
            {/* Element Content */}
            {/* CTO ENTERPRISE: Inline edit mode for text elements */}
            {isEditing && layer.type === 'text' ? (
                <div
                    ref={editableRef}
                    className="w-full h-full flex items-center justify-center outline-none cursor-text"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        fontFamily: layer.textStyle?.fontFamily || 'Outfit',
                        fontSize: `${layer.textStyle?.fontSize || 24}px`,
                        fontWeight: layer.textStyle?.fontWeight || 'normal',
                        fontStyle: layer.textStyle?.fontStyle || 'normal',
                        textAlign: layer.textStyle?.textAlign || 'center',
                        color: layer.textStyle?.color || '#ffffff',
                        lineHeight: layer.textStyle?.lineHeight || 1.2,
                        letterSpacing: layer.textStyle?.letterSpacing || 0,
                        whiteSpace: layer.textStyle?.multiline ? 'pre-wrap' : 'nowrap',
                        overflow: 'visible',
                        background: 'rgba(191, 161, 129, 0.1)',
                        border: '1px dashed rgba(191, 161, 129, 0.5)',
                        borderRadius: '4px',
                    }}
                    dangerouslySetInnerHTML={{ __html: layer.content || 'Text' }}
                />
            ) : (
                <div
                    className={`w-full h-full ${layer.type === 'text' || layer.motionPathConfig?.enabled
                        ? 'overflow-visible'
                        : 'overflow-hidden'
                        }`}
                >
                    <AnimatedLayer
                        layer={layer}
                        adjustedY={layer.y}
                        isOpened={false}
                        isEditor={true}
                        onDimensionsDetected={onDimensionsDetected}
                    />
                </div>
            )}

            {/* Lock indicator */}
            <AnimatePresence>
                {isSelected && layer.isLocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500/80 px-2 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-1 pointer-events-none shadow-premium-gold z-50"
                    >
                        <Lock className="w-3 h-3" />
                        Locked
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover state */}
            {!isSelected && !isPanMode && (
                <div className="absolute inset-0 bg-premium-accent/0 group-hover:bg-premium-accent/5 transition-colors pointer-events-none rounded" />
            )}
        </div>
    );
};
