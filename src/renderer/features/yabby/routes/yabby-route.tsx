import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import styles from './yabby-route.module.css';

import { useDefaultItemListControls } from '/@/renderer/components/item-list/helpers/item-list-controls';
import { useGridRows } from '/@/renderer/components/item-list/helpers/use-grid-rows';
import { LibraryContainer } from '/@/renderer/features/shared/components/library-container';
import { YABBY_RECENT_LIMIT, yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import {
    groupByAlbum,
    YabbyAlbumCard,
} from '/@/renderer/features/yabby/components/yabby-album-cover';
import { ScrollArea } from '/@/shared/components/scroll-area/scroll-area';
import { Stack } from '/@/shared/components/stack/stack';
import { TextTitle } from '/@/shared/components/text-title/text-title';
import { Text } from '/@/shared/components/text/text';
import { LibraryItem } from '/@/shared/types/domain-types';
import { ItemListKey } from '/@/shared/types/types';

const YabbyRoute = () => {
    const config = useQuery(yabbyQueries.config());
    const hasToken = Boolean(config.data?.hasToken);
    const recent = useQuery(yabbyQueries.recentStickers(YABBY_RECENT_LIMIT, hasToken));
    const groups = useMemo(() => groupByAlbum(recent.data ?? []), [recent.data]);
    const rows = useGridRows(LibraryItem.ALBUM, ItemListKey.ALBUM);
    const controls = useDefaultItemListControls();

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
                            <YabbyAlbumCard
                                controls={controls}
                                group={group}
                                key={group.albumId}
                                rows={rows}
                            />
                        ))}
                    </div>
                </Stack>
            </ScrollArea>
        </LibraryContainer>
    );
};

export default YabbyRoute;
