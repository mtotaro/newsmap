import { ImageResponse } from "next/og";

// Route segment config — Next.js generates the image at build/request time
export const runtime = "edge";
export const alt = "NewsMap — World news, one front page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph / Twitter card image rendered with next/og.
 * Newspaper-style masthead on warm paper background — matches the in-app palette.
 *
 * Used as the fallback social card for the root, /feed, /map, and any page that
 * doesn't override openGraph.images in its own metadata.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fbfaf7",
          padding: "80px 100px",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.25em",
            color: "#7a1f1f",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 24,
            display: "flex",
          }}
        >
          THE WORLD · IN ONE PAGE
        </div>

        {/* Big serif logotype */}
        <div
          style={{
            fontSize: 180,
            color: "#1a1a1a",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            display: "flex",
          }}
        >
          NewsMap
        </div>

        {/* Hairline rule under the masthead */}
        <div
          style={{
            width: "100%",
            height: 4,
            background: "#7a1f1f",
            marginTop: 32,
            marginBottom: 28,
          }}
        />

        {/* Tagline row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: "#4a4a4a",
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex" }}>
            Las noticias del mundo · World news, one front page
          </div>
        </div>

        {/* Country flag rail at the bottom */}
        <div
          style={{
            display: "flex",
            gap: 18,
            position: "absolute",
            bottom: 64,
            left: 100,
            fontSize: 56,
          }}
        >
          <span>🇦🇷</span>
          <span>🇧🇷</span>
          <span>🇲🇽</span>
          <span>🇪🇸</span>
          <span>🇺🇸</span>
          <span>🇬🇧</span>
          <span>🇫🇷</span>
          <span>🇩🇪</span>
          <span>🇨🇱</span>
          <span>🇨🇴</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
