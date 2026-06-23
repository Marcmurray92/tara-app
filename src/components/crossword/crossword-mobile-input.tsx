import type { RefObject } from "react";

export function CrosswordMobileInput({
  inputRef,
  onInput,
  onKeyDown
}: {
  inputRef: RefObject<HTMLInputElement>;
  onInput: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      ref={inputRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0"
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      inputMode="text"
      maxLength={1}
      onChange={(event) => {
        onInput(event.target.value);
        event.target.value = "";
      }}
      onKeyDown={onKeyDown}
    />
  );
}

