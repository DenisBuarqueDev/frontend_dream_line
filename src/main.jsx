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

        function onSWInstalling(worker) {
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("📱 Nova versão disponível — atualizando...");
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        }

        // Pode já estar instalando se registerSW.js iniciou antes
        if (registration.installing) {
          onSWInstalling(registration.installing);
        }

        registration.addEventListener("updatefound", () => {
          if (registration.installing) {
            onSWInstalling(registration.installing);
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
