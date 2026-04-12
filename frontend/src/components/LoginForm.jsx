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
      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "omit",
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      onSuccess(data);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Sign in to DormFix</h2>
      <div className="form-body">
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

