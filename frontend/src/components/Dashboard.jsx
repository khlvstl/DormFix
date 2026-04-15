import React, { useState, useEffect, useMemo } from "react";

const parseJsonOrText = async (response) => {
  const text = await response.text();
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const StatusCard = ({ icon, label, value, status }) => (
  <div className={`status-card status-card-${status}`}>
    <div className="status-card-icon">{icon}</div>
    <div>
      <div className="status-card-title">{label}</div>
      <div className="status-card-value">{value}</div>
    </div>
  </div>
);

const RecentRequestsCard = ({ requests }) => (
  <div className="dashboard-section">
    <div className="section-header">
      <h3>📋 Recent Requests</h3>
    </div>
    {requests.length === 0 ? (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        No requests yet. Create one to get started!
      </div>
    ) : (
      <div className="recent-requests-list">
        {requests.slice(0, 5).map((request) => (
          <div key={request.id} className="request-item">
            <div className="request-item-content">
              <div className="request-title">📋 {request.title}</div>
              <div className="request-meta">
                <span>📍 {request.location}</span>
                <span className={`badge ${request.status?.toUpperCase() === "COMPLETED" ? "completed" : request.status?.toUpperCase().includes("IN_PROGRESS") ? "in-progress" : "pending"}`}>
                  {request.status?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Open"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const QuickActionsCard = ({ role, onSubmitRequest }) => {
  const actions = role === "resident" ? [
    { icon: "➕", label: "Create Request", color: "#3b82f6" },
    { icon: "📋", label: "View Requests", color: "#8b5cf6" },
    { icon: "💬", label: "Contact Staff", color: "#10b981" },
  ] : [
    { icon: "👥", label: "Assign Request", color: "#3b82f6" },
    { icon: "✏️", label: "Update Status", color: "#f59e0b" },
    { icon: "📊", label: "View All Requests", color: "#8b5cf6" },
  ];

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h3>⚡ Quick Actions</h3>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            className="action-btn"
            style={{ borderLeftColor: action.color }}
            onClick={role === "resident" && idx === 0 ? onSubmitRequest : undefined}
          >
            <div className="action-icon" style={{ color: action.color }}>{action.icon}</div>
            <div className="action-text">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

function Dashboard({ user, onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    const url = user?.role === "resident"
      ? `http://localhost:8080/api/maintenance-requests/resident/${user.id}`
      : "http://localhost:8080/api/maintenance-requests";

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorData = await parseJsonOrText(response).catch(() => null);
        throw new Error(errorData?.message || errorData || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonOrText(response);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Unable to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user?.id, user?.role]);

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

  const isResident = user?.role === "resident";

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.firstName}! 👋</h1>
          <p>{isResident ? "Manage your maintenance requests and track progress in real-time" : "Monitor and manage all resident maintenance requests"}</p>
        </div>
        <div className="header-avatar">
          <div className="avatar-circle">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-role">{user?.role?.toUpperCase()}</div>
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

      {/* Status Cards Grid */}
      <div className="stats-grid">
        <StatusCard icon="⏳" label="Pending" value={counts.pending} status="pending" />
        <StatusCard icon="🔧" label="In Progress" value={counts.inProgress} status="in-progress" />
        <StatusCard icon="✓" label="Completed" value={counts.completed} status="completed" />
        <StatusCard icon="📊" label="Total" value={counts.total} status="total" />
      </div>

      {/* Recent Requests and Quick Actions */}
      <div className="dashboard-grid">
        <RecentRequestsCard requests={requests} />
        <QuickActionsCard role={user?.role} onSubmitRequest={() => onNavigate?.("submit")} />
      </div>
    </div>
  );
}

export default Dashboard;