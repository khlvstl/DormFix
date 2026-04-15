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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    const url = role === "resident"
      ? `http://localhost:8080/api/maintenance-requests/resident/${user.id}`
      : "http://localhost:8080/api/maintenance-requests";

    console.log(`Fetching requests for ${role}:`, url, "User ID:", user.id);

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
      console.log(`Fetched ${Array.isArray(data) ? data.length : 0} requests:`, data);
      setRequests(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Unable to load requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetchRequests();
    }, 500);
    return () => clearTimeout(timer);
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
        statusFilter === "PENDING" && (normalizedStatus === "PENDING" || normalizedStatus === "OPEN") ||
        statusFilter === "IN_PROGRESS" && (normalizedStatus.includes("IN_PROGRESS") || normalizedStatus.includes("IN PROGRESS")) ||
        statusFilter === "COMPLETED" && (normalizedStatus.includes("COMPLETED"))
      );

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const paginatedRequests = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const fetchRemarks = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/maintenance-requests/${requestId}/remarks`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch remarks");
        return;
      }

      const data = await parseJsonOrText(response);
      console.log("Fetched remarks:", data);
      setRemarks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching remarks:", err);
    }
  };

  const getStatusIcon = (status) => {
    const normalized = status?.toUpperCase() || "";
    if (normalized.includes("COMPLETED")) return "✓";
    if (normalized.includes("IN_PROGRESS")) return "🔧";
    return "⏳";
  };

  return (
    <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", fontWeight: 600 }}>
            Your Requests
          </p>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", color: "#0f172a" }}>Request Tracker</h2>
          <p style={{ margin: "0", color: "#64748b", maxWidth: "600px" }}>
            Review the status of each maintenance ticket and track updates in real-time.
          </p>
        </div>
        <button 
          className="secondary-btn" 
          onClick={onBack}
          style={{ padding: "0.75rem 1.5rem" }}
        >
          ← Back
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fee2e2", 
          color: "#991b1b", 
          borderRadius: "8px", 
          marginBottom: "1.5rem",
          border: "1px solid #fca5a5"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="🔍 Search by title, location, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">📊 All Statuses</option>
          <option value="PENDING">⏳ Pending</option>
          <option value="IN_PROGRESS">🔧 In Progress</option>
          <option value="COMPLETED">✓ Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrap">
          <table className="request-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Location</th>
                <th>Status</th>
                <th>Updated</th>
                {role !== "resident" && <th>Resident</th>}
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={role !== "resident" ? "6" : "5"} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    ⏳ Loading requests...
                  </td>
                </tr>
              )}
              {!loading && !filteredRequests.length && (
                <tr>
                  <td colSpan={role !== "resident" ? "6" : "5"} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No requests match this filter.
                  </td>
                </tr>
              )}
              {!loading && paginatedRequests.map((request) => (
                <tr key={request.id}>
                  <td style={{ fontWeight: 500 }}>📋 {request.title}</td>
                  <td>📍 {request.location}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(request.status)}`}>
                      {getStatusIcon(request.status)} {formatStatus(request.status)}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : "-"}
                  </td>
                  {role !== "resident" && (
                    <td style={{ fontSize: "0.875rem" }}>
                      {request.resident?.firstName || request.resident?.email || "—"}
                    </td>
                  )}
                  <td style={{ textAlign: "center" }}>
                    <button 
                      className="primary-btn" 
                      onClick={() => {
                        setSelectedRequest(request);
                        setRemarks([]);
                        fetchRemarks(request.id);
                      }}
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div style={{ marginTop: "2rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
            <div>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Request Details</p>
              <h3 style={{ margin: "0", fontSize: "1.5rem", color: "#0f172a" }}>📋 {selectedRequest.title}</h3>
            </div>
            <button 
              className="secondary-btn" 
              onClick={() => setSelectedRequest(null)}
            >
              ✕ Close
            </button>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Title</label>
              <p style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", margin: "0", color: "#0f172a" }}>
                {selectedRequest.title}
              </p>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Location</label>
              <p style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", margin: "0", color: "#0f172a" }}>
                📍 {selectedRequest.location}
              </p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Priority</label>
              <p style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", margin: "0", color: "#0f172a" }}>
                {selectedRequest.priority || "Not set"}
              </p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Status</label>
              <span className={`badge ${getBadgeClass(selectedRequest.status)}`}>
                {getStatusIcon(selectedRequest.status)} {formatStatus(selectedRequest.status)}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Description</label>
            <p style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", whiteSpace: "pre-wrap", margin: "0", color: "#0f172a", lineHeight: "1.6" }}>
              {selectedRequest.description}
            </p>
          </div>

          {selectedRequest.imageUrl && (
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Image</label>
              <img 
                src={selectedRequest.imageUrl} 
                alt="Request" 
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", color: "#64748b" }}>Created</label>
              <p style={{ fontSize: "0.875rem", color: "#0f172a", margin: "0" }}>
                {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "-"}
              </p>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", color: "#64748b" }}>Last Updated</label>
              <p style={{ fontSize: "0.875rem", color: "#0f172a", margin: "0" }}>
                {selectedRequest.updatedAt ? new Date(selectedRequest.updatedAt).toLocaleString() : "-"}
              </p>
            </div>
          </div>

          {remarks.length > 0 && (
            <div style={{ padding: "1.5rem", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
              <label style={{ display: "block", marginBottom: "1rem", fontWeight: 600, color: "#065f46" }}>💬 Staff Remarks</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {remarks.map((remark) => (
                  <div key={remark.id} style={{ padding: "1rem", backgroundColor: "#fff", borderRadius: "8px", borderLeft: "4px solid #10b981", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <strong style={{ color: "#065f46" }}>{remark.staff?.firstName} {remark.staff?.lastName}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {remark.createdAt ? new Date(remark.createdAt).toLocaleString() : "-"}
                      </span>
                    </div>
                    <p style={{ margin: "0", whiteSpace: "pre-wrap", fontSize: "0.875rem", color: "#0f172a", lineHeight: "1.6" }}>{remark.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default RequestPage;
