/**
 * Jaccard similarity coefficient = |A ∩ B| / |A ∪ B|. Range 0..1.
 * Symmetric: jaccard(A, B) === jaccard(B, A).
 *
 * For two title token sets, > ~0.5 typically indicates "same story" and
 * < 0.3 indicates "unrelated". The 0.3–0.5 band is the noisy middle.
 */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;

  // Iterate the smaller set for the intersection — cheap optimisation
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];

  let intersection = 0;
  for (const token of small) {
    if (large.has(token)) intersection++;
  }
  if (intersection === 0) return 0;

  const union = a.size + b.size - intersection;
  return intersection / union;
}

/** Count tokens shared between two sets (for absolute-overlap thresholds) */
export function sharedCount(a: Set<string>, b: Set<string>): number {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let n = 0;
  for (const t of small) if (large.has(t)) n++;
  return n;
}
