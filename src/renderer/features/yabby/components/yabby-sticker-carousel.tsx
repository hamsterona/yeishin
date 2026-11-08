import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
    GridCarousel,
    useGridCarouselContainerQuery,
} from '/@/renderer/components/grid-carousel/grid-carousel-v2';
import { YABBY_RECENT_LIMIT, yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import {
    groupByAlbum,
    YabbyAlbumCover,
} from '/@/renderer/features/yabby/components/yabby-album-cover';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';

const noop = () => {};

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

    const cards = useMemo(
        () =>
            groupByAlbum(recent.data ?? []).map((group) => {
                const { albumArtist, albumName } = group.stickers[0];
                return {
                    content: (
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
                    ),
                    id: group.albumId,
                };
            }),
        [recent.data],
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
            rowCount={1}
            title={title}
        />
    );
};
