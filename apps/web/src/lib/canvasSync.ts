/**
 * Canvas Sync Utilities
 * 
 * Reusable helpers that sync panel data → canvas elements.
 * Used by LocationPanel, GiftPanel, EventDatePanel, and any future panel
 * that needs to push changes into the section/element tree.
 * 
 * Pattern: Each function takes the current sections array and returns
 * a new sections array with the relevant elements updated.
 * The caller is responsible for calling `updateSectionsBatch(result)`.
 */

import type { Section } from '@/store/sectionsSlice';

// ─── Type helpers ────────────────────────────────────────────────────
type ElementMatcher = (el: any) => boolean;
type ElementUpdater = (el: any) => any;

/**
 * Generic element updater.
 * Scans all sections and applies `updater` to elements matching `matcher`.
 */
export function syncElements(
    sections: Section[],
    matcher: ElementMatcher,
    updater: ElementUpdater
): Section[] {
    return sections.map(section => ({
        ...section,
        elements: (section.elements || []).map(el =>
            matcher(el) ? updater(el) : el
        )
    }));
}

// ─── Location Sync ───────────────────────────────────────────────────

/**
 * Sync location data to all maps_point elements in the canvas.
 */
export function syncLocationToCanvas(
    sections: Section[],
    data: { venueName?: string; address?: string; googleMapsUrl?: string }
): Section[] {
    return syncElements(
        sections,
        (el) => el.type === 'maps_point' || el.name?.toLowerCase().includes('maps'),
        (el) => ({
            ...el,
            mapsConfig: {
                ...el.mapsConfig,
                ...(data.googleMapsUrl && { url: data.googleMapsUrl }),
                ...(data.venueName && { label: data.venueName }),
                ...(data.address && { address: data.address }),
            }
        })
    );
}

// ─── Bank Card Sync ──────────────────────────────────────────────────

interface BankSyncData {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    emoneyType?: string;
    emoneyNumber?: string;
    giftRecipient?: string;
    giftAddress?: string;
}

/**
 * Sync gift/bank data to all bank_card elements in the canvas.
 */
export function syncBankCardToCanvas(
    sections: Section[],
    data: BankSyncData
): Section[] {
    return syncElements(
        sections,
        (el) => el.type === 'bank_card' || el.name?.toLowerCase().includes('bank'),
        (el) => ({
            ...el,
            bankCardConfig: {
                ...el.bankCardConfig,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountHolder: data.accountHolder,
            }
        })
    );
}

/**
 * Sync gift address data to gift_address elements in the canvas.
 */
export function syncGiftAddressToCanvas(
    sections: Section[],
    data: { recipientName: string; address: string }
): Section[] {
    return syncElements(
        sections,
        (el) => el.type === 'gift_address' || el.name?.toLowerCase().includes('gift_address'),
        (el) => ({
            ...el,
            giftAddressConfig: {
                ...el.giftAddressConfig,
                recipientName: data.recipientName,
                address: data.address,
            }
        })
    );
}

// ─── Countdown Sync ──────────────────────────────────────────────────

/**
 * Sync target date to all countdown elements in the canvas.
 */
export function syncCountdownToCanvas(
    sections: Section[],
    targetDate: string
): Section[] {
    return syncElements(
        sections,
        (el) => el.type === 'countdown' || el.name?.toLowerCase().includes('countdown'),
        (el) => ({
            ...el,
            countdownConfig: {
                ...el.countdownConfig,
                targetDate,
            }
        })
    );
}
