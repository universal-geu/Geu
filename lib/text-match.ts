export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  let curr = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[b.length];
}

function toleranceFor(length: number): number {
  if (length <= 3) return 0;
  if (length <= 6) return 1;
  return 2;
}

function tokenMatchesWord(token: string, word: string): boolean {
  if (word.includes(token) || token.includes(word)) return true;
  const tolerance = toleranceFor(Math.min(token.length, word.length));
  if (tolerance === 0) return false;
  return levenshtein(token, word) <= tolerance;
}

/**
 * Accent-insensitive, typo-tolerant match: every token in `query` must
 * approximately match (substring or small edit-distance) some word in
 * `haystack`. Lets "manguera"/"manguerra"/"mangera" or missing tildes
 * still find results instead of requiring an exact substring.
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return true;

  if (normalizeText(haystack).includes(normalizeText(query))) return true;

  const haystackWords = tokenize(haystack);
  return queryTokens.every((token) => haystackWords.some((word) => tokenMatchesWord(token, word)));
}
