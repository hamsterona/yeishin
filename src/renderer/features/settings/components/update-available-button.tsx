import { useTranslation } from 'react-i18next';

import { toTag } from '/@/renderer/hooks';
import { useLatestVersion } from '/@/renderer/store';
import { Button } from '/@/shared/components/button/button';
import { APP_REPO_URL } from '/@/shared/constants/brand';

export const UpdateAvailableButton = () => {
    const { t } = useTranslation();
    const { currentVersion, isUpdateAvailable, latestVersion } = useLatestVersion();

    if (!isUpdateAvailable || !latestVersion) {
        return null;
    }

    return (
        <Button
            component="a"
            href={`${APP_REPO_URL}/releases/tag/${toTag(latestVersion || currentVersion)}`}
            size="compact-sm"
            target="_blank"
            variant="filled"
        >
            {t('common.newVersionAvailable')}: v{latestVersion}
        </Button>
    );
};
