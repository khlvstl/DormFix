import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js"; // ✅ Add this
import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import Dashboard from "./components/Dashboard.jsx";
import GoogleLoginButton from "./components/GoogleLoginButton.jsx";

// ✅ Initialize Supabase once
const supabase = createClient(
  "https://YOUR_SUPABASE_PROJECT_REF.supabase.co",
  "YOUR_SUPABASE_ANON_KEY"
);

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setView("dashboard");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); // ✅ Optional: log out from Supabase
    setUser(null);
    setView("login");
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
                    className={view === "login" ? "tab active" : "tab"}
                    onClick={() => setView("login")}
                  >
                    Login
                  </button>
                  <button
                    className={view === "register" ? "tab active" : "tab"}
                    onClick={() => setView("register")}
                  >
                    Register
                  </button>
                </div>

                {view === "login" && (
                  <>
                    <LoginForm supabase={supabase} onSuccess={handleAuthSuccess} />
                    <GoogleLoginButton supabase={supabase} onSuccess={handleAuthSuccess} />
                  </>
                )}

                {view === "register" && (
                  <RegisterForm supabase={supabase} onSuccess={handleAuthSuccess} />
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

        {user && (
          <section className="dashboard-card">
            <Dashboard user={user} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;