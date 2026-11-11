import { createRequire } from 'module';

/**
 * Electron-builder mac.sign hook.
 *
 * Yeishin signs macOS builds with one long-lived self-signed certificate so the
 * app keeps the same designated requirement across versions, which lets
 * Squirrel.Mac (electron-updater) accept the next version. electron-builder only
 * picks identities macOS trusts, so it cannot find a self-signed one; this hook
 * hands the certificate's SHA-1 to @electron/osx-sign directly.
 *
 * YEISHIN_MAC_SIGN_IDENTITY = SHA-1 of the certificate (CI imports it via CSC_LINK).
 * Unset (local and PR builds): keep the ad-hoc signature from electron-builder.yml.
 */

// electron-builder depends on @electron/osx-sign; resolve it from there (pnpm is strict).
const require = createRequire(
    createRequire(import.meta.url).resolve('electron-builder/package.json'),
);
const { signAsync } = require(
    createRequire(require.resolve('app-builder-lib/package.json')).resolve('@electron/osx-sign'),
);

// This is not a typescript file, and is called by electron-builder, so we cannot use typescript features here.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function sign(opts) {
    const identity = process.env.YEISHIN_MAC_SIGN_IDENTITY?.trim() || opts.identity || '-';
    console.log(`Signing ${opts.app} with identity ${identity}`);
    await signAsync({ ...opts, identity, identityValidation: false });
}
