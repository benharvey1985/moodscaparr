"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "8px" }}>
              Critical error
            </h1>
            <p style={{ color: "#666", marginBottom: "16px", fontSize: "0.875rem" }}>
              {error?.message || "A critical error occurred"}
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#000",
                color: "#fff",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
