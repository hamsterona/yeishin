export interface YabbyConfig {
    apiUrl: string;
    hasToken: boolean;
    siteUrl: string;
}

export type YabbyResult<T> = { data: T; ok: true } | { error: string; ok: false; status: number };

export interface YabbySticker {
    albumArtist: null | string;
    albumId: string;
    albumName: null | string;
    id: string;
    /** Absolute https URL of the sticker image on the Yabbyville site. */
    imageUrl: string;
    text: string;
    timestamp: number;
    userId: string;
    username: null | string;
}

export const YABBY_DEFAULT_SITE_URL = 'https://yabbyville.xyz';
export const YABBY_MAX_ALBUMS_PER_QUERY = 30;
