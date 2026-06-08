import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopyCode } from "@/components/copy-code";

describe("CopyCode", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  it("renders the code", () => {
    render(<CopyCode code="DEMO01" />);
    expect(screen.getByText("DEMO01")).toBeInTheDocument();
  });

  it("copies the code on click", async () => {
    render(<CopyCode code="DEMO01" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("DEMO01");
    });
  });
});
