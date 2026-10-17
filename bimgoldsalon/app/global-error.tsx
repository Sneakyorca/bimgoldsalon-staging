"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          color: "#141414",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>Something went wrong</h1>
          <p>Please try again.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "12px 32px",
              borderRadius: 999,
              border: 0,
              background: "#00174b",
              color: "#fff",
              fontSize: 16,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
