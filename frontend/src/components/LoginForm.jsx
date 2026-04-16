import React, { useState } from "react";

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({ email, password })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = "Login failed";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      onSuccess(data);
    } catch (err) {
      console.error("Login error:", err);
      if (err.name === "AbortError") {
        setError("Request timeout. Please check your connection and try again.");
      } else if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setError("Unable to connect to server. Please ensure the backend is running on http://localhost:8080");
      } else {
        setError(err.message || "An error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Sign in to DormFix</h2>
      {error && (
        <div style={{
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          fontSize: "0.9rem",
          lineHeight: "1.5",
          width: "100%",
          boxSizing: "border-box"
        }}>
          ⚠️ {error}
        </div>
      )}
      <div className="form-body">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;

