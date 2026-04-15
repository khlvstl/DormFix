import React from "react";

function Sidebar({ user, activePage, onNavigate, onLogout }) {
  const role = user?.role || "resident";
  
  const residentItems = [
    { id: "overview", label: "Dashboard", icon: "📊" },
    { id: "requests", label: "My Requests", icon: "📋" },
    { id: "submit", label: "Create Request", icon: "➕" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const staffItems = [
    { id: "overview", label: "Dashboard", icon: "📊" },
    { id: "staff-management", label: "Manage Requests", icon: "📋" },
    { id: "assign-requests", label: "Assign Tasks", icon: "👥" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const menuItems = role === "staff" ? staffItems : residentItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-mark-small">D</div>
          <span>DormFix</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
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
}

export default Sidebar;
