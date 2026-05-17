export type ProfileId = "latam" | "global" | "spain";

export type Profile = {
  id: ProfileId;
  icon: string;
  slugs: string[];
};

export const PROFILES: Profile[] = [
  {
    id: "latam",
    icon: "🌎",
    slugs: [
      "infobae",
      "la-nacion",
      "clarin",
      "bbc-mundo",
      "el-tiempo",
      "excelsior",
      "el-universal",
      "france-24-espanol",
    ],
  },
  {
    id: "global",
    icon: "🌐",
    slugs: [
      "bbc-news",
      "the-guardian",
      "al-jazeera-english",
      "le-monde",
      "der-spiegel",
      "la-repubblica",
      "npr",
      "the-atlantic",
    ],
  },
  {
    id: "spain",
    icon: "🇪🇸",
    slugs: ["el-pais", "el-mundo", "el-confidencial", "la-vanguardia"],
  },
];
