import React, { useEffect, useMemo, useState } from "react";

const ROLE_CONFIG = {
  resident: {
    title: "Resident dashboard",
    subtitle: "View the latest request counts and submit a new maintenance report.",
    heroButtonLabel: "Create request",
    heroDescription: "Submit issues and follow their progress through the request page.",
  },
  staff: {
    title: "Staff dashboard",
    subtitle: "Monitor incoming requests and keep maintenance moving.",
    heroButtonLabel: "Refresh queue",
    heroDescription: "Use the request page to filter and track tickets in real time.",
  },
  admin: {
    title: "Admin dashboard",
    subtitle: "See request volume and manage dorm operations with confidence.",
    heroButtonLabel: "Refresh data",
    heroDescription: "Navigate to requests or profile to make changes and review status.",
  },
};

const DashboardHeader = ({ onNavigate = () => {}, activeTab = "dashboard", user, role, onCreateRequest, roleSettings }) => (
  <header className="dashboard-header">
    <div className="dashboard-header-top">
      <div className="brand-row">
        <div className="brand-mark">D</div>
        <div>
          <p className="eyebrow">DormFix</p>
          <h1>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
          <p className="hero-copy">{roleSettings.subtitle}</p>
        </div>
      </div>
      <div className="dashboard-actions">
        <button
          className={`nav-pill ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => onNavigate("overview")}
        >
          Overview
        </button>
        <button
          className={`nav-pill ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => onNavigate("requests")}
        >
          Requests
        </button>
        <button className="primary-btn" onClick={role === "resident" ? onCreateRequest : () => onNavigate("requests") }>
          {roleSettings.heroButtonLabel}
        </button>
      </div>
    </div>

  </header>
);

const StatsCards = ({ counts, role }) => (
  <div className="stats-grid">
    <article className="metric-card">
      <p className="metric-label">Open Requests</p>
      <h2>{counts.open}</h2>
      <p className="metric-note">Tickets awaiting maintenance</p>
    </article>
    <article className="metric-card">
      <p className="metric-label">In Progress</p>
      <h2>{counts.inProgress}</h2>
      <p className="metric-note">Requests currently active</p>
    </article>
    <article className="metric-card">
      <p className="metric-label">Completed</p>
      <h2>{counts.completed}</h2>
      <p className="metric-note">Requests resolved</p>
    </article>
    <article className="metric-card">
      <p className="metric-label">Total requests</p>
      <h2>{counts.total}</h2>
      <p className="metric-note">
        {role === "resident" ? "Your submitted tickets" : "Requests in the system"}
      </p>
    </article>
  </div>
);

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

function DashboardV2({ user, onCreateRequest, refreshKey, onNavigate, activeTab = "dashboard" }) {
  const firstName = user?.firstName || user?.email?.split("@")[0] || "Guest";
  const role = user?.role || "resident";
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const roleSettings = ROLE_CONFIG[role] || ROLE_CONFIG.resident;

  const fetchRequests = async () => {
    setLoadingRequests(true);
    setFetchError("");

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
    open: requests.filter((request) => {
      const status = request.status?.toUpperCase() || "";
      return status === "OPEN" || status === "NEW";
    }).length,
    inProgress: requests.filter((request) => {
      const status = request.status?.toUpperCase() || "";
      return status.includes("IN_PROGRESS") || status.includes("IN PROGRESS") || status.includes("PENDING") || status.includes("ASSIGNED");
    }).length,
    completed: requests.filter((request) => {
      const status = request.status?.toUpperCase() || "";
      return status.includes("COMPLETED") || status.includes("DONE") || status.includes("RESOLVED");
    }).length,
    total: requests.length,
  }), [requests]);

  return (
    <section className="dashboard-shell">
      {fetchError && <div className="error">{fetchError}</div>}
      <section className="profile-banner">
        <div className="profile-banner-text">
          <p className="eyebrow">Welcome back, {firstName}</p>
          <div className="profile-banner-user">
            <span className="user-role">{role}</span>
            <strong>{user.email}</strong>
          </div>
        </div>
        <button className="secondary-btn profile-btn" onClick={() => onNavigate("profile")}>Profile</button>
      </section>
      <DashboardHeader
        activeTab={activeTab}
        onNavigate={onNavigate}
        user={user}
        role={role}
        onCreateRequest={onCreateRequest}
        roleSettings={roleSettings}
      />

      <StatsCards counts={counts} role={role} />
    </section>
  );
}

export default DashboardV2;
