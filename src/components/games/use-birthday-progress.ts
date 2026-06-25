"use client";

import { useEffect, useState } from "react";

import { readBirthdayProgressSnapshot } from "@/features/games/birthday-progress";
import { BIRTHDAY_PROGRESS_EVENT } from "@/features/games/progress-events";

export function useBirthdayProgress() {
  const [snapshot, setSnapshot] = useState(() => readBirthdayProgressSnapshot());

  useEffect(() => {
    function syncSnapshot() {
      setSnapshot(readBirthdayProgressSnapshot());
    }

    syncSnapshot();
    window.addEventListener("focus", syncSnapshot);
    window.addEventListener("storage", syncSnapshot);
    window.addEventListener(BIRTHDAY_PROGRESS_EVENT, syncSnapshot);

    return () => {
      window.removeEventListener("focus", syncSnapshot);
      window.removeEventListener("storage", syncSnapshot);
      window.removeEventListener(BIRTHDAY_PROGRESS_EVENT, syncSnapshot);
    };
  }, []);

  return snapshot;
}
