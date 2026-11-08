import yabbyvilleCss from './yabbyville.css?inline';

import { AppThemeConfiguration } from '/@/shared/themes/app-theme-types';

// The yabbyville.xyz look: white page, mono type in Yabby blue, pink Avara
// section titles. Colours come from Yabby's src/App.css :root palette.
export const yabbyville: AppThemeConfiguration = {
    app: {
        'overlay-header':
            'linear-gradient(rgb(255 255 255 / 40%) 0%, rgb(255 255 255 / 85%)), var(--theme-background-noise)',
        'overlay-subheader':
            'linear-gradient(180deg, rgb(255 255 255 / 5%) 0%, var(--theme-colors-background)), var(--theme-background-noise)',
        'scrollbar-handle-active-background': 'rgba(26, 46, 204, 60%)',
        'scrollbar-handle-background': 'rgba(26, 46, 204, 18%)',
        'scrollbar-handle-hover-background': 'rgba(26, 46, 204, 40%)',
        'scrollbar-track-background': 'transparent',
    },
    colors: {
        background: 'rgb(255, 255, 255)',
        'background-alternate': 'rgb(247, 248, 253)',
        black: 'rgb(0, 0, 0)',
        foreground: 'rgb(26, 46, 204)',
        'foreground-muted': 'rgb(85, 102, 201)',
        primary: 'rgb(26, 46, 204)',
        'state-error': 'rgb(214, 40, 70)',
        'state-info': 'rgb(26, 46, 204)',
        'state-success': 'rgb(56, 142, 60)',
        'state-warning': 'rgb(232, 122, 58)',
        surface: 'rgb(238, 241, 251)',
        'surface-foreground': 'rgb(26, 46, 204)',
        white: 'rgb(255, 255, 255)',
    },
    mantineOverride: {
        // generateColors('#1a2ecc') puts the exact Yabby blue at shade 7.
        primaryShade: {
            dark: 7,
            light: 7,
        },
    },
    mode: 'light',
    stylesheets: [yabbyvilleCss],
};
