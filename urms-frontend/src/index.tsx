import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ IMPORT AUTH PROVIDER
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* ✅ WRAP APP */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);