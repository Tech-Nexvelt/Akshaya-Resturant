"use client";

import { useEffect } from "react";

/**
 * ProductionProtection component
 * Disables DevTools inspect shortcuts, right-click context menu,
 * and console logging ONLY in production / deployed environments.
 * Leaves localhost / development environment completely untouched.
 */
export function ProductionProtection() {
  useEffect(() => {
    // Only apply protection on production / non-localhost environments
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local"));

    if (isLocalhost || process.env.NODE_ENV !== "production") {
      return;
    }

    // 1. Suppress all console output in production
    const noop = () => {};
    window.console.log = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.info = noop;
    window.console.debug = noop;

    // 2. Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 3. Disable Inspect Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Opt+I/J)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAltOrOpt = e.altKey;

      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      if (isCmdOrCtrl) {
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect / Console)
        if (
          isShift &&
          (e.key === "I" ||
            e.key === "i" ||
            e.key === "J" ||
            e.key === "j" ||
            e.key === "C" ||
            e.key === "c")
        ) {
          e.preventDefault();
          return false;
        }

        // Cmd+Option+I or Cmd+Option+J on Mac
        if (
          isAltOrOpt &&
          (e.key === "I" ||
            e.key === "i" ||
            e.key === "J" ||
            e.key === "j" ||
            e.key === "C" ||
            e.key === "c")
        ) {
          e.preventDefault();
          return false;
        }

        // Ctrl+U / Cmd+U (View Source)
        if (e.key === "U" || e.key === "u") {
          e.preventDefault();
          return false;
        }
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
