import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSubscriptionStatus } from "../services/api";
import AppContainer from "../components/ui/AppContainer";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updatePlanInfo } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getSubscriptionStatus()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data;
        if (data) {
          setStatus(data);
          updatePlanInfo({
            plan: data.plan,
            isPremium: data.isPremium,
            subscription: {
              plan: data.plan,
              status: data.status,
              startedAt: data.premiumSince,
              expiresAt: data.premiumExpiresAt,
            },
          });
        }
      })
      .catch(() => {
        if (!cancelled) setStatus({ plan: "free" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [updatePlanInfo]);

  return (
    <AppContainer className="items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          {t('payment.success.title')}
        </h1>

        <p className="text-lg text-slate-300 mb-2">
          {t('payment.success.subtitle')}
        </p>

        {loading ? (
          <p className="text-slate-400 mb-8">{t('payment.success.checkingStatus')}</p>
        ) : status?.isPremium ? (
          <p className="text-purple-400 font-semibold mb-8">
            {t('payment.success.premiumValid', { days: status.daysRemaining })}
          </p>
        ) : (
          <p className="text-yellow-400 mb-8">
            {t('payment.success.activating')}
          </p>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          {t('payment.success.goToDashboard')}
        </button>
      </div>
    </AppContainer>
  );
}
