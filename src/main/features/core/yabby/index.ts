import { app, ipcMain, safeStorage } from 'electron';
import { readFileSync } from 'fs';
import { join } from 'path';

import { store } from '/@/main/features/core/settings';
import log from '/@/main/logger';
import {
    YABBY_COVER_SIZE,
    YABBY_DEFAULT_SITE_URL,
    YABBY_MAX_ALBUMS_PER_QUERY,
    YabbyConfig,
    YabbyDevServer,
    YabbyResult,
    YabbySticker,
    YabbyStickerPosition,
} from '/@/shared/types/yabby';

// The Yabbyville token lives only in the main process, encrypted with the OS
// keychain. The renderer can set or clear it but never reads it back.

const SITE_KEY = 'yabby_site_url';
const TOKEN_KEY = 'yabby_token';
const TOKEN_RE = /^yv_[A-Za-z0-9]{16}_[A-Za-z0-9_-]{43}$/;
const STICKER_PATH_RE = /^\/Stickers\/[A-Za-z0-9._-]{1,150}$/;
const TIMEOUT_MS = 10_000;

const siteUrl = (): string => (store.get(SITE_KEY) as string | undefined) || YABBY_DEFAULT_SITE_URL;

type WireDoc = { data: Record<string, unknown>; id: string };

function getConfig(): YabbyConfig {
    const site = siteUrl();
    return { apiUrl: `${site}/api/data`, hasToken: Boolean(store.get(TOKEN_KEY)), siteUrl: site };
}

function readToken(): null | string {
    const encrypted = store.get(TOKEN_KEY) as string | undefined;
    if (!encrypted || !safeStorage.isEncryptionAvailable()) return null;
    try {
        return safeStorage.decryptString(Buffer.from(encrypted, 'hex'));
    } catch (error) {
        log.warn('Yabby token could not be decrypted', error);
        return null;
    }
}

function validSiteUrl(value: string): null | string {
    try {
        const url = new URL(value);
        const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null;
        return url.origin;
    } catch {
        return null;
    }
}

const asString = (value: unknown): null | string => (typeof value === 'string' ? value : null);

const asCoord = (value: unknown): null | number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= YABBY_COVER_SIZE
        ? value
        : null;

function asPosition(value: unknown): null | YabbyStickerPosition {
    const p = value as null | undefined | { x?: unknown; y?: unknown };
    const x = asCoord(p?.x);
    const y = asCoord(p?.y);
    return x === null || y === null ? null : { x, y };
}

async function fetchStickers(query: string): Promise<YabbyResult<YabbySticker[]>> {
    const token = readToken();
    if (!token) return { error: 'No Yabbyville token set.', ok: false, status: 401 };
    const site = siteUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(`${site}/api/data/stickers?${query}&names=1`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as null | {
            docs?: WireDoc[];
            error?: string;
            names?: Record<string, string>;
        };
        if (!response.ok) {
            return {
                error: typeof body?.error === 'string' ? body.error : `HTTP ${response.status}`,
                ok: false,
                status: response.status,
            };
        }
        const names = body?.names ?? {};
        const stickers = (body?.docs ?? [])
            .map((doc) => toSticker(doc, names, site))
            .filter((s): s is YabbySticker => s !== null);
        return { data: stickers, ok: true };
    } catch (error) {
        log.warn('Yabby sticker request failed', { message: (error as Error).message });
        return { error: "Couldn't reach Yabbyville.", ok: false, status: 0 };
    } finally {
        clearTimeout(timer);
    }
}

function toSticker(doc: WireDoc, names: Record<string, string>, site: string): null | YabbySticker {
    const d = doc.data;
    const albumId = asString(d.albumId);
    const image = asString(d.sticker);
    const userId = asString(d.userId);
    if (!albumId || !image || !userId || !STICKER_PATH_RE.test(image)) return null;
    const ts = d.timestamp as undefined | { ms?: unknown };
    return {
        albumArtist: asString(d.albumArtist),
        albumId,
        albumName: asString(d.albumName),
        id: doc.id,
        imageUrl: `${site}${image}`,
        position: asPosition(d.position),
        text: asString(d.text) ?? '',
        timestamp: typeof ts?.ms === 'number' ? ts.ms : 0,
        userId,
        username: typeof names[userId] === 'string' ? names[userId] : null,
    };
}

