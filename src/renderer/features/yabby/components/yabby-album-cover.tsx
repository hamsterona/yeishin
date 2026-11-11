import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { memo } from 'react';
import { generatePath, Link } from 'react-router';

import styles from './yabby-album-cover.module.css';

import { DataRow, MemoizedItemCard } from '/@/renderer/components/item-card/item-card';
import { useItemImageUrl } from '/@/renderer/components/item-image/item-image';
import { ItemControls } from '/@/renderer/components/item-list/types';
import { albumQueries } from '/@/renderer/features/albums/api/album-api';
import { YabbyStickerLayer } from '/@/renderer/features/yabby/components/yabby-sticker-layer';
import { AppRoute } from '/@/renderer/router/routes';
import { useCurrentServerId } from '/@/renderer/store';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';
import { LibraryItem } from '/@/shared/types/domain-types';
import { YabbySticker } from '/@/shared/types/yabby';

export type YabbyAlbumGroup = { albumId: string; latest: number; stickers: YabbySticker[] };

/** Stickers grouped by album, most recently stickered album first. */
export function groupByAlbum(stickers: YabbySticker[]): YabbyAlbumGroup[] {
    const groups = new Map<string, YabbyAlbumGroup>();
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

export const albumLabel = (group: YabbyAlbumGroup) =>
    [group.stickers[0].albumName, group.stickers[0].albumArtist].filter(Boolean).join(' - ');

/** A square album cover with its stickers on it, linking to the album. */
export const YabbyAlbumCover = ({
    className,
    group,
}: {
    className?: string;
    group: YabbyAlbumGroup;
}) => {
    const cover = useItemImageUrl({
        id: group.albumId,
        itemType: LibraryItem.ALBUM,
        type: 'itemCard',
    });
    const name = albumLabel(group);

    return (
        <Link
            aria-label={name || 'Album'}
            className={clsx(styles.cover, className)}
            title={name}
            to={generatePath(AppRoute.LIBRARY_ALBUMS_DETAIL, { albumId: group.albumId })}
        >
            {cover && <img alt="" className={styles.image} loading="lazy" src={cover} />}
            <YabbyStickerLayer stickers={group.stickers} />
        </Link>
    );
};

/** A stickered album as a normal album card (hover dim, play, favourite, rating, drag,
 *  context menu) with its stickers drawn over the cover. Falls back to the plain stickered
 *  cover when the album can't be loaded from the current server. */
export const YabbyAlbumCard = memo(function YabbyAlbumCard({
    controls,
    group,
    rows,
}: {
    controls: ItemControls;
    group: YabbyAlbumGroup;
    rows: DataRow[];
}) {
    const serverId = useCurrentServerId();
    const album = useQuery(albumQueries.detail({ query: { id: group.albumId }, serverId }));

    if (album.isError) {
        const { albumArtist, albumName } = group.stickers[0];
        return (
            <Stack gap={4}>
                <YabbyAlbumCover group={group} />
                <Text fw={500} lineClamp={1} pt={4}>
                    {albumName ?? 'Unknown album'}
                </Text>
                {albumArtist && (
                    <Text isMuted lineClamp={1}>
                        {albumArtist}
                    </Text>
                )}
            </Stack>
        );
    }

    return (
        <MemoizedItemCard
            controls={controls}
            data={album.data}
            enableDrag
            enableExpansion
            imageDecoration={<YabbyStickerLayer stickers={group.stickers} />}
            imageFetchPriority="low"
            itemType={LibraryItem.ALBUM}
            rows={rows}
            type="poster"
            withControls
        />
    );
});
