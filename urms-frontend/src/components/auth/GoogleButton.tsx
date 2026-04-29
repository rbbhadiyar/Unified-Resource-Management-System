import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { googleAuth } from "../../api/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: { theme?: string; size?: string; width?: number; type?: string; shape?: string }
          ) => void;
        };
      };
    };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

function readGoogleClientId(): string {
  const raw = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "";
  return raw.replace(/^["'\s]+|["'\s]+$/g, "").trim();
}

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google script failed")), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google script failed"));
    document.head.appendChild(s);
  });
}

interface Props {
  onSignedIn?: () => void;
  expectedPortal: "admin" | "user";
}

const GoogleButton = ({ onSignedIn, expectedPortal }: Props) => {
  const { login } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const loginRef = useRef(login);
  const onSignedInRef = useRef(onSignedIn);
  const portalRef = useRef(expectedPortal);
  loginRef.current = login;
  onSignedInRef.current = onSignedIn;
  portalRef.current = expectedPortal;

  const clientId = readGoogleClientId();
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    renderedRef.current = false;
    setStatus("loading");

    const mountButton = () => {
      const el = containerRef.current;
      if (!el || !window.google?.accounts?.id || renderedRef.current) return;
      renderedRef.current = true;
      el.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            const { data } = await googleAuth(resp.credential);
            const role = data.role === "admin" ? "admin" : "user";
            const portal = portalRef.current;
            if (portal === "admin" && role !== "admin") {
              alert("Google account is not an admin. Use email/password admin sign-in.");
              return;
            }
            if (portal === "user" && role === "admin") {
              alert("This Google account is an admin. Select Admin sign-in.");
              return;
            }
            loginRef.current(
              { name: data.name, email: data.email, role, userId: data.user_id },
              data.access_token
            );
            onSignedInRef.current?.();
          } catch {
            alert("Google sign-in failed");
          }
        },
      });
      const w = Math.min(320, el.clientWidth || 320);
      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: w,
      });
      if (!cancelled) setStatus("ready");
    };

    const run = async () => {
      try {
        await loadGsiScript();
        let tries = 0;
        while (!cancelled && !window.google?.accounts?.id && tries < 80) {
          await new Promise((r) => setTimeout(r, 100));
          tries += 1;
        }
        if (cancelled) return;
        if (!window.google?.accounts?.id) {
          setStatus("error");
          return;
        }
        requestAnimationFrame(() => {
          if (!cancelled) mountButton();
        });
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void run();

    return () => {
      cancelled = true;
      renderedRef.current = false;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="google-signin-fallback">
        <p className="auth-footer-text" style={{ textAlign: "center", marginBottom: 8 }}>
          Add <code>REACT_APP_GOOGLE_CLIENT_ID</code> in <code>.env</code> (project root), then{" "}
          <strong>restart</strong> <code>npm start</code> so Create React App picks it up.
        </p>
      </div>
    );
  }

  return (
    <div className="google-signin-wrap">
      {status === "loading" && (
        <p className="google-signin-hint" style={{ textAlign: "center", marginBottom: 10 }}>
          Loading Google sign-in…
        </p>
      )}
      {status === "error" && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <p className="google-signin-hint" style={{ marginBottom: 8 }}>
            Could not load Google script (network or blocker). You can still use email and password.
          </p>
          <button type="button" className="btn-outline" style={{ fontSize: 12 }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}
      <div ref={containerRef} className="google-signin-slot" />
    </div>
  );
};

export default GoogleButton;
