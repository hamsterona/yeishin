## Yeishin fork

Yeishin is a fork of Feishin (macOS + Windows) that adds Yabbyville stickers. Read `YEISHIN.md` before touching releases, updates, or anything upstream-owned.

- Default branch is `yabby` (a Feishin release tag plus our commits). `development` mirrors upstream and is never committed to. Merge upstream, never rebase.
- Yeishin code lives in new files: `src/main/features/core/yabby/`, `src/preload/yabby.ts`, `src/renderer/features/yabby/`, `src/shared/types/yabby.ts`. Keep edits to upstream files minimal, and add any upstream file you touch to the table in `YEISHIN.md` (it is what upstream merges conflict on).
- Version = upstream `major.minor`, patch = upstream patch x 100 + Yeishin build (Feishin 1.17.0 -> Yeishin 1.17.1; 1.17.2 -> 1.17.201). Release: bump `version` in `package.json`, then push tag `yeishin-v<version>`; `.github/workflows/release.yml` builds and publishes.
- The Yabbyville token is read in the main process only (stored with `safeStorage`), never exposed to the renderer.
- macOS builds are ad-hoc signed and not notarized, so macOS only gets an update notice (no auto-install); Windows auto-updates. Details in `YEISHIN.md`.
- UI strings are English only; do not edit locale files (avoids Weblate conflicts).

## Commands

- `pnpm install`, then `pnpm dev` to run the Electron app from source with hot reload. Dev uses a separate userData folder (`Yeishin-dev`), so installed-app settings are untouched. Optional `.env.local` (see `.env.example`) signs in automatically in dev.
- `pnpm lint` = typecheck (node + web) + eslint + stylelint; this is what CI runs. Single file: `pnpm exec eslint <file>`. Typecheck alone: `pnpm typecheck`.
- There is no test runner or `test` script. CI (`test.yml`) runs lint and commitlint only.
- `pnpm package:dev` builds an unpacked app but needs Xcode 26 on macOS; use CI for release builds.

## General guidelines

- Never use the em dash "—". Use plain dash "-" instead.
- On an explicit commit request: `git add` the changes, run `pnpm lint:staged`, then commit. It lints only staged TS/TSX/CSS/SCSS via eslint+stylelint and auto-fixes; typecheck runs in CI (`test.yml`), not locally. Do not stage or run it outside a commit request.

## Agent skills

### Issue tracker

Issues live as markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

### Architecture

Process boundaries (main / preload / renderer / remote / web, `window.api`, import rules): read `docs/agents/architecture.md` when crossing processes or builds.

### API

Server library data layer (controller, query keys, normalize): read `docs/agents/api.md` when adding or changing fetches, mutations, or backend mapping. Upstream OpenAPI links inside that doc — fetch only as a last resort when in-repo types/controllers are insufficient.

### Mantine

Wrapped UI lives under `/@/shared/components` and `/@/shared/hooks`. Read `docs/agents/mantine.md` only when debugging those wrappers or adding a new wrapped component/hook.

### Frontend

Renderer UI (imports, composition, CSS Modules, theme, i18n/icons/toasts/modals, Zustand): read `docs/agents/frontend.md` when writing or changing frontend UI, styles, or client state.

### Logging

App logging (renderer `logger` / main `log`): read `docs/agents/logging.md` when adding or changing diagnosable code paths — failures, fallbacks, engine/connection lifecycle.

### Commits

Conventional Commits + allowed scopes: read `docs/agents/commits.md` when writing a commit message. Enforced by commitlint in CI.

## Working mode

Ponytail (lazy senior / YAGNI ladder) on coding tasks. See the `ponytail` skill.
