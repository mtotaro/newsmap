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
      "agencia-brasil",
      "la-jornada",
      "bbc-mundo",
      "el-tiempo",
      "france-24-espanol",
      "la-tercera",
    ],
  },
  {
    id: "global",
    icon: "🌐",
    slugs: [
      "bbc-news",
      "the-guardian",
      "al-jazeera-english",
      "tagesschau",
      "ansa",
      "npr",
      "the-guardian-us",
      "axios",
    ],
  },
  {
    id: "spain",
    icon: "🇪🇸",
    slugs: ["el-pais", "el-mundo", "el-confidencial", "la-vanguardia"],
  },
];
