"use client";

import { useEffect } from "react";

export function ClientSwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/service-worker.js");
  }, []);

  return null;
}

