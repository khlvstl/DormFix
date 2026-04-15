import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import Dashboard from "./components/DashboardV2.jsx";
import RequestPage from "./components/RequestPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import SubmitRequestPage from "./components/SubmitRequestPage.jsx";
import GoogleLoginButton from "./components/GoogleLoginButton.jsx";

// ✅ Initialize Supabase once
const supabase = createClient(
  "https://YOUR_SUPABASE_PROJECT_REF.supabase.co",
  "YOUR_SUPABASE_ANON_KEY"
);

function App() {
  const [authView, setAuthView] = useState("login");
  const [page, setPage] = useState("overview");
  const [user, setUser] = useState(null);
  const [refreshRequests, setRefreshRequests] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("dormfix-user");
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        setUser(savedUser);
        setPage("overview");
      } catch {
        window.localStorage.removeItem("dormfix-user");
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setPage("overview");
    setAuthView("login");
    window.localStorage.setItem("dormfix-user", JSON.stringify(userData));
  };

  const handleLogout = async () => {
    if (supabase?.auth?.signOut) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setPage("overview");
    setAuthView("login");
    window.localStorage.removeItem("dormfix-user");
  };

  const refreshDashboardRequests = () => {
    setRefreshRequests((current) => !current);
  };

  const handleNavigate = (targetPage) => {
    const normalized = targetPage === "dashboard" ? "overview" : targetPage;
    setPage(normalized);
  };

  const handleRequestCreated = () => {
    refreshDashboardRequests();
    setPage("requests");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>DORMFIX</h1>
        {user && (
          <button className="link-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      <main className="app-main">
        {!user && (
          <section className="auth-card">
            <div className="auth-layout">
              <div className="auth-left">
                <div className="tabs">
                  <button
                    className={authView === "login" ? "tab active" : "tab"}
                    onClick={() => setAuthView("login")}
                  >
                    Login
                  </button>
                  <button
                    className={authView === "register" ? "tab active" : "tab"}
                    onClick={() => setAuthView("register")}
                  >
                    Register
                  </button>
                </div>

                {authView === "login" && (
                  <>
                    <LoginForm onSuccess={handleAuthSuccess} />
                    <GoogleLoginButton supabase={supabase} onSuccess={handleAuthSuccess} />
                  </>
                )}

                {authView === "register" && (
                  <RegisterForm onSuccess={handleAuthSuccess} />
                )}
              </div>

              <aside className="auth-right">
                <div className="logo-lockup">
                  <div className="logo-mark">
                    <div className="logo-roof" />
                    <div className="logo-body">
                      <span className="logo-dot" />
                    </div>
                  </div>
                  <div className="logo-text">
                    <span className="logo-name">DormFix</span>
                    <span className="logo-tagline">
                      Smart dorm maintenance hub
                    </span>
                  </div>
                </div>
                <p className="auth-description">
                  Enhancing dormitory living through a simple and efficient
                  maintenance reporting system that connects residents and
                  maintenance staff for faster issue resolution.
                </p>
              </aside>
            </div>
          </section>
        )}

        {user && page === "overview" && (
          <section className="dashboard-card">
            <Dashboard
              user={user}
              refreshKey={refreshRequests}
              onRefresh={refreshDashboardRequests}
              onNavigate={handleNavigate}
              onCreateRequest={() => handleNavigate("submit")}
              activeTab="overview"
            />
          </section>
        )}

        {user && page === "requests" && (
          <section className="dashboard-card">
            <RequestPage
              user={user}
              refreshKey={refreshRequests}
              onBack={() => handleNavigate("overview")}
            />
          </section>
        )}

        {user && page === "profile" && (
          <section className="dashboard-card">
            <ProfilePage user={user} onBack={() => handleNavigate("overview")} />
          </section>
        )}

        {user && page === "submit" && (
          <section className="dashboard-card">
            <SubmitRequestPage
              user={user}
              onCancel={() => handleNavigate("overview")}
              onCreated={handleRequestCreated}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;