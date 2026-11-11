// Yeishin identity. Upstream files that show the app name or link to the
// project read it from here, so an upstream merge only conflicts on one-line
// edits and a later rename touches this file alone.

export const APP_NAME = 'Yeishin';

export const APP_REPO_OWNER = 'hamsterona';
export const APP_REPO_NAME = 'yeishin';
export const APP_REPO_URL = `https://github.com/${APP_REPO_OWNER}/${APP_REPO_NAME}`;
export const APP_REPO_API_URL = `https://api.github.com/repos/${APP_REPO_OWNER}/${APP_REPO_NAME}`;
export const APP_DEFAULT_BRANCH = 'yabby';

// Release tags are `yeishin-v<version>` so they never clash with Feishin's `v*`.
export const APP_RELEASE_TAG_PREFIX = 'yeishin-v';

// Locale strings come from upstream Weblate untouched; the renderer swaps the
// upstream name for ours when it loads them (see src/i18n/i18n.ts).
export const rebrandString = (value: string) =>
    value.replace(/Feishin/g, APP_NAME).replace(/feishin/g, APP_REPO_NAME);
