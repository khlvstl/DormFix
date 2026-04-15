import React from "react";

function ProfilePage({ user, onBack }) {
  const details = [
    { label: "Full name", value: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "N/A" },
    { label: "Email", value: user?.email || "N/A" },
    { label: "Role", value: user?.role || "N/A" },
    { label: "Phone", value: user?.phone || "Not provided" },
    { label: "Room", value: user?.room || "Not assigned" },
  ];

  return (
    <section className="dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <p className="eyebrow">Your profile</p>
          <h2>Resident details</h2>
          <p className="hero-copy">Keep your contact and room information up to date here.</p>
        </div>
        <div>
          <button className="secondary-btn" onClick={onBack}>
            Back to dashboard
          </button>
        </div>
      </div>

      <section className="panel-card">
        <div className="profile-grid">
          {details.map((item) => (
            <div key={item.label} className="profile-row">
              <span className="profile-label">{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default ProfilePage;
