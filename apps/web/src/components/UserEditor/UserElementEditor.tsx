import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore, Layer } from '@/store/useStore';
import { ElementRegistry, BaseCardWrapper } from './ElementCards';

interface UserElementEditorProps {
    element: Layer;
    sectionId: string;
}

export const UserElementEditor: React.FC<UserElementEditorProps> = ({ element, sectionId }) => {
    const { updateElementInSection, updateLayer, sections, updateSectionsBatch } = useStore();
    const { id: invitationId } = useParams<{ id: string }>();

    const permissions = {
        canEditText: (element as any).canEditText || (element as any).canEditContent || element.permissions?.canEditText || element.permissions?.canEditContent || false,
        canEditImage: (element as any).canEditImage || element.permissions?.canEditImage || false,
        canEditStyle: (element as any).canEditStyle || element.permissions?.canEditStyle || false,
        canEditPosition: (element as any).canEditPosition || element.permissions?.canEditPosition || false,
        canDelete: element.permissions?.canDelete || false,
        isVisibleInUserEditor: (element as any).isVisibleInUserEditor || element.permissions?.isVisibleInUserEditor || false,
        isContentProtected: element.permissions?.isContentProtected || false,
        canEditContent: (element as any).canEditContent || element.permissions?.canEditContent || false,
        ...(element.permissions || {}) // Allow other granular permissions
    };

    const isProtected = permissions.isContentProtected === true;

    const handleUpdate = (updates: Partial<Layer>) => {
        if (!sectionId) return;

        if (sectionId === 'global') {
            updateLayer(element.id, updates);
        } else {
            updateElementInSection(sectionId, element.id, updates);
        }

        if (updates.countdownConfig?.targetDate) {
            const newDate = updates.countdownConfig.targetDate;
            const updatedSections = sections.map(s => ({
                ...s,
                elements: s.elements.map(el => {
                    const isCountdown = el.type === 'countdown' || el.name?.toLowerCase().includes('countdown');
                    if (isCountdown && el.countdownConfig) {
                        return { ...el, countdownConfig: { ...el.countdownConfig, targetDate: newDate } };
                    }
                    return el;
                })
            }));
            updateSectionsBatch(updatedSections);
            if (invitationId) {
                import('@/lib/api').then(({ invitations }) => {
                    invitations.update(invitationId, { event_date: newDate }).catch(err => {
                        console.error('[Sync] Failed to update global event date:', err);
                    });
                });
            }
        }

        if (updates.loveStoryConfig?.events && invitationId) {
            const newEvents = updates.loveStoryConfig.events;
            import('@/lib/api').then(({ invitations }) => {
                invitations.update(invitationId, { love_story: JSON.stringify(newEvents) }).catch(err => {
                    console.error('[Sync] Failed to update global love story:', err);
                });
            });
        }
    };

    // Element is visible if specifically set to visible OR has any active edit permission
    // CTO: Smart Permission Engine. Only show if explicitly authorized OR has active edit rights.
    const isVisible = (() => {
        const p = element.permissions;
        
        // Legacy Critical Type Fallback
        const isCriticalType = 
            element.type === 'profile_card' || 
            element.type === 'countdown' || 
            element.type === 'maps_point' || 
            element.type === 'rsvp_form' ||
            element.type === 'rsvp_wishes' ||
            element.type === 'digital_gift' ||
            element.type === 'gift_address' ||
            element.type === 'love_story' ||
            element.type === 'profile_photo';

        // 1. Explicit UI Visibility Flag
        if (p?.isVisibleInUserEditor === true || (element as any).isVisibleInUserEditor === true) return true;

        // 2. SMART CHECK: Show if ANY edit permission is true
        if (p?.canEditText || (element as any).canEditText || 
            p?.canEditImage || (element as any).canEditImage || 
            p?.canEditStyle || (element as any).canEditStyle || 
            p?.canEditContent || (element as any).canEditContent ||
            p?.canEditPosition || (element as any).canEditPosition) return true;

        // 3. Fallback for legacy elements
        if (!p) {
            return isCriticalType || (element as any).canEditContent === true;
        }

        // 4. If permissions exist but everything is false/undefined, we still show critical types
        // UNLESS they were explicitly toggled off
        if (isCriticalType && p.isVisibleInUserEditor !== false) {
            return true;
        }

        return false;
    })();

    if (!isVisible) return null;

    const CardComponent = ElementRegistry[element.type] || ElementRegistry['text'];
    if (!CardComponent) return null;

    return (
        <BaseCardWrapper element={element} permissions={permissions} isProtected={isProtected}>
            <CardComponent 
                element={element} 
                sectionId={sectionId} 
                handleUpdate={handleUpdate} 
                permissions={permissions} 
                isProtected={isProtected} 
            />
        </BaseCardWrapper>
    );
};
