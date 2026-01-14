/**
 * TanStack Query Hooks - Music
 * Enterprise-level data fetching for music library
 */

import { useQuery } from '@tanstack/react-query';
import { music } from '@/lib/api';
import { queryKeys, STALE_TIMES } from '@/lib/queryClient';

// ============================================
// TYPES
// ============================================

export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    category: string;
    thumbnail?: string;
    source_type?: 'internal' | 'gdrive';
}

// ============================================
// MUSIC QUERIES
// ============================================

/**
 * Fetch music library
 * Used by: MusicDrawer, AssetSelectionModal
 */
export function useMusicLibrary() {
    return useQuery<Song[]>({
        queryKey: queryKeys.music.library(),
        queryFn: () => music.list(),
        staleTime: STALE_TIMES.music, // 30 minutes - music library rarely changes
    });
}
