import React, { useEffect, useMemo, useState } from "react";

const parseJsonOrText = async (response) => {
  const text = await response.text();
  if (!text) return "";

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getBadgeClass = (status) => {
  if (!status) return "pending";
  const normalized = status.toUpperCase();
  if (normalized.includes("COMPLETED")) return "completed";
  if (normalized.includes("IN_PROGRESS") || normalized.includes("IN PROGRESS")) return "in-progress";
  return "pending";
};

const formatStatus = (status) => {
  if (!status) return "Open";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function RequestPage({ user, onBack, refreshKey }) {
  const role = user?.role || "resident";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    const url = role === "resident"
      ? `http://localhost:8080/api/maintenance-requests/resident/${user.id}`
      : "http://localhost:8080/api/maintenance-requests";

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await parseJsonOrText(response).catch(() => null);
        throw new Error(errorData?.message || errorData || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonOrText(response);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchRequests();
  }, [user?.id, role, refreshKey]);

  const filteredRequests = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !lowered ||
        request.title?.toLowerCase().includes(lowered) ||
        request.description?.toLowerCase().includes(lowered) ||
        request.location?.toLowerCase().includes(lowered);

      const normalizedStatus = request.status?.toUpperCase() || "";
      const matchesStatus = !statusFilter || (
        statusFilter === "OPEN" && (normalizedStatus === "OPEN" || normalizedStatus === "NEW") ||
        statusFilter === "IN_PROGRESS" && (normalizedStatus.includes("IN_PROGRESS") || normalizedStatus.includes("IN PROGRESS") || normalizedStatus.includes("PENDING") || normalizedStatus.includes("ASSIGNED")) ||
        statusFilter === "COMPLETED" && (normalizedStatus.includes("COMPLETED") || normalizedStatus.includes("DONE") || normalizedStatus.includes("RESOLVED"))
      );

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  return (
    <section className="dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <p className="eyebrow">Your requests</p>
          <h2>Request tracker</h2>
          <p className="hero-copy">Review the status of each maintenance ticket and refresh to see updates.</p>
        </div>
        <div className="hero-actions">
          <button className="secondary-btn" onClick={onBack}>
            Back to dashboard
          </button>
          <button className="primary-btn" onClick={fetchRequests}>
            Refresh
          </button>
        </div>
      </div>

      <section className="panel-card">
        {error && <div className="error">{error}</div>}
        <div className="filter-actions" style={{ gap: "0.8rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="request-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Location</th>
                <th>Status</th>
                <th>Updated</th>
                {role !== "resident" && <th>Resident</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={role !== "resident" ? "5" : "4"}>Loading requests...</td>
                </tr>
              )}
              {!loading && !filteredRequests.length && (
                <tr>
                  <td colSpan={role !== "resident" ? "5" : "4"}>No requests match this filter.</td>
                </tr>
              )}
              {!loading && filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.title}</td>
                  <td>{request.location}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(request.status)}`}>
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td>{request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : "-"}</td>
                  {role !== "resident" && (
                    <td>{request.resident?.firstName || request.resident?.email || "—"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default RequestPage;
