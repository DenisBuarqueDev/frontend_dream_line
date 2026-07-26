import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { subscribe, triggerInstall, isInstallAvailable, waitForInstallPrompt } from "../services/pwaInstall";
import IonIcon from "../components/ui/IonIcon";
import { downloadOutline } from "ionicons/icons";

const DISMISS_KEY = "pwa_dismissed";

export default function DashboardInstallBanner() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");
  const timerRef = useRef(null);

  useEffect(() => {
    const unsub = subscribe(({ deferredPrompt, isInstalled }) => {
      if (isInstalled || !isInstallAvailable() || dismissed) {
        setShow(false);
        return;
      }
      setShow(true);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    const prompt = await waitForInstallPrompt(3000);
    if (prompt) {
      setLoading(true);
      await triggerInstall();
      setLoading(false);
    } else {
      setWaiting(true);
      timerRef.current = setTimeout(() => setWaiting(false), 4000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mb-4 mx-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <IonIcon icon={downloadOutline} className="w-6 h-6 text-purple-400" />
        <p className="text-xs text-slate-300">
          {t("installBanner.text")}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          disabled={loading || waiting}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? t("installBanner.installing") : waiting ? t("installBanner.preparing") : t("installBanner.install")}
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-all"
        >
          {t("installBanner.notNow")}
        </button>
      </div>
    </div>
  );
}
