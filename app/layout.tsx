import type { Viewport } from "next";

// Root layout — minimal shell. The [locale]/layout.tsx handles fonts and intl.
//
// `viewport` is exported here (and not in [locale]/layout.tsx) so the same
// settings apply to every page including locale roots, OG image routes, and
// any future non-locale-prefixed routes.
//
// We DON'T set `userScalable: false` — allowing pinch-to-zoom is critical for
// accessibility (low-vision users) and lets readers zoom into article text.
// `maximumScale: 5` prevents runaway zoom that would break the layout.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Sensible mobile defaults — keep the browser chrome out of the way
  themeColor: "#fbfaf7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
