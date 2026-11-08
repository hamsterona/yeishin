import { useQuery, useQueryClient } from '@tanstack/react-query';
import isElectron from 'is-electron';
import { memo, useState } from 'react';

import {
    SettingOption,
    SettingsSection,
} from '/@/renderer/features/settings/components/settings-section';
import { yabbyApi, yabbyKeys, yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import { Button } from '/@/shared/components/button/button';
import { Group } from '/@/shared/components/group/group';
import { PasswordInput } from '/@/shared/components/password-input/password-input';
import { TextInput } from '/@/shared/components/text-input/text-input';
import { toast } from '/@/shared/components/toast/toast';

export const YabbySettings = memo(() => {
    const queryClient = useQueryClient();
    const config = useQuery(yabbyQueries.config());
    const [token, setToken] = useState('');
    const [site, setSite] = useState<null | string>(null);

    const refresh = () => queryClient.invalidateQueries({ queryKey: yabbyKeys.all });

    const saveToken = async () => {
        if (!yabbyApi) return;
        const result = await yabbyApi.setToken(token);
        if (!result.ok) {
            toast.error({ message: result.error });
            return;
        }
        setToken('');
        const check = await yabbyApi.recentStickers(1);
        if (check.ok) toast.success({ message: 'Connected to Yabbyville.' });
        else toast.warn({ message: `Token saved, but Yabbyville said: ${check.error}` });
        await refresh();
    };

    const clearToken = async () => {
        if (!yabbyApi) return;
        await yabbyApi.setToken(null);
        await refresh();
    };

    const saveSite = async () => {
        if (!yabbyApi || site === null) return;
        const result = await yabbyApi.setSite(site);
        if (!result.ok) {
            toast.error({ message: result.error });
            return;
        }
        setSite(null);
        await refresh();
    };

    const options: SettingOption[] = [
        {
            control: config.data?.hasToken ? (
                <Button onClick={clearToken} variant="default">
                    Remove token
                </Button>
            ) : (
                <Group gap="xs" wrap="nowrap">
                    <PasswordInput
                        aria-label="Yabbyville token"
                        onChange={(e) => setToken(e.currentTarget.value)}
                        placeholder="yv_…"
                        value={token}
                        width={240}
                    />
                    <Button disabled={!token} onClick={saveToken} variant="filled">
                        Save
                    </Button>
                </Group>
            ),
            description: config.data?.hasToken
                ? 'A token is saved. Stickers show on album pages and the Yabby page.'
                : 'Make a token on your Yabbyville profile (account > yeishin tokens) and paste it here.',
            isHidden: !isElectron(),
            title: 'Yabbyville token',
        },
        {
            control: (
                <Group gap="xs" wrap="nowrap">
                    <TextInput
                        aria-label="Yabbyville address"
                        onChange={(e) => setSite(e.currentTarget.value)}
                        value={site ?? config.data?.siteUrl ?? ''}
                        width={240}
                    />
                    <Button disabled={site === null} onClick={saveSite} variant="default">
                        Save
                    </Button>
                </Group>
            ),
            description: 'Only change this for testing.',
            isHidden: !isElectron(),
            title: 'Yabbyville address',
        },
    ];

    return <SettingsSection options={options} title="Yabbyville" />;
});
