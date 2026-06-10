// Rough team-strength ratings (0-100) used by the data-driven "Analyst" bot.
// Not official — a reasonable prior for WC2026 participants.
const RATINGS: Record<string, number> = {
  Argentina: 92,
  France: 92,
  Brazil: 90,
  Spain: 90,
  England: 88,
  Portugal: 86,
  Netherlands: 85,
  Germany: 84,
  Belgium: 80,
  Croatia: 80,
  Uruguay: 79,
  Morocco: 78,
  Colombia: 77,
  Norway: 76,
  Japan: 75,
  USA: 74,
  "United States": 74,
  Mexico: 74,
  Switzerland: 74,
  Austria: 74,
  Senegal: 73,
  Turkey: 73,
  Serbia: 72,
  "South Korea": 72,
  Algeria: 72,
  Ecuador: 70,
  Nigeria: 70,
  Sweden: 70,
  Scotland: 70,
  Canada: 70,
  Wales: 70,
  Australia: 68,
  Iran: 68,
  "Ivory Coast": 68,
  Egypt: 68,
  Ghana: 68,
  Paraguay: 68,
  "DR Congo": 66,
  Tunisia: 66,
  "Saudi Arabia": 66,
  Qatar: 64,
  "South Africa": 64,
  Panama: 62,
  Uzbekistan: 62,
  "Cape Verde": 60,
  Jordan: 60,
  Iraq: 60,
  "New Zealand": 58,
  "Curaçao": 55,
  Haiti: 55,
};

export function teamRating(name: string): number {
  return RATINGS[name] ?? 65;
}

/**
 * Deterministic scoreline prediction from two ratings. Returns [home, away].
 * Closer ratings trend to draws; bigger gaps widen the favourite's margin.
 */
export function predictScoreline(homeRating: number, awayRating: number): [number, number] {
  const diff = homeRating - awayRating;
  const ad = Math.abs(diff);
  if (ad <= 4) return [1, 1];
  const favGoals = 1 + Math.min(3, Math.floor(ad / 8));
  const dogGoals = ad > 20 ? 0 : 1;
  return diff > 0 ? [favGoals, dogGoals] : [dogGoals, favGoals];
}
