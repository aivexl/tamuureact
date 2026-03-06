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

    // CTO MEGA RESOLUTION: Unified Permission Matrix
    const permissions = (() => {
        const p = element.permissions;
        
        // Check if this is a "User-Data" element that REQUIRES editing by design
        const isCriticalType = 
            element.type === 'profile_card' || 
            element.type === 'gift_address' || 
            element.type === 'digital_gift' ||
            element.type === 'rsvp_wishes' ||
            element.type === 'rsvp_form' ||
            element.type === 'guest_wishes' ||
            element.type === 'photo_frame';

        // 1. If NO permissions object exists (Legacy or Newly Added), 
        // we grant "Smart Defaults" for critical types to ensure zero-friction UX.
        if (!p) {
            return {
                canEditText: isCriticalType || (element as any).canEditText || (element as any).canEditContent || false,
                canEditImage: (element as any).canEditImage || false,
                canEditStyle: (element as any).canEditStyle || false,
                canEditPosition: (element as any).canEditPosition || false,
                canDelete: false,
                isVisibleInUserEditor: isCriticalType || (element as any).isVisibleInUserEditor || false,
                isContentProtected: false,
                canEditContent: isCriticalType || (element as any).canEditContent || false
            };
        }

        // 2. If permissions object EXISTS, we trust it but still provide fallbacks for key aliases
        return {
            canEditText: p.canEditText || p.canEditContent || false,
            canEditImage: p.canEditImage || false,
            canEditStyle: p.canEditStyle || false,
            canEditPosition: p.canEditPosition || false,
            canDelete: p.canDelete || false,
            isVisibleInUserEditor: p.isVisibleInUserEditor || false,
            isContentProtected: p.isContentProtected || false,
            canEditContent: p.canEditContent || p.canEditText || false,
            ...p
        };
    })();

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

    // CTO SMART VISIBILITY: Element is visible ONLY IF it has an explicit visibility flag 
    // OR at least one edit permission is granted. This satisfies the "Don't show if no permissions" request.
    const isVisible = 
        permissions.isVisibleInUserEditor || 
        permissions.canEditText || 
        permissions.canEditImage || 
        permissions.canEditStyle || 
        permissions.canEditContent || 
        permissions.canEditPosition;

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
