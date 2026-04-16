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
  if (normalized.includes("IN_PROGRESS")) return "in-progress";
  return "pending";
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getPriorityColor = (priority) => {
  if (!priority) return { bg: "#fef3c7", text: "#92400e" };
  const normalized = priority.toLowerCase();
  if (normalized === "high") return { bg: "#fee2e2", text: "#991b1b" };
  if (normalized === "low") return { bg: "#dcfce7", text: "#166534" };
  return { bg: "#fef3c7", text: "#92400e" };
};

const getStatusIcon = (status) => {
  const normalized = status?.toUpperCase() || "";
  if (normalized.includes("COMPLETED")) return "✓";
  if (normalized.includes("IN_PROGRESS")) return "🔧";
  return "⏳";
};

function StaffManagementPage({ user, onBack }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [remark, setRemark] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [addingRemark, setAddingRemark] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/maintenance-requests", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await parseJsonOrText(response).catch(() => null);
        throw new Error(errorData?.message || errorData || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonOrText(response);
      console.log("Fetched requests:", data);
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
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !lowered ||
        request.title?.toLowerCase().includes(lowered) ||
        request.description?.toLowerCase().includes(lowered) ||
        request.location?.toLowerCase().includes(lowered) ||
        request.resident?.firstName?.toLowerCase().includes(lowered) ||
        request.resident?.email?.toLowerCase().includes(lowered);

      const normalizedStatus = request.status?.toUpperCase() || "";
      const matchesStatus = !statusFilter || (
        statusFilter === "PENDING" && (normalizedStatus === "PENDING" || normalizedStatus === "OPEN") ||
        statusFilter === "IN_PROGRESS" && (normalizedStatus.includes("IN_PROGRESS") || normalizedStatus.includes("IN PROGRESS")) ||
        statusFilter === "COMPLETED" && (normalizedStatus === "COMPLETED")
      );

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const paginatedRequests = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const counts = useMemo(() => ({
    pending: requests.filter((r) => {
      const status = r.status?.toUpperCase() || "";
      return status === "PENDING" || status === "OPEN";
    }).length,
    inProgress: requests.filter((r) => {
      const status = r.status?.toUpperCase() || "";
      return status === "IN_PROGRESS" || status.includes("IN PROGRESS");
    }).length,
    completed: requests.filter((r) => {
      const status = r.status?.toUpperCase() || "";
      return status === "COMPLETED";
    }).length,
    total: requests.length,
  }), [requests]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedRequest) return;

    setUpdating(true);
    setUpdateError("");

    try {
      const response = await fetch(`http://localhost:8080/api/maintenance-requests/${selectedRequest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          title: selectedRequest.title,
          description: selectedRequest.description,
          location: selectedRequest.location,
          status: newStatus,
          priority: selectedRequest.priority,
          imageUrl: selectedRequest.imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await parseJsonOrText(response).catch(() => null);
        throw new Error(errorData?.message || errorData || `HTTP ${response.status}: ${response.statusText}`);
      }

      const updated = await parseJsonOrText(response);
      setSelectedRequest(updated);
      setRequests(requests.map(r => r.id === updated.id ? updated : r));
      setUpdateError("");
    } catch (err) {
      console.error("Error updating status:", err);
      setUpdateError(err.message || "Unable to update status.");
    } finally {
      setUpdating(false);
    }
  };

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

  const handleAddRemarkNew = async () => {
    if (!remark.trim()) {
      setUpdateError("Remark cannot be empty.");
      return;
    }

    if (!selectedRequest || !user) {
      setUpdateError("Unable to add remark: missing request or user information.");
      return;
    }

    setAddingRemark(true);
    setUpdateError("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/maintenance-requests/${selectedRequest.id}/remarks?staffId=${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ content: remark }),
        }
      );

      if (!response.ok) {
        const errorData = await parseJsonOrText(response).catch(() => null);
        throw new Error(errorData?.message || errorData || `HTTP ${response.status}: ${response.statusText}`);
      }

      const newRemark = await parseJsonOrText(response);
      console.log("Remark added:", newRemark);
      
      setRemarks([...remarks, newRemark]);
      setRemark("");
      setUpdateError("");
    } catch (err) {
      console.error("Error adding remark:", err);
      setUpdateError(err.message || "Unable to add remark.");
    } finally {
      setAddingRemark(false);
    }
  };

  return (
    <div className="dashboard-container">
      <button className="back-button" onClick={() => onBack?.()}>
        <span>←</span> Back to home
      </button>

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Staff Dashboard 📋</h1>
          <p>Monitor and manage all resident maintenance requests with ease</p>
        </div>
        <div className="header-avatar">
          <div className="avatar-circle">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-role">STAFF</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
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

      {/* Status Cards */}
      <div className="stats-grid">
        <div className="status-card status-card-pending">
          <div className="status-card-icon">⏳</div>
          <div>
            <div className="status-card-title">Pending</div>
            <div className="status-card-value">{counts.pending}</div>
          </div>
        </div>
        <div className="status-card status-card-in-progress">
          <div className="status-card-icon">🔧</div>
          <div>
            <div className="status-card-title">In Progress</div>
            <div className="status-card-value">{counts.inProgress}</div>
          </div>
        </div>
        <div className="status-card status-card-completed">
          <div className="status-card-icon">✓</div>
          <div>
            <div className="status-card-title">Completed</div>
            <div className="status-card-value">{counts.completed}</div>
          </div>
        </div>
        <div className="status-card status-card-total">
          <div className="status-card-icon">📊</div>
          <div>
            <div className="status-card-title">Total</div>
            <div className="status-card-value">{counts.total}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="section-divider">
        <h2 style={{ marginTop: 0 }}>Recent Requests</h2>
      </div>

      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="🔍 Search by title, location, resident name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          style={{ flex: 1, minWidth: "300px" }}
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
                <th>Resident</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    ⏳ Loading requests...
                  </td>
                </tr>
              )}
              {!loading && !filteredRequests.length && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No requests match this filter.
                  </td>
                </tr>
              )}
              {!loading && paginatedRequests.map((request) => (
                <tr key={request.id}>
                  <td style={{ fontWeight: 500 }}>📋 {request.title}</td>
                  <td style={{ fontSize: "0.875rem" }}>
                    <div><strong>{request.resident?.firstName} {request.resident?.lastName}</strong></div>
                    <div style={{ color: "#64748b", fontSize: "0.8rem" }}>📧 {request.resident?.email}</div>
                  </td>
                  <td>📍 {request.location}</td>
                  <td>
                    <span style={{ 
                      padding: "0.35rem 0.75rem", 
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      backgroundColor: getPriorityColor(request.priority).bg,
                      color: getPriorityColor(request.priority).text,
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                      display: "inline-block"
                    }}>
                      {request.priority || "Medium"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(request.status)}`}>
                      {getStatusIcon(request.status)} {formatStatus(request.status)}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.875rem" }}>
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button 
                      className="primary-btn" 
                      onClick={() => {
                        setSelectedRequest(request);
                        setRemarks([]);
                        setRemark("");
                        setUpdateError("");
                        fetchRemarks(request.id);
                      }}
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      Manage
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              return start + i;
            }).map((page) => (
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

          {updateError && (
            <div style={{ 
              padding: "1rem", 
              backgroundColor: "#fee2e2", 
              color: "#991b1b", 
              borderRadius: "8px", 
              marginBottom: "1.5rem",
              border: "1px solid #fca5a5"
            }}>
              ⚠️ {updateError}
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Resident</label>
              <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#0f172a" }}>
                <div style={{ fontWeight: 600 }}>{selectedRequest.resident?.firstName} {selectedRequest.resident?.lastName}</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>📧 {selectedRequest.resident?.email}</div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Status</label>
              <select 
                value={selectedRequest.status || "PENDING"}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                disabled={updating}
                style={{ 
                  width: "100%", 
                  padding: "0.75rem", 
                  borderRadius: "8px", 
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#0f172a",
                  cursor: updating ? "not-allowed" : "pointer",
                  opacity: updating ? 0.6 : 1
                }}
              >
                <option value="PENDING">⏳ Pending</option>
                <option value="IN_PROGRESS">🔧 In Progress</option>
                <option value="COMPLETED">✓ Completed</option>
              </select>
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
                <span style={{ 
                  padding: "0.35rem 0.75rem", 
                  borderRadius: "20px",
                  fontWeight: "600",
                  backgroundColor: getPriorityColor(selectedRequest.priority).bg,
                  color: getPriorityColor(selectedRequest.priority).text,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  display: "inline-block"
                }}>
                  {selectedRequest.priority || "Medium"}
                </span>
              </p>
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
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", border: "1px solid #e2e8f0", maxHeight: "300px" }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
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

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem", color: "#64748b" }}>Assigned To</label>
              <p style={{ fontSize: "0.875rem", color: "#0f172a", margin: "0" }}>
                {selectedRequest.assignedStaff ? `${selectedRequest.assignedStaff?.firstName} ${selectedRequest.assignedStaff?.lastName}` : "Unassigned"}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>💬 Add Remarks</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add internal notes or status updates..."
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                color: "#0f172a",
                boxSizing: "border-box",
                resize: "vertical",
                minHeight: "100px"
              }}
            />
            <button 
              className="primary-btn"
              onClick={handleAddRemarkNew}
              disabled={addingRemark}
              style={{ marginTop: "0.75rem" }}
            >
              {addingRemark ? "Adding..." : "✓ Add Remark"}
            </button>
          </div>

          {remarks.length > 0 && (
            <div style={{ padding: "1.5rem", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
              <label style={{ display: "block", marginBottom: "1rem", fontWeight: 600, color: "#065f46" }}>📝 Remarks History ({remarks.length})</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {remarks.map((remark) => (
                  <div key={remark.id} style={{ padding: "1rem", backgroundColor: "#fff", borderRadius: "8px", borderLeft: "4px solid #10b981", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <strong style={{ color: "#065f46" }}>👤 {remark.staff?.firstName} {remark.staff?.lastName}</strong>
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
    </div>
  );
}

export default StaffManagementPage;
