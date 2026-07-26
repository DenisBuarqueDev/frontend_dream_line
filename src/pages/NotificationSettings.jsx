import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import {
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification,
  registerFCMToken,
  unregisterFCMToken,
} from "../services/notificationService";
import { requestFCMPermission } from "../services/firebaseClient";
import { usePermissions } from "../hooks/usePermissions";
import PremiumModal from "../components/PremiumModal";
import GlassCard from "../components/ui/GlassCard";
import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import IonIcon from "../components/ui/IonIcon";
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  alarmOutline,
} from "ionicons/icons";

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

function calcNextNotification(times, enabled, t) {
  if (!enabled || !times || times.length === 0) return null;
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const sorted = [...times].sort();
  for (const time of sorted) {
    const [h, m] = time.split(":").map(Number);
    if (h * 60 + m > currentMin) {
      return { time, label: t('notifications.todayAt', { time }) };
    }
  }
  return { time: sorted[0], label: t('notifications.tomorrowAt', { time: sorted[0] }) };
}

function formatDate(dateStr, locale) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationSettings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isPremium } = usePermissions();
  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState(["07:00", "21:00"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [animTime, setAnimTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const timerRef = useRef(null);

  const nextNotif = useMemo(() => calcNextNotification(times, enabled, t), [times, enabled, t]);

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
      .catch(() => showFeedback(t('notifications.errorLoading'), "error"))
      .finally(() => setLoading(false));
  }, [showFeedback]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const toggleEnabled = async () => {
    if (!enabled && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setSaving(true);
    try {
      const newEnabled = !enabled;
      if (newEnabled) {
        const token = await requestFCMPermission();
        if (token) {
          await registerFCMToken(token);
          setHasToken(true);
        } else {
          showFeedback(t('notifications.permissionDenied'), "error");
          setSaving(false);
          return;
        }
      } else {
        await unregisterFCMToken();
        setHasToken(false);
      }
      await updateNotificationSettings({ notificationsEnabled: newEnabled });
      setEnabled(newEnabled);
      showFeedback(newEnabled ? t('notifications.enabled') : t('notifications.disabled'));
    } catch (e) {
      console.error("[Notificações] Erro ao alternar:", e);
      showFeedback(t('notifications.errorUpdating'), "error");
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
        showFeedback(t('notifications.selectAtLeastOne'), "error");
        setAnimTime(null);
        setSaving(false);
        return;
      }
      await updateNotificationSettings({ notificationTimes: newTimes });
      setTimes(newTimes);
      showFeedback(`${time} ${isAdding ? t('notifications.selected') : t('notifications.removed')}`);
    } catch (e) {
      console.error("[Notificações] Erro ao alterar horário:", e);
      showFeedback(t('notifications.errorUpdatingTimes'), "error");
    }
    setTimeout(() => setAnimTime(null), 350);
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await sendTestNotification();
      if (result.success) {
        showFeedback(<><IonIcon icon={checkmarkCircleOutline} className="w-4 h-4 text-green-400" /> {t('notifications.sentSuccess')}</>);
      } else {
        console.error("[Notificações] Falha no teste:", result.reason, result.error);
        showFeedback(<><IonIcon icon={closeCircleOutline} className="w-4 h-4 text-red-400" /> {t('notifications.cannotSend')}</>, "error");
      }
    } catch (e) {
      console.error("[Notificações] Erro no teste:", e);
      showFeedback(<><IonIcon icon={closeCircleOutline} className="w-4 h-4 text-red-400" /> {t('notifications.cannotSend')}</>, "error");
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
      <AppHeader title={t('nav.notifications')} onBack={() => navigate("/dashboard")} />

      <div className="p-4 space-y-6">

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{t('notifications.dreamReminders')}</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {enabled ? t('notifications.active') : t('notifications.inactive')}
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
          <p className="text-white font-semibold mb-3">{t('notifications.times')}</p>
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
            {t('notifications.tapToSelect')}
          </p>
        </div>

        <GlassCard>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('notifications.status')}
          </p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${hasToken ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-white">
              {hasToken ? t('notifications.deviceRegistered') : t('notifications.unauthorized')}
            </span>
          </div>
          {hasToken ? (
            <p className="text-xs text-slate-400 mt-1 ml-[18px]">{t('notifications.fcmTokenValid')}</p>
          ) : (
            <button
              onClick={toggleEnabled}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 ml-[18px] transition-colors"
            >
              {t('notifications.requestPermissionAgain')}
            </button>
          )}
        </GlassCard>

        {enabled && (
          <PrimaryButton onClick={handleTest} disabled={testing || saving}>
            {testing ? t('notifications.sending') : t('notifications.sendTest')}
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
            {t('notifications.about')}
          </p>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">{t('notifications.reminders')}</span>
              <span className={enabled ? "text-green-400" : "text-slate-500"}>
                {enabled ? t('notifications.enabledStatus') : t('notifications.disabledStatus')}
              </span>
            </div>

            {times.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{t('notifications.selectedTimes')}</span>
                <span className="text-white">{times.join(", ")}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">{t('notifications.timesCount')}</span>
              <span className="text-white">{t('notifications.activeCount', { count: times.length })}</span>
            </div>

            {nextNotif && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{t('notifications.nextReminder')}</span>
                <span className="text-purple-400"><IonIcon icon={alarmOutline} className="w-5 h-5" /> {nextNotif.label}</span>
              </div>
            )}

            {formatDate(lastSent, i18n.language) && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{t('notifications.lastSent')}</span>
                <span className="text-slate-300">{formatDate(lastSent, i18n.language)}</span>
              </div>
            )}
          </div>
        </GlassCard>

      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={t('pricing.featureNotifications')}
      />
    </AppContainer>
  );
}
