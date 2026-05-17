export function timeAgo(date: Date | string, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return locale === "es" ? "ahora" : "now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return locale === "es" ? `${minutes}m` : `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return locale === "es" ? `${hours}h` : `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7)
    return locale === "es" ? `${days}d` : `${days}d`;

  const weeks = Math.floor(days / 7);
  return locale === "es" ? `${weeks}sem` : `${weeks}w`;
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}
