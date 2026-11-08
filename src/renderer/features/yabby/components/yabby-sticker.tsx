import styles from './yabby-sticker.module.css';

import { Text } from '/@/shared/components/text/text';
import { YabbySticker as Sticker } from '/@/shared/types/yabby';

const formatDay = (ms: number) =>
    ms
        ? new Date(ms).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '';

/** One sticker: the image, what was said, who and when. Text is rendered as
 *  plain text, never HTML. */
export const YabbyStickerItem = ({ sticker }: { sticker: Sticker }) => (
    <div className={styles.sticker}>
        <img alt="" className={styles.image} loading="lazy" src={sticker.imageUrl} />
        <div className={styles.body}>
            {sticker.text && <Text size="sm">{sticker.text}</Text>}
            <Text isMuted size="xs">
                {sticker.username ?? 'someone'}
                {sticker.timestamp ? ` · ${formatDay(sticker.timestamp)}` : ''}
            </Text>
        </div>
    </div>
);
