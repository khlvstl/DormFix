// src/components/RegisterForm.jsx
import React, { useState } from "react";

function RegisterForm({ onSuccess }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("resident");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();

      if (onSuccess) onSuccess(data);

      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("resident");

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create an account</h2>
      <div className="form-body">
        {error && <div className="error">{error}</div>}

        <div className="grid-2">
          <label>
            First name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
            />
          </label>

          <label>
            Last name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
            />
          </label>
        </div>

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
            minLength={6}
          />
        </label>

        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="resident">Resident</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;