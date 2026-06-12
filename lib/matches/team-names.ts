// Maps the divergent team names between data sources (openfootball vs
// football-data.org) onto a single canonical key so results can be matched.
const ALIASES: Record<string, string> = {
  usa: "united states",
  "korea republic": "south korea",
  "republic of korea": "south korea",
  czechia: "czech republic",
  "cote divoire": "ivory coast",
  "congo dr": "dr congo",
  "dr congo": "dr congo",
  "democratic republic of congo": "dr congo",
  "cabo verde": "cape verde",
  "bosnia and herzegovina": "bosnia & herzegovina",
  turkiye: "turkey",
  "ir iran": "iran",
  "iran islamic republic of": "iran",
};

/** Normalizes a team name to a canonical, comparison-safe key. */
export function canonTeam(name: string): string {
  const n = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, "") // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
  return ALIASES[n] ?? n;
}

/** Order-independent key for a fixture's two teams. */
export function pairKey(a: string, b: string): string {
  return [canonTeam(a), canonTeam(b)].sort().join("|");
}
