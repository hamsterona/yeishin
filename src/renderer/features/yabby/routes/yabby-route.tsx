import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { generatePath, Link } from 'react-router';

import styles from './yabby-route.module.css';

import { useItemImageUrl } from '/@/renderer/components/item-image/item-image';
import { LibraryContainer } from '/@/renderer/features/shared/components/library-container';
import { yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import { YabbyStickerItem } from '/@/renderer/features/yabby/components/yabby-sticker';
import { AppRoute } from '/@/renderer/router/routes';
import { ScrollArea } from '/@/shared/components/scroll-area/scroll-area';
import { Stack } from '/@/shared/components/stack/stack';
import { TextTitle } from '/@/shared/components/text-title/text-title';
import { Text } from '/@/shared/components/text/text';
import { LibraryItem } from '/@/shared/types/domain-types';
import { YabbySticker } from '/@/shared/types/yabby';

const RECENT_LIMIT = 200;

type AlbumGroup = { albumId: string; latest: number; stickers: YabbySticker[] };

function groupByAlbum(stickers: YabbySticker[]): AlbumGroup[] {
    const groups = new Map<string, AlbumGroup>();
    for (const sticker of stickers) {
        const group = groups.get(sticker.albumId) ?? {
            albumId: sticker.albumId,
            latest: 0,
            stickers: [],
        };
        group.stickers.push(sticker);
        group.latest = Math.max(group.latest, sticker.timestamp);
        groups.set(sticker.albumId, group);
    }
    return [...groups.values()].sort((a, b) => b.latest - a.latest);
}

const AlbumCard = ({ group }: { group: AlbumGroup }) => {
    const cover = useItemImageUrl({
        id: group.albumId,
        itemType: LibraryItem.ALBUM,
        type: 'itemCard',
    });
    const first = group.stickers[0];
    const to = generatePath(AppRoute.LIBRARY_ALBUMS_DETAIL, { albumId: group.albumId });

    return (
        <div className={styles.card}>
            <Link className={styles.album} to={to}>
                {cover ? (
                    <img alt="" className={styles.cover} loading="lazy" src={cover} />
                ) : (
                    <div className={styles.cover} />
                )}
                <div>
                    <Text fw={600} lineClamp={2}>
                        {first.albumName ?? 'Unknown album'}
                    </Text>
                    {first.albumArtist && (
                        <Text isMuted lineClamp={1} size="sm">
                            {first.albumArtist}
                        </Text>
                    )}
                </div>
            </Link>
            <Stack gap="sm">
                {group.stickers.map((sticker) => (
                    <YabbyStickerItem key={sticker.id} sticker={sticker} />
                ))}
            </Stack>
        </div>
    );
};

const YabbyRoute = () => {
    const config = useQuery(yabbyQueries.config());
    const hasToken = Boolean(config.data?.hasToken);
    const recent = useQuery(yabbyQueries.recentStickers(RECENT_LIMIT, hasToken));
    const groups = useMemo(() => groupByAlbum(recent.data ?? []), [recent.data]);

    return (
        <LibraryContainer>
            <ScrollArea>
                <Stack gap="lg" p="xl">
                    <TextTitle fw={700} order={2}>
                        Stickered on Yabbyville
                    </TextTitle>
                    {!hasToken && (
                        <Text isMuted>
                            Add your Yabbyville token in Settings &gt; General &gt; Yabbyville.
                        </Text>
                    )}
                    {recent.isError && <Text isMuted>{(recent.error as Error).message}</Text>}
                    {hasToken && recent.isSuccess && groups.length === 0 && (
                        <Text isMuted>No stickers yet.</Text>
                    )}
                    <div className={styles.grid}>
                        {groups.map((group) => (
                            <AlbumCard group={group} key={group.albumId} />
                        ))}
                    </div>
                </Stack>
            </ScrollArea>
        </LibraryContainer>
    );
};

export default YabbyRoute;
