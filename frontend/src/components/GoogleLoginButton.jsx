import React, { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function GoogleLoginButton({ onSuccess }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google client ID not configured.");
      return;
    }

    function initialize() {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await fetch("/api/users/google-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: response.credential })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
              throw new Error(data.message || "Google login failed");
            }

            onSuccess(data);
          } catch (err) {
            setError(err.message);
          }
        }
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with"
      });
    }

    if (window.google && window.google.accounts) {
      initialize();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", initialize);
      return () => existingScript.removeEventListener("load", initialize);
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [onSuccess]);

  return (
    <div className="google-card">
      <h3>Or continue with</h3>
      {error && <div className="error">{error}</div>}
      <div ref={buttonRef} />
    </div>
  );
}

export default GoogleLoginButton;

