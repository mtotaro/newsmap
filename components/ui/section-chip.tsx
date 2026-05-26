import type { SectionKey } from "@/lib/db/schema";

const SECTION_COLORS: Record<SectionKey, string> = {
  sports:        "bg-blue-500/15 text-blue-400",
  politics:      "bg-red-500/15 text-red-400",
  economy:       "bg-yellow-500/15 text-yellow-400",
  tech:          "bg-purple-500/15 text-purple-400",
  world:         "bg-teal-500/15 text-teal-400",
  culture:       "bg-orange-500/15 text-orange-400",
  health:        "bg-green-500/15 text-green-400",
  science:       "bg-cyan-500/15 text-cyan-400",
  entertainment: "bg-pink-500/15 text-pink-400",
};

type Props = {
  section: SectionKey;
  label: string;
};

export function SectionChip({ section, label }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-[11px] sm:text-xs font-medium leading-none ${SECTION_COLORS[section]}`}
    >
      {label}
    </span>
  );
}
