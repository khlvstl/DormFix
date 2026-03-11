import React from "react";

function Dashboard({ user }) {

  const renderResidentDashboard = () => (
    <>
      <nav className="navbar">
        <span>DormFix</span>
        <div>
          <button>Dashboard</button>
          <button>Profile</button>
          <button>Logout</button>
        </div>
      </nav>

      <h2>Resident Dashboard</h2>

      <button className="primary-btn">Submit Maintenance Request</button>

      <h3>Your Maintenance Requests</h3>

      <table className="request-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Broken Light</td>
            <td>Room 203</td>
            <td>
              <span className="badge pending">Pending</span>
            </td>
            <td>
              <button>View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );

  const renderStaffDashboard = () => (
    <>
      <nav className="navbar">
        <span>DormFix</span>
        <div>
          <button>Dashboard</button>
          <button>Profile</button>
          <button>Logout</button>
        </div>
      </nav>

      <h2>Staff Dashboard</h2>

      <div className="filters">
        <input type="text" placeholder="Search request..." />
        <select>
          <option value="">Filter by Status</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>

      <table className="request-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Status</th>
            <th>Update Status</th>
            <th>Remarks</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Broken Light</td>
            <td>Room 203</td>
            <td>
              <span className="badge pending">Pending</span>
            </td>

            <td>
              <select>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </td>

            <td>
              <button>Add Remarks</button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );

  return (
    <section className="card">
      <h2>Welcome, {user.firstName}!</h2>
      <p>
        Logged in as <strong>{user.role}</strong> ({user.email})
      </p>

      {user.role === "resident" && renderResidentDashboard()}
      {user.role === "staff" && renderStaffDashboard()}
    </section>
  );
}

export default Dashboard;