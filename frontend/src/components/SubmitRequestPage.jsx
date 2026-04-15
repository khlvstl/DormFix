import React, { useState, useEffect } from "react";

function SubmitRequestPage({ user, onCancel, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successTime, setSuccessTime] = useState(null);

  // Auto-navigate to requests after successful submission
  useEffect(() => {
    if (successTime) {
      const timer = setTimeout(() => {
        console.log("Auto-navigating to requests...");
        if (onCreated) onCreated({});
      }, 2000); // 2 seconds delay
      return () => clearTimeout(timer);
    }
  }, [successTime, onCreated]);

  const parseJsonOrText = async (response) => {
    const text = await response.text();
    if (!text) return "";

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Validate user ID
    if (!user?.id) {
      setError("Error: User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      location,
      status: "PENDING",
      priority,
      imageUrl: imageUrl || null,
      resident: {
        id: user.id,
      },
    };

    console.log("Submitting request with payload:", payload, "User ID:", user.id);

    try {
      const response = await fetch("http://localhost:8080/api/maintenance-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await parseJsonOrText(response).catch(() => null);
        throw new Error(errorData?.message || errorData || `HTTP ${response.status}: ${response.statusText}`);
      }

      const created = await parseJsonOrText(response);
      console.log("Request created successfully:", created);
      setSuccessMessage("Request submitted successfully! Redirecting to your requests...");
      setSuccessTime(Date.now()); // Trigger auto-navigation
      setTitle("");
      setDescription("");
      setLocation("");
      setPriority("Medium");
      setImageUrl("");

      if (onCreated) onCreated(created);
    } catch (err) {
      console.error("Error submitting request:", err);
      setError(err.message || "Unable to submit request at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <p className="eyebrow">New maintenance request</p>
          <h2>Submit a request</h2>
          <p className="hero-copy">
            Share the issue details and location so staff can respond faster.
          </p>
        </div>
        <div>
          <button className="secondary-btn" onClick={onCancel}>
            Back to dashboard
          </button>
        </div>
      </div>

      <section className="panel-card">
        <form className="form-body" onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          {successMessage && <div className="info">{successMessage}</div>}

          <div className="grid-2">
            <label>
              Request title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Leaky faucet, broken light, etc."
              />
            </label>
            <label>
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Room 203, Floor 2, Common area"
              />
            </label>
          </div>

          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Describe the issue in detail so the maintenance team can respond quickly."
            />
          </label>

          <label>
            Image URL (optional)
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </label>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit request"}
            </button>
            <button type="button" className="secondary-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default SubmitRequestPage;
