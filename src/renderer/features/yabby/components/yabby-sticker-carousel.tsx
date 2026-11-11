import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
    GridCarousel,
    useGridCarouselContainerQuery,
} from '/@/renderer/components/grid-carousel/grid-carousel-v2';
import { useDefaultItemListControls } from '/@/renderer/components/item-list/helpers/item-list-controls';
import { useGridRows } from '/@/renderer/components/item-list/helpers/use-grid-rows';
import { YABBY_RECENT_LIMIT, yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import {
    groupByAlbum,
    YabbyAlbumCard,
} from '/@/renderer/features/yabby/components/yabby-album-cover';
import { LibraryItem } from '/@/shared/types/domain-types';
import { ItemListKey } from '/@/shared/types/types';

const noop = () => {};

/** Albums shown on the home row; the Yabby page lists the rest. */
const HOME_ALBUM_LIMIT = 20;

/** Home page row of recently stickered albums. Hidden without a token or stickers. */
export const YabbyStickerCarousel = ({
    containerQuery,
    title,
}: {
    containerQuery?: ReturnType<typeof useGridCarouselContainerQuery>;
    title: string;
}) => {
    const config = useQuery(yabbyQueries.config());
    const recent = useQuery(
        yabbyQueries.recentStickers(YABBY_RECENT_LIMIT, Boolean(config.data?.hasToken)),
    );
    const rows = useGridRows(LibraryItem.ALBUM, ItemListKey.ALBUM);
    const controls = useDefaultItemListControls();

    const cards = useMemo(
        () =>
            groupByAlbum(recent.data ?? [])
                .slice(0, HOME_ALBUM_LIMIT)
                .map((group) => ({
                    content: <YabbyAlbumCard controls={controls} group={group} rows={rows} />,
                    id: group.albumId,
                })),
        [controls, recent.data, rows],
    );

    if (cards.length === 0) return null;

    return (
        <GridCarousel
            cards={cards}
            containerQuery={containerQuery}
            enableRefresh
            onNextPage={noop}
            onPrevPage={noop}
            onRefresh={() => recent.refetch()}
            placeholderItemType={LibraryItem.ALBUM}
            placeholderRows={rows}
            rowCount={1}
            title={title}
        />
    );
};
