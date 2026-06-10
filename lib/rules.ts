import { POINTS, KNOCKOUT_MULTIPLIER } from "@/lib/scoring";
import { JOKERS_PER_STAGE } from "@/lib/joker";
import { ROUND_POINTS } from "@/lib/bracket";
import { POINTS_PER_POSITION } from "@/lib/group-predict";
import { LOCK_WINDOW_MS } from "@/lib/locking";

export const LOCK_MINUTES = LOCK_WINDOW_MS / 60_000;

export interface RuleSection {
  id: string;
  title: string;
  summary: string;
  items: string[];
}

const roundPointsList = Object.entries(ROUND_POINTS).map(
  ([round, pts]) => `${round}: ${pts} pts`,
);

export const RULES: RuleSection[] = [
  {
    id: "match-predictions",
    title: "Match predictions",
    summary: "Predict the final score of every match before it kicks off. The closer you are, the more you score.",
    items: [
      `Exact score — ${POINTS.EXACT} pts`,
      `Right result + right goal difference — ${POINTS.GOAL_DIFFERENCE} pts`,
      `Right result only — ${POINTS.OUTCOME} pts`,
      `Wrong result — ${POINTS.WRONG} pts`,
    ],
  },
  {
    id: "knockout",
    title: "Knockout matches",
    summary: `Knockout matches carry a ×${KNOCKOUT_MULTIPLIER} multiplier, so every pick matters more as the rounds go on.`,
    items: [
      `All points are multiplied by ${KNOCKOUT_MULTIPLIER}`,
      "Exact score & goal-difference are judged on the 90' + extra-time scoreline",
      "The result tier counts the team that advanced — so penalty-shootout winners count",
    ],
  },
  {
    id: "joker",
    title: "Joker",
    summary: "Back yourself on a banker by doubling a single match's points.",
    items: [
      "A joker doubles whatever that match's prediction earns (stacks with the knockout ×1.5)",
      `${JOKERS_PER_STAGE.GROUP} jokers in the group stage, ${JOKERS_PER_STAGE.KNOCKOUT} in the knockouts`,
      "Set it before the match locks",
    ],
  },
  {
    id: "bracket",
    title: "Knockout bracket",
    summary: "Call who advances in each knockout tie. Later rounds are worth more.",
    items: roundPointsList,
  },
  {
    id: "groups",
    title: "Group standings",
    summary: "Rank the teams in each group from 1st to last.",
    items: [
      `${POINTS_PER_POSITION} pts for each team you place in its correct final position`,
      "Locks at the group's first kickoff; scored when the group finishes",
    ],
  },
  {
    id: "outrights",
    title: "Outrights",
    summary: "Big-picture calls for the whole tournament, locked before the opener.",
    items: [
      "Champion, Golden Boot, runner-up and more",
      "Each question has its own points value, shown on the Outrights page",
    ],
  },
  {
    id: "leaderboards",
    title: "Leaderboards",
    summary: "Your points from every game type add up across leagues and a global board.",
    items: [
      "Per-league boards (your friends) + one global board (everyone)",
      "Ties break by most exact scores, then who locked picks in earliest, then name",
    ],
  },
  {
    id: "locking",
    title: "When predictions lock",
    summary: "Pick early — everything locks before kickoff so nobody predicts with an advantage.",
    items: [
      `Matches lock ${LOCK_MINUTES} minutes before kickoff`,
      "Knockout ties open only once both teams are confirmed",
    ],
  },
  {
    id: "bots",
    title: "Bot rivals",
    summary: "Two house players compete in every league so there's always someone to beat.",
    items: [
      "Coco the Monkey 🐵 — picks at random",
      "The Analyst 🤖 — picks from a team-strength model",
    ],
  },
  {
    id: "leagues",
    title: "Leagues",
    summary: "Play privately with friends or against the world.",
    items: [
      "Create a league and share its 6-character code or one-tap invite link",
      "Join any number of leagues; bots join automatically",
    ],
  },
];

/** Builds the /llms.txt document (llmstxt.org style) from the same rules. */
export function buildLlmsTxt(baseUrl: string): string {
  const lines: string[] = [];
  lines.push("# Tribes — World Cup 2026 Prediction League");
  lines.push("");
  lines.push(
    "> Tribes is a free World Cup 2026 prediction game. Players predict match scores, knockout advancers, group standings and tournament outrights, earn points for accuracy, and compete on private-league and global leaderboards.",
  );
  lines.push("");
  lines.push("## Scoring & rules");
  for (const s of RULES) {
    lines.push(`### ${s.title}`);
    lines.push(s.summary);
    for (const item of s.items) lines.push(`- ${item}`);
    lines.push("");
  }
  lines.push("## Pages");
  lines.push(`- [Home](${baseUrl}/): dashboard and upcoming matches to predict`);
  lines.push(`- [Predict](${baseUrl}/predict): score predictions + jokers`);
  lines.push(`- [Bracket](${baseUrl}/bracket): knockout advancement picks`);
  lines.push(`- [Groups](${baseUrl}/groups): standings + group-order predictions`);
  lines.push(`- [Outrights](${baseUrl}/outrights): tournament-long questions`);
  lines.push(`- [Leagues](${baseUrl}/leagues): private leagues + invite links`);
  lines.push(`- [Global leaderboard](${baseUrl}/leaderboard)`);
  lines.push(`- [How it works](${baseUrl}/how-it-works): full rules`);
  lines.push("");
  lines.push("## Notes");
  lines.push("- Sign in with Google to play.");
  lines.push("- Fixtures/results come from the openfootball public dataset.");
  lines.push("");
  return lines.join("\n");
}
