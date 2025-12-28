import { useEffect } from 'react';
import { useStore, useTemporalStore } from '@/store/useStore';

/**
 * Custom hook for keyboard shortcuts in the editor
 * - Delete/Backspace: Remove selected element
 * - Ctrl/Cmd + D: Duplicate selected element  
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Y: Redo
 * - Escape: Deselect element
 * - Arrow keys: Nudge selected element
 */
export const useKeyboardShortcuts = () => {
    const {
        selectedLayerId,
        selectLayer,
        removeLayer,
        duplicateLayer,
        updateLayer,
        layers,
        activeSectionId,
        sections,
        removeElementFromSection,
        updateElementInSection,
        addElementToSection
    } = useStore();

    const { undo, redo } = useTemporalStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            // Find selected element in active section or global layers
            const activeSection = sections.find(s => s.id === activeSectionId);
            const sectionLayer = activeSection?.elements.find(l => l.id === selectedLayerId);
            const globalLayer = layers.find(l => l.id === selectedLayerId);
            const targetLayer = sectionLayer || globalLayer;

            // Delete selected element
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
                e.preventDefault();
                if (sectionLayer && activeSectionId) {
                    removeElementFromSection(activeSectionId, selectedLayerId);
                    selectLayer(null);
                } else if (globalLayer) {
                    removeLayer(selectedLayerId);
                    selectLayer(null);
                }
            }

            // Duplicate element (Ctrl/Cmd + D)
            if (cmdOrCtrl && e.key === 'd' && selectedLayerId && targetLayer) {
                e.preventDefault();
                if (sectionLayer && activeSectionId) {
                    const newLayer = {
                        ...sectionLayer,
                        id: `layer-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                        name: `${sectionLayer.name} (Copy)`,
                        x: sectionLayer.x + 20,
                        y: sectionLayer.y + 20
                    };
                    addElementToSection(activeSectionId, newLayer);
                    selectLayer(newLayer.id);
                } else {
                    duplicateLayer(selectedLayerId);
                }
            }

            // Undo (Ctrl/Cmd + Z)
            if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }

            // Redo (Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z)
            if (cmdOrCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }

            // Escape to deselect
            if (e.key === 'Escape') {
                e.preventDefault();
                selectLayer(null);
            }

            // Arrow keys to nudge element
            if (selectedLayerId && targetLayer && !targetLayer.isLocked && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();

                const nudge = e.shiftKey ? 10 : 1;
                const updates: any = {};

                switch (e.key) {
                    case 'ArrowUp':
                        updates.y = targetLayer.y - nudge;
                        break;
                    case 'ArrowDown':
                        updates.y = targetLayer.y + nudge;
                        break;
                    case 'ArrowLeft':
                        updates.x = targetLayer.x - nudge;
                        break;
                    case 'ArrowRight':
                        updates.x = targetLayer.x + nudge;
                        break;
                }

                if (sectionLayer && activeSectionId) {
                    updateElementInSection(activeSectionId, selectedLayerId, updates);
                } else {
                    updateLayer(selectedLayerId, updates);
                }
            }

            // Copy (Ctrl/Cmd + C)
            if (cmdOrCtrl && e.key === 'c' && targetLayer) {
                e.preventDefault();
                useStore.getState().copyLayer(targetLayer);
                console.log('Copied:', targetLayer.name);
            }

            // Paste (Ctrl/Cmd + V)
            if (cmdOrCtrl && e.key === 'v') {
                const clipboard = useStore.getState().clipboard;
                if (clipboard && activeSectionId) {
                    e.preventDefault();

                    const newLayer = {
                        ...clipboard,
                        id: `layer-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                        name: `${clipboard.name} (Copy)`,
                        x: clipboard.x + 20,
                        y: clipboard.y + 20
                    };

                    addElementToSection(activeSectionId, newLayer);
                    selectLayer(newLayer.id);
                    console.log('Pasted:', newLayer.name);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLayerId, selectLayer, removeLayer, duplicateLayer, undo, redo, updateLayer, layers, activeSectionId, sections, removeElementFromSection, updateElementInSection, addElementToSection]);
};
