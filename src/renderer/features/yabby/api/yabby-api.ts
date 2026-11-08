import { queryOptions } from '@tanstack/react-query';
import isElectron from 'is-electron';

import { YabbyResult, YabbySticker } from '/@/shared/types/yabby';

const yabby = isElectron() ? window.api.yabby : null;

const STALE_MS = 5 * 60 * 1000;

function unwrap<T>(result: YabbyResult<T>): T {
    if (!result.ok) throw new Error(result.error);
    return result.data;
}

export const yabbyKeys = {
    album: (albumId: string) => ['yabby', 'stickers', 'album', albumId] as const,
    all: ['yabby'] as const,
    config: ['yabby', 'config'] as const,
    recent: (limit: number) => ['yabby', 'stickers', 'recent', limit] as const,
};

export const yabbyQueries = {
    albumStickers: (albumId: string, enabled: boolean) =>
        queryOptions({
            enabled: Boolean(yabby) && enabled && Boolean(albumId),
            queryFn: async (): Promise<YabbySticker[]> =>
                unwrap(await yabby!.stickersByAlbums([albumId])),
            queryKey: yabbyKeys.album(albumId),
            retry: false,
            staleTime: STALE_MS,
        }),
    config: () =>
        queryOptions({
            enabled: Boolean(yabby),
            queryFn: () => yabby!.getConfig(),
            queryKey: yabbyKeys.config,
            staleTime: Infinity,
        }),
    recentStickers: (limit: number, enabled: boolean) =>
        queryOptions({
            enabled: Boolean(yabby) && enabled,
            queryFn: async (): Promise<YabbySticker[]> =>
                unwrap(await yabby!.recentStickers(limit)),
            queryKey: yabbyKeys.recent(limit),
            retry: false,
            staleTime: STALE_MS,
        }),
};

export const yabbyApi = yabby;
