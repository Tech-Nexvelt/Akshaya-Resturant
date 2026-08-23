"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f14",
          color: "#f3ede2",
          fontFamily: "'Segoe UI', sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a15a" }}>
          Critical Error
        </p>
        <h1 style={{ fontSize: "1.75rem", margin: "1rem 0" }}>Akshaya hit a snag</h1>
        <p style={{ color: "#8a94a3", maxWidth: 420 }}>
          Something went wrong loading the site. Try reloading, or check back shortly.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "2rem",
            background: "#c9a15a",
            color: "#0b0f14",
            border: "none",
            borderRadius: 999,
            padding: "0.75rem 2rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
