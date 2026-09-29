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

// Formas de una palabra sin su plural: "empaques" -> ["empaques", "empaque", "empaqu"].
function singularForms(token: string): string[] {
  const forms = [token];
  if (token.length > 3 && token.endsWith("s")) forms.push(token.slice(0, -1));
  if (token.length > 4 && token.endsWith("es")) forms.push(token.slice(0, -2));
  return forms;
}

/**
 * Coincidencia por nombre: cada palabra de la búsqueda (o su singular) debe
 * aparecer dentro del nombre, sin tildes ni mayúsculas. "mang" encuentra
 * "Manguera" y "empaques" encuentra "Empaque".
 */
export function nameMatchesQuery(name: string, query: string): boolean {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return true;
  const normalizedName = normalizeText(name);
  return queryTokens.every((token) => singularForms(token).some((form) => normalizedName.includes(form)));
}

/** 0 = el nombre empieza por la búsqueda, 1 = alguna palabra empieza por ella, 2 = la contiene. */
export function nameMatchRank(name: string, query: string): number {
  const normalizedName = normalizeText(name);
  const firstForms = singularForms(tokenize(query)[0] ?? "");
  if (firstForms.some((form) => normalizedName.startsWith(form))) return 0;
  if (tokenize(name).some((word) => firstForms.some((form) => word.startsWith(form)))) return 1;
  return 2;
}
