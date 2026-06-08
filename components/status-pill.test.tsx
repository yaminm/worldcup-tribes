import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "@/components/status-pill";

describe("StatusPill", () => {
  it("shows LIVE for live matches", () => {
    render(<StatusPill status="LIVE" />);
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });

  it("shows FULL TIME for finished matches", () => {
    render(<StatusPill status="FINISHED" />);
    expect(screen.getByText("FULL TIME")).toBeInTheDocument();
  });

  it("shows UPCOMING for scheduled matches", () => {
    render(<StatusPill status="SCHEDULED" />);
    expect(screen.getByText("UPCOMING")).toBeInTheDocument();
  });
});
