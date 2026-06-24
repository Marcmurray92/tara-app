import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CrosswordGame } from "@/components/crossword/crossword-game";
import { placeholderCrosswordCompiledData } from "@/features/crossword/seed/placeholder-crossword";

describe("CrosswordGame", () => {
  it("lets the player select a cell, type, and backspace", async () => {
    const user = userEvent.setup();
    render(<CrosswordGame puzzle={placeholderCrosswordCompiledData} slug="test-puzzle" contentVersion={1} />);

    const firstPlayableCell = screen.getAllByLabelText(/Row 1, column 1/i)[0];
    await user.click(firstPlayableCell);
    await user.keyboard("H");

    expect(firstPlayableCell).toHaveTextContent("H");

    await user.keyboard("{Backspace}");

    expect(firstPlayableCell).not.toHaveTextContent("H");
  });

  it("supports the touch keyboard for compact layouts", async () => {
    const user = userEvent.setup();
    render(<CrosswordGame puzzle={placeholderCrosswordCompiledData} slug="touch-puzzle" contentVersion={1} />);

    const firstPlayableCell = screen.getAllByLabelText(/Row 1, column 1/i)[0];
    await user.click(firstPlayableCell);
    await user.click(screen.getByRole("button", { name: "H" }));

    expect(firstPlayableCell).toHaveTextContent("H");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(firstPlayableCell).not.toHaveTextContent("H");
  });
});
