import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import styles from './yabby-route.module.css';

import { LibraryContainer } from '/@/renderer/features/shared/components/library-container';
import { YABBY_RECENT_LIMIT, yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import {
    groupByAlbum,
    YabbyAlbumCover,
} from '/@/renderer/features/yabby/components/yabby-album-cover';
import { ScrollArea } from '/@/shared/components/scroll-area/scroll-area';
import { Stack } from '/@/shared/components/stack/stack';
import { TextTitle } from '/@/shared/components/text-title/text-title';
import { Text } from '/@/shared/components/text/text';

const YabbyRoute = () => {
    const config = useQuery(yabbyQueries.config());
    const hasToken = Boolean(config.data?.hasToken);
    const recent = useQuery(yabbyQueries.recentStickers(YABBY_RECENT_LIMIT, hasToken));
    const groups = useMemo(() => groupByAlbum(recent.data ?? []), [recent.data]);

    return (
        <LibraryContainer>
            <ScrollArea>
                <Stack gap="lg" p="xl">
                    <TextTitle fw={700} order={2}>
                        Stickered on Yabbyville
                    </TextTitle>
                    {!hasToken && (
                        <Text isMuted>Add your Yabbyville token in Settings &gt; Yabbyville.</Text>
                    )}
                    {recent.isError && <Text isMuted>{(recent.error as Error).message}</Text>}
                    {hasToken && recent.isSuccess && groups.length === 0 && (
                        <Text isMuted>No stickers yet.</Text>
                    )}
                    <div className={styles.grid}>
                        {groups.map((group) => (
                            <YabbyAlbumCover
                                className={styles.card}
                                group={group}
                                key={group.albumId}
                            />
                        ))}
                    </div>
                </Stack>
            </ScrollArea>
        </LibraryContainer>
    );
};

export default YabbyRoute;
