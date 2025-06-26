"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("jwt", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 340, margin: "40px auto", background: "#f8fafc", padding: 32, borderRadius: 12, boxShadow: "0 2px 12px #0001" }}>
      <h2 style={{ marginBottom: 24, fontSize: 22, textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div style={{ color: "#b71c1c", marginTop: 8, textAlign: "center" }}>{error}</div>}
      </form>
      <div style={{ marginTop: 18, fontSize: 14, color: "#555", textAlign: "center" }}>
        <b>Demo:</b> admin / password
      </div>
    </div>
  );
} 