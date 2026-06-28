import React from "react";
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CrosswordGame } from "@/components/crossword/crossword-game";
import { placeholderCrosswordCompiledData } from "@/features/crossword/seed/placeholder-crossword";

describe("CrosswordGame", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lets the player select a cell, type, and backspace", async () => {
    const user = userEvent.setup();
    render(<CrosswordGame puzzle={placeholderCrosswordCompiledData} slug="test-puzzle" contentVersion={1} />);

    const firstPlayableCell = screen.getAllByRole("button", { name: /Row \d+, column \d+/i })[0];
    await user.click(firstPlayableCell);
    await user.keyboard("H");

    expect(firstPlayableCell).toHaveTextContent("H");

    await user.keyboard("{Backspace}");

    expect(firstPlayableCell).not.toHaveTextContent("H");
  });

  it("supports the touch keyboard for compact layouts", async () => {
    const user = userEvent.setup();
    render(<CrosswordGame puzzle={placeholderCrosswordCompiledData} slug="touch-puzzle" contentVersion={1} />);

    const firstPlayableCell = screen.getAllByRole("button", { name: /Row \d+, column \d+/i })[0];
    await user.click(firstPlayableCell);
    await user.click(screen.getByRole("button", { name: "H" }));

    expect(firstPlayableCell).toHaveTextContent("H");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(firstPlayableCell).not.toHaveTextContent("H");
  });

  it("updates the visible timer after the crossword starts", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T10:00:00.000Z"));

    render(<CrosswordGame puzzle={placeholderCrosswordCompiledData} slug="timer-puzzle" contentVersion={1} />);

    expect(screen.getAllByText("00:00").length).toBeGreaterThan(0);

    const firstPlayableCell = screen.getAllByRole("button", { name: /Row \d+, column \d+/i })[0];
    fireEvent.click(firstPlayableCell);
    fireEvent.keyDown(firstPlayableCell, { key: "H" });

    act(() => {
      vi.setSystemTime(new Date("2026-06-28T10:00:01.000Z"));
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getAllByText(/^00:0[1-9]$/).length).toBeGreaterThan(0);
  });
});
