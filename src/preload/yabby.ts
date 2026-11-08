import { ipcRenderer } from 'electron';

import type { YabbyConfig, YabbyResult, YabbySticker } from '../shared/types/yabby';

const getConfig = (): Promise<YabbyConfig> => ipcRenderer.invoke('yabby-get-config');

const setSite = (url: string): Promise<YabbyResult<YabbyConfig>> =>
    ipcRenderer.invoke('yabby-set-site', url);

const setToken = (token: null | string): Promise<YabbyResult<YabbyConfig>> =>
    ipcRenderer.invoke('yabby-set-token', token);

const stickersByAlbums = (albumIds: string[]): Promise<YabbyResult<YabbySticker[]>> =>
    ipcRenderer.invoke('yabby-stickers-by-albums', albumIds);

const recentStickers = (limit: number): Promise<YabbyResult<YabbySticker[]>> =>
    ipcRenderer.invoke('yabby-stickers-recent', limit);

export const yabby = {
    getConfig,
    recentStickers,
    setSite,
    setToken,
    stickersByAlbums,
};