ipcMain.handle('yabby-get-config', (): YabbyConfig => getConfig());

ipcMain.handle('yabby-set-site', (_event, value: string): YabbyResult<YabbyConfig> => {
    const origin = typeof value === 'string' ? validSiteUrl(value.trim()) : null;
    if (!origin) return { error: 'Use an https:// address.', ok: false, status: 400 };
    store.set(SITE_KEY, origin);
    return { data: getConfig(), ok: true };
});

ipcMain.handle('yabby-set-token', (_event, value: null | string): YabbyResult<YabbyConfig> => {
    if (value === null) {
        store.delete(TOKEN_KEY);
        return { data: getConfig(), ok: true };
    }
    const token = typeof value === 'string' ? value.trim() : '';
    if (!TOKEN_RE.test(token)) {
        return { error: "That doesn't look like a Yeishin token.", ok: false, status: 400 };
    }
    if (!safeStorage.isEncryptionAvailable()) {
        return {
            error: 'This system has no secure storage for the token.',
            ok: false,
            status: 500,
        };
    }
    store.set(TOKEN_KEY, safeStorage.encryptString(token).toString('hex'));
    return { data: getConfig(), ok: true };
});

ipcMain.handle('yabby-stickers-by-albums', (_event, albumIds: string[]) => {
    const ids = Array.isArray(albumIds)
        ? [
              ...new Set(
                  albumIds.filter(
                      (id) => typeof id === 'string' && id.length > 0 && id.length <= 100,
                  ),
              ),
          ]
        : [];
    if (ids.length === 0 || ids.length > YABBY_MAX_ALBUMS_PER_QUERY) {
        return { error: 'Bad album list.', ok: false, status: 400 };
    }
    return fetchStickers(`albums=${ids.map(encodeURIComponent).join(',')}`);
});

ipcMain.handle('yabby-stickers-recent', (_event, limit: number) => {
    const n = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 500) : 100;
    return fetchStickers(`order=recent&limit=${n}`);
});

// Dev only: `.env.local` in the project root (see `.env.example`) can sign in to
// the music server and set the Yabbyville token, so a `pnpm dev` profile needs
// no setup. Read at runtime by the unpackaged app only, so release builds never
// see it. Vite env vars are not used because the renderer bundle inlines them.
function readDevEnv(): Record<string, string> {
    if (app.isPackaged) return {};
    try {
        const text = readFileSync(join(app.getAppPath(), '.env.local'), 'utf8');
        const env: Record<string, string> = {};
        for (const line of text.split(/\r?\n/)) {
            const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
            if (match) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
        }
        return env;
    } catch {
        return {};
    }
}

const devEnv = readDevEnv();

ipcMain.handle('yabby-dev-server', (): null | YabbyDevServer => {
    const { YEISHIN_PASSWORD, YEISHIN_SERVER_URL, YEISHIN_USERNAME } = devEnv;
    if (!YEISHIN_SERVER_URL || !YEISHIN_USERNAME || !YEISHIN_PASSWORD) return null;
    return {
        name: devEnv.YEISHIN_SERVER_NAME || 'Navidrome',
        password: YEISHIN_PASSWORD,
        type: devEnv.YEISHIN_SERVER_TYPE || 'navidrome',
        url: YEISHIN_SERVER_URL,
        username: YEISHIN_USERNAME,
    };
});

app.whenReady().then(() => {
    const token = devEnv.YEISHIN_YABBY_TOKEN;
    if (!token || store.get(TOKEN_KEY)) return;
    if (!TOKEN_RE.test(token) || !safeStorage.isEncryptionAvailable()) {
        log.warn('Dev Yabbyville token from .env.local ignored (bad format or no secure storage)');
        return;
    }
    store.set(TOKEN_KEY, safeStorage.encryptString(token).toString('hex'));
    log.info('Dev Yabbyville token set from .env.local');
});
