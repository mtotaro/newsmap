/**
 * Thumbnail fallback chain (in priority order):
 * 1. media:thumbnail  → media.thumbnails[0]
 * 2. media:content    → media.contents (filter by type/url/medium)
 * 3. enclosure        → enclosures (El Tiempo CO)
 * Returns null → og:image async job handles these later
 */

type MediaContent = {
  url?: string;
  type?: string;
  medium?: string;
};
type MediaGroup = {
  contents?: MediaContent[];
};

export type MediaLike = {
  thumbnails?: Array<{ url: string }>;
  contents?: MediaContent[];
  group?: MediaGroup;
} | undefined;

export function extractThumbnail(
  media: MediaLike,
  enclosures?: Array<{ url: string; type?: string }>
): string | null {
  if (media) {
    // 1. media:thumbnail — best option
    const thumb = media.thumbnails?.[0];
    if (thumb?.url) return thumb.url;

    // 2. media:content — filter to images
    const contents = media.contents ?? media.group?.contents ?? [];
    for (const c of contents) {
      if (!c.url) continue;
      const isImageMedium = c.medium === "image";
      const isImageType = c.type?.startsWith("image/");
      const hasImageExt = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(c.url);
      // The Independent has CMS bug: type="application/octet-stream" but URL is image
      const isOctetWithImageUrl =
        c.type === "application/octet-stream" && hasImageExt;
      if (isImageMedium || isImageType || hasImageExt || isOctetWithImageUrl) {
        return c.url;
      }
    }
  }

  // 3. enclosures — El Tiempo (CO)
  if (enclosures?.length) {
    for (const enc of enclosures) {
      if (enc.type?.startsWith("image/") && enc.url) return enc.url;
    }
  }

  return null;
}
