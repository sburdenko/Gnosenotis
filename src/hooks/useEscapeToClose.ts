"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `onClose` on Escape while `active` — the keyboard half of any
 * popover-like UI (an unfolded card overlay, a modal). Subscribes only
 * while something is actually open, so an idle board adds no listener.
 *
 * `onClose` goes through a ref so callers can pass an inline arrow without
 * the listener being torn down and re-added on every render.
 */
export function useEscapeToClose(active: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active]);
}
