import { useQuery } from '@tanstack/react-query';

import { yabbyQueries } from '/@/renderer/features/yabby/api/yabby-api';
import { YabbyStickerItem } from '/@/renderer/features/yabby/components/yabby-sticker';
import { Stack } from '/@/shared/components/stack/stack';
import { Text } from '/@/shared/components/text/text';

/** The Yabbyville stickers on one album. Renders nothing until a token is set,
 *  and nothing for an album with no stickers or when Yabbyville is unreachable. */
export const YabbyAlbumStickers = ({ albumId }: { albumId: string }) => {
    const config = useQuery(yabbyQueries.config());
    const stickers = useQuery(yabbyQueries.albumStickers(albumId, Boolean(config.data?.hasToken)));

    if (!stickers.data || stickers.data.length === 0) return null;

    const sorted = [...stickers.data].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <Stack gap="sm" pb="md">
            <Text fw={600} size="sm">
                Yabbyville stickers
            </Text>
            {sorted.map((sticker) => (
                <YabbyStickerItem key={sticker.id} sticker={sticker} />
            ))}
        </Stack>
    );
};
