const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "for",
  "to",
  "in",
  "on",
  "at",
  "with",
  "our",
  "my",
  "your",
  "new",
  "my",
  "2024",
  "2025",
  "2026",
  "2027",
  "annual",
  "first",
  "second",
  "third",
  "ii",
  "iii",
  "iv",
  "v",
  "day",
  "night",
  "event",
  "party",
]);

export function keywordsOf(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

export function addMinutes(hhmm: string, min: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + min) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
