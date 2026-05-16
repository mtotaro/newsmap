import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "newsmap",
  name: "NewsMap",
});

// Event type registry
export type Events = {
  "newsmap/source.fetch": {
    data: { source_id: string; source_slug: string };
  };
  "newsmap/article.og-image": {
    data: { article_id: string; article_url: string };
  };
};
