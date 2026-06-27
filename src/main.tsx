import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import PublicProfile from "./components/PublicProfile.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Lightweight client-side router: detect /p/:login paths
const pathMatch = window.location.pathname.match(/^\/p\/([^/]+)\/?$/);
const publicLogin = pathMatch ? pathMatch[1] : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>{publicLogin ? <PublicProfile login={publicLogin} /> : <App />}</ErrorBoundary>
  </StrictMode>,
);
