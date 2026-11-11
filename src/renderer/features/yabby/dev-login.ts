import { nanoid } from 'nanoid/non-secure';

import { api } from '/@/renderer/api';
import { useAuthStore } from '/@/renderer/store/auth.store';
import { logger } from '/@/renderer/utils/logger';
import { normalizeServerUrl } from '/@/renderer/utils/normalize-server-url';
import { ServerListItemWithCredential } from '/@/shared/types/domain-types';
import { ServerType, toServerType } from '/@/shared/types/types';

// Dev only (`pnpm dev`): sign in to the music server from `.env.local`, so a
// fresh dev profile, or a second worktree whose dev server lands on another
// port (and so gets its own empty storage), skips the add-server form. The main
// process reads the file only when unpackaged; see `.env.example`.

async function devLogin() {
    const dev = await window.api?.yabby?.devServer();
    if (!dev) return;
    const { password, username } = dev;
    const type = toServerType(dev.type) ?? ServerType.NAVIDROME;

    const { actions, currentServer, serverList } = useAuthStore.getState();
    const serverUrl = normalizeServerUrl(dev.url);
    const existing = Object.values(serverList).find(
        (server) => server.url === serverUrl && server.username === username,
    );

    if (existing) {
        if (!currentServer) actions.setCurrentServer(existing);
        return;
    }

    try {
        const data = await api.controller.authenticate(
            serverUrl,
            { legacy: false, password, username },
            type,
        );
        if (!data) throw new Error('No data returned');

        const server: ServerListItemWithCredential = {
            credential: data.credential,
            id: nanoid(),
            isAdmin: data.isAdmin,
            name: dev.name,
            // Saved so the app can sign in again when the session token expires.
            savePassword: true,
            type,
            url: serverUrl,
            userId: data.userId,
            username: data.username,
            ...(data.ndCredential !== undefined && { ndCredential: data.ndCredential }),
        };

        actions.addServer(server);
        actions.setCurrentServer(server);
        await window.api?.localSettings?.passwordSet(password, server.id);
        logger.info('Dev login added server from .env.local', { serverUrl, username });
    } catch (error) {
        logger.warn('Dev login from .env.local failed', {
            error: (error as Error).message,
            serverUrl,
        });
    }
}

if (useAuthStore.persist.hasHydrated()) devLogin();
else useAuthStore.persist.onFinishHydration(() => devLogin());
