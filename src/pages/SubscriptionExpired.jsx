import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AppContainer from "../components/ui/AppContainer";

export default function SubscriptionExpired() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AppContainer className="items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          {t('subscription.expired.title')}
        </h1>

        <p className="text-lg text-slate-300 mb-8">
          {t('subscription.expired.subtitle')}
        </p>

        <button
          onClick={() => navigate("/pricing")}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          {t('subscription.expired.renew')}
        </button>
      </div>
    </AppContainer>
  );
}
