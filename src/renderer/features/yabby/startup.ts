// Yeishin renderer start-up hooks, imported once from app-router.tsx.
import '/@/renderer/features/yabby/ensure-sidebar-item';

if (import.meta.env.DEV) {
    import('/@/renderer/features/yabby/dev-login');
}
