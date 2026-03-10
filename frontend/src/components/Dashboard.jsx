import React from "react";

function Dashboard({ user }) {
  return (
    <section className="card">
      <h2>Welcome, {user.firstName}!</h2>
      <p>
        You are logged in as <strong>{user.role}</strong> (
        <span>{user.email}</span>).
      </p>

      <div className="info">
        <p>
          This is a placeholder dashboard. Next steps could include:
        </p>
        <ul>
          <li>Residents: submit and track maintenance requests</li>
          <li>Staff: view and update assigned requests</li>
          <li>Admins: manage users and dorm data</li>
        </ul>
      </div>
    </section>
  );
}

export default Dashboard;

