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
        const type = element.type || '';
        const nameStr = (element.name || '').toLowerCase();
        const isCriticalType = 
            type === 'profile_card' || nameStr.includes('profil') ||
            type === 'gift_address' || nameStr.includes('kado') || nameStr.includes('gift') || nameStr.includes('rekening') ||
            type === 'digital_gift' ||
            type === 'rsvp_wishes' || nameStr.includes('rsvp') || nameStr.includes('ucapan') ||
            type === 'rsvp_form' ||
            type === 'guest_wishes' ||
            type === 'photo_frame' ||
            type === 'countdown' || nameStr.includes('countdown') ||
            type === 'love_story' || nameStr.includes('kisah') || nameStr.includes('story') ||
            type === 'quote' || nameStr.includes('quote') || nameStr.includes('kutipan') ||
            type === 'photo_grid' || nameStr.includes('galeri') || nameStr.includes('gallery') ||
            type === 'live_streaming' || nameStr.includes('live') ||
            type === 'maps_point' || nameStr.includes('lokasi') || nameStr.includes('map') ||
            type === 'social_mockup' ||
            type === 'video';
        // 1. If NO permissions object exists (Legacy or Newly Added)
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

        // 2. If permissions object EXISTS, we trust it but forcefully unlock critical types 
        // to prevent legacy templates from locking users out of essential configuration.
        return {
            canEditText: isCriticalType || p.canEditText || p.canEditContent || false,
            canEditImage: p.canEditImage || false,
            canEditStyle: p.canEditStyle || false,
            canEditPosition: p.canEditPosition || false,
            canDelete: p.canDelete || false,
            isVisibleInUserEditor: isCriticalType || p.isVisibleInUserEditor || false,
            isContentProtected: p.isContentProtected || false,
            canEditContent: isCriticalType || p.canEditContent || p.canEditText || false,
            ...p,
            // Explicitly force these to true if it's a critical type, overwriting anything in ...p
            ...(isCriticalType ? {
                canEditText: true,
                canEditContent: true,
                isVisibleInUserEditor: true
            } : {})
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

    // CTO RESOLUTION: Smart Component Routing for Legacy Templates
    // Even if type is 'text', if name is 'countdown', we MUST render the CountdownCard.
    let resolvedType = element.type;
    const nameStr = (element.name || '').toLowerCase();
    
    if (resolvedType !== 'countdown' && nameStr.includes('countdown')) resolvedType = 'countdown';
    else if (resolvedType !== 'love_story' && (nameStr.includes('kisah') || nameStr.includes('story'))) resolvedType = 'love_story';
    else if (resolvedType !== 'quote' && (nameStr.includes('quote') || nameStr.includes('kutipan'))) resolvedType = 'quote';
    else if (resolvedType !== 'photo_grid' && (nameStr.includes('galeri') || nameStr.includes('gallery'))) resolvedType = 'photo_grid';
    else if (resolvedType !== 'maps_point' && (nameStr.includes('lokasi') || nameStr.includes('map'))) resolvedType = 'maps_point';
    else if (resolvedType !== 'live_streaming' && nameStr.includes('live')) resolvedType = 'live_streaming';
    else if (resolvedType !== 'gift_address' && (nameStr.includes('kado') || nameStr.includes('gift') || nameStr.includes('rekening'))) resolvedType = 'gift_address';
    else if (resolvedType !== 'profile_card' && nameStr.includes('profil')) resolvedType = 'profile_card';
    else if (resolvedType !== 'rsvp_wishes' && (nameStr.includes('rsvp') || nameStr.includes('ucapan'))) resolvedType = 'rsvp_wishes';

    const CardComponent = ElementRegistry[resolvedType] || ElementRegistry['text'];
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
