export interface YabbyConfig {
    apiUrl: string;
    hasToken: boolean;
    siteUrl: string;
}

/** Dev-only music server login from `.env.local` (unpackaged app only). */
export interface YabbyDevServer {
    name: string;
    password: string;
    type: string;
    url: string;
    username: string;
}

export type YabbyResult<T> = { data: T; ok: true } | { error: string; ok: false; status: number };

export interface YabbySticker {
    albumArtist: null | string;
    albumId: string;
    albumName: null | string;
    id: string;
    /** Absolute https URL of the sticker image on the Yabbyville site. */
    imageUrl: string;
    /** Centre of the sticker on a 300 x 300 cover, as placed on the site. */
    position: null | YabbyStickerPosition;
    text: string;
    timestamp: number;
    userId: string;
    username: null | string;
}

export interface YabbyStickerPosition {
    x: number;
    y: number;
}

/** The site draws covers 300 wide and stickers 100 wide, centred on `position`. */
export const YABBY_COVER_SIZE = 300;
export const YABBY_STICKER_SIZE = 100;

export const YABBY_DEFAULT_SITE_URL = 'https://yabbyville.xyz';
export const YABBY_MAX_ALBUMS_PER_QUERY = 30;
