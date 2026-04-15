import React, { useEffect, useMemo, useState } from "react";

const ROLE_CONFIG = {
  resident: {
    title: "Resident Dashboard",
    subtitle: "Manage your maintenance requests and track their progress",
    navItems: [
      { label: "Dashboard", icon: "📊", id: "overview" },
      { label: "My Requests", icon: "📋", id: "requests" },
      { label: "Create Request", icon: "➕", id: "submit" },
      { label: "Notifications", icon: "🔔", id: "notifications" },
      { label: "Profile", icon: "👤", id: "profile" },
      { label: "Settings", icon: "⚙️", id: "settings" },
    ],
    quickActions: [
      { label: "Create Request", icon: "➕", action: "create" },
      { label: "View Requests", icon: "📋", action: "view" },
      { label: "Contact Staff", icon: "💬", action: "contact" },
    ],
  },
  staff: {
    title: "Staff Dashboard",
    subtitle: "Monitor and manage resident maintenance requests",
    navItems: [
      { label: "Dashboard", icon: "📊", id: "overview" },
      { label: "Manage Requests", icon: "📝", id: "requests" },
      { label: "Assign Requests", icon: "👥", id: "assign" },
      { label: "Reports", icon: "📈", id: "reports" },
      { label: "Profile", icon: "👤", id: "profile" },
      { label: "Settings", icon: "⚙️", id: "settings" },
    ],
    quickActions: [
      { label: "Assign Request", icon: "👥", action: "assign" },
      { label: "Update Status", icon: "✏️", action: "update" },
      { label: "View All", icon: "📋", action: "view" },
    ],
  },
};

const Sidebar = ({ role, onNavigate, currentTab, onLogout }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.resident;
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-mark-small">DF</div>
          <span>DormFix</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {config.navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentTab === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

const ProfileBanner = ({ user, role, onNavigate }) => {
  const firstName = user?.firstName || user?.email?.split("@")[0] || "Guest";
  
  return (
    <div className="profile-banner">
      <div className="profile-banner-text">
        <p className="eyebrow">Welcome back, {firstName}</p>
        <div className="profile-banner-user">
          <span className="user-role">{role.toUpperCase()}</span>
          <strong>{user.email}</strong>
        </div>
      </div>
      <button className="secondary-btn profile-btn" onClick={() => onNavigate("profile")}>
        👤 View Profile
      </button>
    </div>
  );
};

const StatusCard = ({ icon, label, value, status, percentage }) => {
  const statusClass = `status-card status-card-${status}`;
  
  return (
    <div className={statusClass}>
      <div className="status-card-icon">{icon}</div>
      <div>
        <div className="status-card-title">{label}</div>
        <div className="status-card-value">{value}</div>
        <div className="metric-progress">
          <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const StatsCards = ({ counts, role }) => {
  const total = Math.max(counts.total, 1);
  
  return (
    <div className="stats-grid">
      <StatusCard 
        icon="⏳" 
        label="Pending" 
        value={counts.open} 
        status="pending"
        percentage={(counts.open / total) * 100}
      />
      <StatusCard 
        icon="🔧" 
        label="In Progress" 
        value={counts.inProgress} 
        status="in-progress"
        percentage={(counts.inProgress / total) * 100}
      />
      <StatusCard 
        icon="✓" 
        label="Completed" 
        value={counts.completed} 
        status="completed"
        percentage={(counts.completed / total) * 100}
      />
      <StatusCard 
        icon="📊" 
        label="Total" 
        value={counts.total} 
        status="total"
        percentage={100}
      />
    </div>
  );
};

const RecentRequests = ({ requests, role, onViewDetails }) => {
  const displayRequests = requests.slice(0, 5);
  
  if (displayRequests.length === 0) {
    return (
      <div className="recent-requests">
        <div className="section-header">
          <h3>📋 Recent Requests</h3>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
          No requests yet. {role === "resident" ? "Create one to get started!" : ""}
        </div>
      </div>
    );
  }

  return (
    <div className="recent-requests">
      <div className="section-header">
        <h3>📋 Recent Requests</h3>
      </div>
      <div className="request-list">
        {displayRequests.map((request) => (
          <div key={request.id} className="request-item">
            <div className="request-info">
              <p className="request-title">{request.title}</p>
              <div className="request-meta">
                <span>📍 {request.location}</span>
                <span>
                  {request.status?.toUpperCase() === "COMPLETED" ? "✓" : 
                   request.status?.toUpperCase().includes("IN_PROGRESS") ? "🔧" : "⏳"}
                  {" "}
                  {request.status?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Open"}
                </span>
              </div>
            </div>
            <button 
              className="secondary-btn" 
              onClick={() => onViewDetails(request)}
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuickActions = ({ role, onNavigate, onCreateRequest }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.resident;
  
  const handleAction = (action) => {
    if (action === "create") {
      onCreateRequest();
    } else if (action === "view") {
      onNavigate("requests");
    } else if (action === "assign" || action === "update") {
      onNavigate("staff-management");
    } else if (action === "contact") {
      onNavigate("profile");
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>⚡ Quick Actions</h3>
      <div className="quick-actions">
        {config.quickActions.map((action, idx) => (
          <div 
            key={idx}
            className="action-card"
            onClick={() => handleAction(action.action)}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-label">{action.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const parseJsonOrText = async (response) => {
  const text = await response.text();
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

function DashboardV2({ user, onCreateRequest, refreshKey, onNavigate, activeTab = "overview", onLogout }) {
  const role = user?.role || "resident";
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.resident;

  const fetchRequests = async () => {
    setLoadingRequests(true);
    setFetchError("");

    const url = role === "resident"
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
    } catch (error) {
      setFetchError(error.message || "Unable to fetch requests.");
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchRequests();
  }, [user?.id, role, refreshKey]);

  const counts = useMemo(() => ({
    open: requests.filter((r) => {
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

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={role} onNavigate={onNavigate} currentTab={activeTab} onLogout={onLogout} />
      
      <div className="dashboard-content" style={{ marginLeft: "260px", width: "calc(100% - 260px)" }}>
        {fetchError && <div className="error">{fetchError}</div>}
        
        <ProfileBanner user={user} role={role} onNavigate={onNavigate} />
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", color: "#0f172a" }}>
            {config.title}
          </h1>
          <p style={{ margin: "0 0 1.5rem", color: "#64748b", maxWidth: "600px" }}>
            {config.subtitle}
          </p>

          <StatsCards counts={counts} role={role} />

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <RecentRequests 
              requests={requests} 
              role={role}
              onViewDetails={(req) => onNavigate("requests")}
            />
            
            <QuickActions 
              role={role} 
              onNavigate={onNavigate} 
              onCreateRequest={onCreateRequest}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardV2;
