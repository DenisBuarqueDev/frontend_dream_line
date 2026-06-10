import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotificationSettings, updateNotificationSettings, sendTestNotification } from "../services/notificationService";
import { registerFCMToken, unregisterFCMToken } from "../services/notificationService";
import { requestFCMPermission } from "../services/firebaseClient";
import GlassCard from "../components/ui/GlassCard";
import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

const TIME_OPTIONS = [
  { label: "07:00", value: "07:00" },
  { label: "08:00", value: "08:00" },
  { label: "09:00", value: "09:00" },
  { label: "12:00", value: "12:00" },
  { label: "18:00", value: "18:00" },
  { label: "19:00", value: "19:00" },
  { label: "20:00", value: "20:00" },
  { label: "21:00", value: "21:00" },
  { label: "22:00", value: "22:00" },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState(["07:00", "21:00"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getNotificationSettings()
      .then((settings) => {
        setEnabled(settings.notificationsEnabled);
        setTimes(settings.notificationTimes || ["07:00", "21:00"]);
      })
      .catch(() => setMessage("Erro ao carregar configurações"))
      .finally(() => setLoading(false));
  }, []);

  const toggleEnabled = async () => {
    setSaving(true);
    setMessage("");
    try {
      const newEnabled = !enabled;
      if (newEnabled) {
        const token = await requestFCMPermission();
        if (token) {
          await registerFCMToken(token);
        } else {
          setMessage("Permissão de notificação negada");
          setSaving(false);
          return;
        }
      } else {
        await unregisterFCMToken();
      }
      await updateNotificationSettings({ notificationsEnabled: newEnabled });
      setEnabled(newEnabled);
      setMessage(newEnabled ? "Notificações ativadas" : "Notificações desativadas");
    } catch (e) {
      setMessage("Erro ao atualizar");
    }
    setSaving(false);
  };

  const toggleTime = async (time) => {
    setSaving(true);
    setMessage("");
    try {
      const newTimes = times.includes(time)
        ? times.filter((t) => t !== time)
        : [...times, time].sort();
      if (newTimes.length === 0) {
        setMessage("Selecione pelo menos um horário");
        setSaving(false);
        return;
      }
      await updateNotificationSettings({ notificationTimes: newTimes });
      setTimes(newTimes);
      setMessage("Horários atualizados");
    } catch {
      setMessage("Erro ao atualizar horários");
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setMessage("");
    try {
      const result = await sendTestNotification();
      setMessage(result.success ? "Notificação de teste enviada!" : "Falha ao enviar teste");
    } catch {
      setMessage("Erro ao enviar teste");
    }
  };

  if (loading) {
    return (
      <AppContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Notificações" onBack={() => navigate("/dashboard")} />

      <div className="p-4 space-y-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Lembretes de sonhos</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {enabled ? "Ativo" : "Inativo"}
              </p>
            </div>
            <button
              onClick={toggleEnabled}
              disabled={saving}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                enabled ? "bg-purple-600" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </GlassCard>

        <div>
          <p className="text-white font-semibold mb-3">Horários</p>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((opt) => {
              const selected = times.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleTime(opt.value)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selected
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Toque para selecionar os horários de lembrete
          </p>
        </div>

        {enabled && (
          <PrimaryButton onClick={handleTest} disabled={saving}>
            Enviar notificação de teste
          </PrimaryButton>
        )}

        {message && (
          <p className={`text-sm text-center ${message.includes("Erro") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </p>
        )}

        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sobre as notificações
          </p>
          <p className="text-sm text-slate-400">
            🌙 07:00 — Lembrete para registrar o sonho da noite
          </p>
          <p className="text-sm text-slate-400">
            ✨ 21:00 — Preparação para uma nova noite de sonhos
          </p>
          <p className="text-sm text-slate-400">
            Você pode personalizar os horários acima.
          </p>
        </div>
      </div>
    </AppContainer>
  );
}
