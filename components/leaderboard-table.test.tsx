import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaderboardTable } from "@/components/leaderboard-table";
import type { LeaderboardRow } from "@/lib/leaderboard";

const rows: LeaderboardRow[] = [
  {
    userId: "u1",
    name: "Alice",
    image: null,
    points: 16,
    exactHits: 1,
    predictions: 2,
    lastSubmittedAt: 1,
    rank: 1,
  },
  {
    userId: "u2",
    name: "Bob",
    image: null,
    points: 6,
    exactHits: 0,
    predictions: 2,
    lastSubmittedAt: 2,
    rank: 2,
  },
];

describe("LeaderboardTable", () => {
  it("renders all members with points", () => {
    render(<LeaderboardTable rows={rows} currentUserId="u2" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("flags the current user", () => {
    render(<LeaderboardTable rows={rows} currentUserId="u2" />);
    expect(screen.getByText("you")).toBeInTheDocument();
  });

  it("shows an empty state with no rows", () => {
    render(<LeaderboardTable rows={[]} currentUserId="u2" />);
    expect(screen.getByText("No members yet.")).toBeInTheDocument();
  });
});
