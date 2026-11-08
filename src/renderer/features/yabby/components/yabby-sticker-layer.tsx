import { useQuery } from '@tanstack/react-query';

import styles from './yabby-sticker-layer.module.css';

import { yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import { YABBY_COVER_SIZE, YabbySticker } from '/@/shared/types/yabby';

const pct = (value: number) => `${(value / YABBY_COVER_SIZE) * 100}%`;

/** Stickers drawn over a square cover where people placed them on the site:
 *  a third of the cover wide, centred on `position`, newest on top. Put it in
 *  a `position: relative` box the size of the cover. */
export const YabbyStickerLayer = ({ stickers }: { stickers: YabbySticker[] }) => {
    const placed = stickers.filter((s) => s.position).sort((a, b) => a.timestamp - b.timestamp);
    if (placed.length === 0) return null;

    return (
        <div className={styles.layer}>
            {placed.map((s) => (
                <img
                    alt=""
                    className={styles.sticker}
                    key={s.id}
                    loading="lazy"
                    src={s.imageUrl}
                    style={{ left: pct(s.position!.x), top: pct(s.position!.y) }}
                    title={s.text ? `${s.username ?? 'someone'}: ${s.text}` : undefined}
                />
            ))}
        </div>
    );
};

/** The album's stickers over its header cover. */
export const YabbyAlbumCoverStickers = ({ albumId }: { albumId: string }) => {
    const config = useQuery(yabbyQueries.config());
    const stickers = useQuery(yabbyQueries.albumStickers(albumId, Boolean(config.data?.hasToken)));
    return stickers.data ? <YabbyStickerLayer stickers={stickers.data} /> : null;
};
