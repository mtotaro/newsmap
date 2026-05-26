import { tokenize } from "./tokenize";
import { jaccard, sharedCount } from "./similarity";

/**
 * Tuning knobs for the clustering algorithm.
 *
 * - SIM_THRESHOLD:    Jaccard score above which two titles are linked
 * - MIN_SHARED:       Require at least N tokens shared (rejects 2-token matches like
 *                     "Trump · Tariffs" matching every Trump article)
 * - WINDOW_HOURS:     Only cluster articles within this rolling window — stories
 *                     spread fast but lose their cluster identity after ~12 hours
 *                     when they become "follow-up" pieces
 */
export const SIM_THRESHOLD = 0.5;
export const MIN_SHARED = 3;
export const WINDOW_HOURS = 12;

type Article = {
  id: string;
  title: string;
  source_id: string;
  published_at: Date;
};

/**
 * Union-Find with path compression and union-by-rank. O(n·α(n)) ≈ O(n) in
 * practice. Used to compute connected components from the pairwise
 * similarity graph.
 */
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root];
    // Path compression
    while (this.parent[x] !== root) {
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  union(x: number, y: number) {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return;
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else {
      this.parent[ry] = rx;
      this.rank[rx]++;
    }
  }
}

/**
 * Cluster a list of articles by title similarity within a rolling time window.
 *
 * Returns an array of clusters where each cluster is an array of article ids.
 * Clusters of size 1 are NOT returned — callers should treat any article id
 * not present in the result as a singleton.
 *
 * Algorithm:
 *   1. Tokenize every title once
 *   2. Pairwise loop, comparing only articles within WINDOW_HOURS of each other
 *      AND from different sources (a single source covering its own story isn't
 *      a cluster — we want multi-publisher signal)
 *   3. If similarity passes both thresholds, union the two articles
 *   4. Collect connected components of size ≥ 2
 *
 * Complexity: O(n²) but n is bounded by the 12-hour window's article count
 * (~500–1500 typical) and each comparison is O(|tokens|) ≈ constant.
 */
export function clusterArticles(
  articles: Article[]
): Array<{ ids: string[] }> {
  if (articles.length < 2) return [];

  // Sort by published_at ascending so the window check is cheap
  const sorted = [...articles].sort(
    (a, b) => a.published_at.getTime() - b.published_at.getTime()
  );

  // Pre-tokenize
  const tokens: Array<Set<string>> = sorted.map((a) => tokenize(a.title));

  const uf = new UnionFind(sorted.length);
  const windowMs = WINDOW_HOURS * 3_600_000;

  // For each article, only compare against articles that fall within the
  // forward window. Since we sorted by published_at ascending, we can break
  // the inner loop early.
  for (let i = 0; i < sorted.length; i++) {
    const ti = tokens[i];
    if (ti.size === 0) continue;
    const cutoff = sorted[i].published_at.getTime() + windowMs;

    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].published_at.getTime() > cutoff) break;
      // Same source = same publisher's variations, not a cluster signal
      if (sorted[i].source_id === sorted[j].source_id) continue;

      const tj = tokens[j];
      if (tj.size === 0) continue;
      if (sharedCount(ti, tj) < MIN_SHARED) continue;
      if (jaccard(ti, tj) < SIM_THRESHOLD) continue;

      uf.union(i, j);
    }
  }

  // Collect components
  const componentsByRoot = new Map<number, string[]>();
  for (let i = 0; i < sorted.length; i++) {
    const root = uf.find(i);
    const list = componentsByRoot.get(root) ?? [];
    list.push(sorted[i].id);
    componentsByRoot.set(root, list);
  }

  return [...componentsByRoot.values()]
    .filter((ids) => ids.length >= 2)
    .map((ids) => ({ ids }));
}
