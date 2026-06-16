import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification,
  registerFCMToken,
  unregisterFCMToken,
} from "../services/notificationService";
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

function calcNextNotification(times, enabled) {
  if (!enabled || !times || times.length === 0) return null;
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const sorted = [...times].sort();
  for (const time of sorted) {
    const [h, m] = time.split(":").map(Number);
    if (h * 60 + m > currentMin) {
      return { time, label: `hoje às ${time}` };
    }
  }
  return { time: sorted[0], label: `amanhã às ${sorted[0]}` };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState(["07:00", "21:00"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [animTime, setAnimTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  const nextNotif = useMemo(() => calcNextNotification(times, enabled), [times, enabled]);

  const showFeedback = useCallback((text, type = "success") => {
    setFeedback({ text, type });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFeedback(null), 3500);
  }, []);

  useEffect(() => {
    getNotificationSettings()
      .then((s) => {
        setEnabled(s.notificationsEnabled);
        setTimes(s.notificationTimes || ["07:00", "21:00"]);
        setHasToken(s.hasToken);
        setLastSent(s.lastNotificationSent);
      })
      .catch(() => showFeedback("Erro ao carregar configurações", "error"))
      .finally(() => setLoading(false));
  }, [showFeedback]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const toggleEnabled = async () => {
    setSaving(true);
    try {
      const newEnabled = !enabled;
      if (newEnabled) {
        const token = await requestFCMPermission();
        if (token) {
          await registerFCMToken(token);
          setHasToken(true);
        } else {
          showFeedback("Permissão de notificação negada", "error");
          setSaving(false);
          return;
        }
      } else {
        await unregisterFCMToken();
        setHasToken(false);
      }
      await updateNotificationSettings({ notificationsEnabled: newEnabled });
      setEnabled(newEnabled);
      showFeedback(newEnabled ? "Notificações ativadas" : "Notificações desativadas");
    } catch (e) {
      console.error("[Notificações] Erro ao alternar:", e);
      showFeedback("Erro ao atualizar", "error");
    }
    setSaving(false);
  };

  const toggleTime = async (time) => {
    setSaving(true);
    setAnimTime(time);
    const isAdding = !times.includes(time);
    try {
      const newTimes = isAdding
        ? [...times, time].sort()
        : times.filter((t) => t !== time);
      if (newTimes.length === 0) {
        showFeedback("Selecione pelo menos um horário", "error");
        setAnimTime(null);
        setSaving(false);
        return;
      }
      await updateNotificationSettings({ notificationTimes: newTimes });
      setTimes(newTimes);
      showFeedback(`${time} ${isAdding ? "selecionado" : "removido"}`);
    } catch (e) {
      console.error("[Notificações] Erro ao alterar horário:", e);
      showFeedback("Erro ao atualizar horários", "error");
    }
    setTimeout(() => setAnimTime(null), 350);
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await sendTestNotification();
      if (result.success) {
        showFeedback("✅ Notificação enviada com sucesso");
      } else {
        console.error("[Notificações] Falha no teste:", result.reason, result.error);
        showFeedback("❌ Não foi possível enviar a notificação", "error");
      }
    } catch (e) {
      console.error("[Notificações] Erro no teste:", e);
      showFeedback("❌ Não foi possível enviar a notificação", "error");
    } finally {
      setTesting(false);
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
              const isAnim = animTime === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleTime(opt.value)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selected
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  } ${isAnim ? "scale-110" : ""} ${saving ? "opacity-50" : ""}`}
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

        <GlassCard>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Status das notificações
          </p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${hasToken ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-white">
              {hasToken ? "Dispositivo registrado" : "Notificações não autorizadas"}
            </span>
          </div>
          {hasToken ? (
            <p className="text-xs text-slate-400 mt-1 ml-[18px]">FCM Token válido</p>
          ) : (
            <button
              onClick={toggleEnabled}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 ml-[18px] transition-colors"
            >
              Solicitar permissão novamente
            </button>
          )}
        </GlassCard>

        {enabled && (
          <PrimaryButton onClick={handleTest} disabled={testing || saving}>
            {testing ? "Enviando…" : "Enviar notificação de teste"}
          </PrimaryButton>
        )}

        {feedback && (
          <div
            className={`text-sm text-center px-4 py-2.5 rounded-xl transition-all duration-300 ${
              feedback.type === "error"
                ? "text-red-400 bg-red-500/10"
                : "text-green-400 bg-green-500/10"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <GlassCard>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Sobre as notificações
          </p>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Lembretes</span>
              <span className={enabled ? "text-green-400" : "text-slate-500"}>
                {enabled ? "Ativados" : "Desativados"}
              </span>
            </div>

            {times.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Horários selecionados</span>
                <span className="text-white">{times.join(", ")}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Quantidade de horários</span>
              <span className="text-white">{times.length} ativo(s)</span>
            </div>

            {nextNotif && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Próximo lembrete</span>
                <span className="text-purple-400">⏰ {nextNotif.label}</span>
              </div>
            )}

            {formatDate(lastSent) && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Último envio</span>
                <span className="text-slate-300">{formatDate(lastSent)}</span>
              </div>
            )}
          </div>
        </GlassCard>

      </div>
    </AppContainer>
  );
}
