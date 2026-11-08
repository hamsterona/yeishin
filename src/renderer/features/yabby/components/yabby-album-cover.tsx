import clsx from 'clsx';
import { generatePath, Link } from 'react-router';

import styles from './yabby-album-cover.module.css';

import { useItemImageUrl } from '/@/renderer/components/item-image/item-image';
import { YabbyStickerLayer } from '/@/renderer/features/yabby/components/yabby-sticker-layer';
import { AppRoute } from '/@/renderer/router/routes';
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
