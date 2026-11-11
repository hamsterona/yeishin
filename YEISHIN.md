# Yeishin

[Feishin](https://github.com/jeffvli/feishin) with Yabbyville stickers. macOS and Windows.
Everything Feishin does, plus:

- the Yabbyville stickers on an album sit on its cover where people placed them,
  with their messages beside the track list;
- a **Yabby** page in the sidebar lists recently stickered albums, and a
  "Yabby stickers" home row can be turned on in the home page configuration;
- Settings > Yabbyville holds the token.

It installs beside stock Feishin (its own app id, settings and updates).

## Install

Download the latest release from <https://github.com/hamsterona/yeishin/releases/latest>.

- **Windows:** run `Yeishin-<version>-win-x64.exe` (or `arm64`). SmartScreen warns
  because the app is unsigned: More info > Run anyway. Later versions download in
  the background and install when you quit.
- **macOS:** open the `dmg` (`arm64` for Apple silicon), drag Yeishin to Applications.
  The app is not notarized, so macOS refuses the first launch ("Yeishin" Not Opened).
  Click Done, then System Settings > Privacy & Security > Open Anyway (macOS 15+;
  right-click > Open no longer works). Or in Terminal:
  `xattr -dr com.apple.quarantine /Applications/Yeishin.app`.
  Each downloaded update needs the same once. When a new version is out, Yeishin says so;
  download it and replace the app.

Then add your Navidrome server as in Feishin, make a token on your Yabbyville
profile (account > yeishin tokens; admins only for now) and paste it into
Settings > Yabbyville.

## How it talks to Yabbyville

The main process (`src/main/features/core/yabby/`) calls
`GET https://yabbyville.xyz/api/data/stickers?albums=…&names=1` (or
`order=recent`) with the token. The token is read-only, sticker reads only,
stored encrypted with the OS keychain (`safeStorage`), and never handed to the
renderer. Album ids are Navidrome's, the same ones Yabbyville stores.

## Versions and releases

Version = upstream `major.minor`, patch = upstream patch x 100 + Yeishin build.
Feishin 1.17.0 -> Yeishin 1.17.1, 1.17.2, ...; Feishin 1.17.2 -> Yeishin 1.17.201.
Plain semver, so the stock updater compares them without prerelease rules.

To release: bump `version` in `package.json` on `yabby`, commit, then

```
git tag yeishin-v<version> && git push origin yeishin-v<version>
```

`.github/workflows/release.yml` checks the tag matches `package.json`, builds macOS
(arm64 + x64) and Windows (x64 + arm64), and publishes the GitHub release. Tags are
prefixed `yeishin-v` so they never clash with Feishin's own `v*` tags.

## Updating from upstream

`yabby` is the default branch: a Feishin release tag plus our commits. `development`
mirrors upstream and is never committed to. Upstream is merged, never rebased.

`.github/workflows/sync-upstream.yml` runs weekly. When Feishin has a newer release
tag, it merges it on `sync/<tag>` and opens a PR, or opens an issue listing the
conflicted files. By hand:

```
git fetch upstream --tags
git switch yabby && git merge v<new tag>
```

Fix conflicts (the list below is every upstream file we touch), bump the version,
`pnpm lint`, `pnpm dev` smoke test, push, tag.

## Upstream files we touch

Keep this list complete; it is what a merge can conflict on. Everything else
lives in new files (`src/main/features/core/yabby/`, `src/preload/yabby.ts`,
`src/renderer/features/yabby/`, `src/shared/types/yabby.ts`, `src/shared/constants/brand.ts`).

The app name, repo links and release tag prefix live in `src/shared/constants/brand.ts`.
Upstream files read them from there, so a conflict is usually one line: keep
upstream's change and put the constant back.

| File | Change |
|------|--------|
| `package.json` | name, productName, version, homepage, bugs, author |
| `electron-builder.yml` | appId, productName, publish to this repo, `yeishin-v` tags, macOS permission texts |
| `commitlint.config.mjs` | `yabby` scope |
| `src/main/index.ts` | updater repo, app user model id, single `latest` channel, tray tooltip |
| `src/main/features/core/index.ts` | import `./yabby` |
| `src/preload/index.ts` | expose `yabby` |
| `src/renderer/router/routes.ts`, `app-router.tsx` | `/yabby` route |
| `src/renderer/store/settings.store.ts` | Yabby sidebar item (new installs), `HomeItem.YABBY` |
| `src/renderer/features/home/routes/home-route.tsx`, `settings/components/general/home-settings.tsx` | Yabby stickers home row |
| `src/renderer/features/sidebar/components/sidebar-icon.tsx` | sticker icon |
| `src/renderer/features/settings/components/settings-content.tsx` | Yabbyville tab |
| `src/renderer/features/settings/components/window/update-settings.tsx` | hide release channel |
| `src/renderer/features/albums/components/album-detail-content.tsx` | album sticker messages |
| `src/renderer/features/albums/components/album-detail-header.tsx` | stickers on the cover |
| `src/renderer/features/shared/components/library-header.tsx` (+ `.module.css`) | `imageDecoration` slot over the cover |
| `assets/icons/*` (not `IconTemplate*`), `media/feishin.icon/icon.json` | pink tint of the Feishin icon |
| `README.md` | replaced with the Yeishin readme (on conflict keep ours) |
| `.github/ISSUE_TEMPLATE/config.yml`, `01-feature_request.yml` | point at this repo, upstream for stock bugs |
| `src/i18n/i18n.ts` | Feishin -> Yeishin in every locale string at load (`rebrandString`) |
| `src/renderer/index.html` | title; upstream Umami analytics script removed |
| `src/renderer/features/settings/components/advanced/advanced-tab.tsx` | analytics opt-out hidden (nothing is sent) |
| `src/renderer/layouts/window-bar.tsx` | window title |
| `src/renderer/hooks/use-github-releases.ts`, `release-notes-modal.tsx`, `update-available-dialog.tsx`, `settings/components/update-available-button.tsx` | releases, notes and links from this repo, `yeishin-v` tags |
| `src/renderer/api/subsonic/subsonic-api.ts`, `subsonic-controller.ts`, `api/jellyfin/jellyfin-api.ts` | client name sent to the server |
| `src/renderer/features/settings/components/window/discord-settings.tsx`, `advanced/export-import-settings.tsx` | display label, export file name |
| `src/main/menu.ts`, `src/main/logger.ts`, `src/main/features/core/player/media-keys.ts`, `lyrics/lrclib.ts`, `src/main/features/linux/mpris.ts` | name and links in menus, tray, dialogs, user agent |
| `src/remote/index.html`, `src/remote/manifest.json`, `src/remote/store/index.ts`, `src/main/features/core/remote/manifest.json`, `web.vite.config.ts` | remote and web app names |
| `.github/workflows/` | upstream publish/stale workflows removed; `release.yml`, `sync-upstream.yml` added |

Strings are English only for now (no locale file edits, so no Weblate conflicts).
Upstream strings that say Feishin are rebranded when the locales load.

## Local dev

```
pnpm install
pnpm dev
```

Icons: the PNG/ICO files are the Feishin ones mapped from grey to pink (glyph
plum `#4a0a2c`, background `#ffc4de`); the macOS `.icon` carries the same colours
in `icon.json`. Redo both if upstream changes its icon.

`pnpm package:dev` builds an unpacked app; on macOS it needs Xcode 26 for the
`.icon` file (CI has it).
