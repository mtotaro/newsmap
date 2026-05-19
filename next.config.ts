import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // News aggregator: images come from arbitrary RSS feed domains we don't control.
    // Wildcard allows any HTTPS host rather than maintaining a brittle per-source list.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
