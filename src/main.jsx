import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";

// Register service worker with auto-update
function registerPWA() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("📱 SW registrado:", registration.scope);

        // Check for updates on every load
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (installing) {
            installing.addEventListener("statechange", () => {
              if (installing.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("📱 Nova versão disponível — atualizando...");
                  installing.postMessage({ type: "SKIP_WAITING" });
                }
              }
            });
          }
        });

        // Auto-reload when new SW takes control
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("📱 SW atualizado — recarregando...");
          window.location.reload();
        });
      } catch (err) {
        console.error("📱 Erro ao registrar SW:", err);
      }
    });
  }
}

registerPWA();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
