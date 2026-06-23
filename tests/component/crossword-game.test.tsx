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

    const firstPlayableCell = screen.getByLabelText(/Row 1, column 1/i);
    await user.click(firstPlayableCell);
    await user.keyboard("H");

    expect(firstPlayableCell).toHaveTextContent("H");

    await user.keyboard("{Backspace}");

    expect(firstPlayableCell).not.toHaveTextContent("H");
  });
});
