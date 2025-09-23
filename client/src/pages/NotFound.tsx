import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0, color: "var(--accent)" }}>
        404
      </h1>
      <h2 style={{ margin: "1rem 0", color: "var(--text)" }}>Page Not Found</h2>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          background: "var(--accent)",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "16px",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
