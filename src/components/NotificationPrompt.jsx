import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { requestFCMPermission } from "../services/firebaseClient";
import { registerFCMToken, getNotificationSettings, updateNotificationSettings } from "../services/notificationService";

const DISMISS_KEY = "pwa_notif_dismissed";
const RETRY_DAYS = 7;

function shouldShowFromLocal() {
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return true;
  const elapsed = Date.now() - Number(ts);
  return elapsed > RETRY_DAYS * 24 * 60 * 60 * 1000;
}

export default function NotificationPrompt() {
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || checkedRef.current) return;
    checkedRef.current = true;

    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

    getNotificationSettings()
      .then((settings) => {
        if (!settings.notificationPrompted && shouldShowFromLocal()) {
          setShow(true);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleActivate = async () => {
    localStorage.removeItem(DISMISS_KEY);
    setLoading(true);
    try {
      const token = await requestFCMPermission();
      if (token) {
        await registerFCMToken(token);
        await updateNotificationSettings({ notificationsEnabled: true, notificationPrompted: true });
      } else {
        await updateNotificationSettings({ notificationsEnabled: false, notificationPrompted: true });
      }
    } catch {
      await updateNotificationSettings({ notificationsEnabled: false, notificationPrompted: true });
    }
    setLoading(false);
    setShow(false);
  };

  const handleLater = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  const handleNever = async () => {
    try {
      await updateNotificationSettings({ notificationsEnabled: false, notificationPrompted: true });
    } catch {}
    localStorage.removeItem(DISMISS_KEY);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-fade-in">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-500/10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Receber lembretes para registrar sonhos?</p>
            <p className="text-xs text-slate-400 mt-0.5">Notificações diárias para não esquecer seus sonhos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleLater}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
          >
            Agora não
          </button>
          <button
            onClick={handleActivate}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Ativando..." : "Ativar"}
          </button>
        </div>
        <button
          onClick={handleNever}
          disabled={loading}
          className="mt-2 w-full text-xs text-slate-500 hover:text-slate-400 transition-colors text-center"
        >
          Não mostrar novamente
        </button>
      </div>
    </div>
  );
}
