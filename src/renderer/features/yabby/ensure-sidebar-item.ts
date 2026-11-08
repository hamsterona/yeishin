import { AppRoute } from '/@/renderer/router/routes';
import { useSettingsStore } from '/@/renderer/store/settings.store';

// Settings carried over from Feishin (or saved before Yeishin added the page)
// have no Yabby sidebar item, and the sidebar settings can only toggle items
// already in the list. Add it after Favorites when it is missing, without a
// settings version bump that would clash with upstream migrations.
function ensureYabbyItem() {
    const items = useSettingsStore.getState().general.sidebarItems;
    if (items.some((item) => item.id === 'Yabby')) return;
    const at = items.findIndex((item) => item.id === 'Favorites');
    const next = [...items];
    next.splice(at === -1 ? 0 : at + 1, 0, {
        disabled: false,
        id: 'Yabby',
        label: 'Yabby',
        route: AppRoute.YABBY,
    });
    useSettingsStore.setState((state) => ({
        general: { ...state.general, sidebarItems: next },
    }));
}

if (useSettingsStore.persist.hasHydrated()) ensureYabbyItem();
useSettingsStore.persist.onFinishHydration(ensureYabbyItem);
