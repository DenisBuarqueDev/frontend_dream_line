import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import PricingCard from "../components/PricingCard";
import logotipo from "../assets/logotipo-white.png";
import AppContainer from "../components/ui/AppContainer";
import { AppHeader } from "../components/ui";
import { createCheckout } from "../services/api";

const getPlans = (t) => [
  {
    id: "free",
    name: "Free",
    description: t('pricing.freeDescription'),
    price: t('pricing.freePrice'),
    buttonText: t('pricing.currentPlan'),
    benefits: [
      { text: t('pricing.free.benefit1') },
      { text: t('pricing.free.benefit2') },
      { text: t('pricing.free.benefit3') },
      { text: t('pricing.free.benefit4') },
      { text: t('pricing.free.benefit5') },
      { text: t('pricing.free.benefit6') },
      { text: t('pricing.free.benefit7') },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: t('pricing.premiumDescription'),
    price: t('pricing.premiumPrice'),
    buttonText: t('pricing.subscribePremium'),
    benefits: [
      { text: t('pricing.premium.benefit1') },
      { text: t('pricing.premium.benefit2') },
      { text: t('pricing.premium.benefit3') },
      { text: t('pricing.premium.benefit4') },
      { text: t('pricing.premium.benefit5') },
      { text: t('pricing.premium.benefit6') },
      { text: t('pricing.premium.benefit7') },
      { text: t('pricing.premium.benefit8') },
      { text: t('pricing.premium.benefit9') },
      { text: t('pricing.premium.benefit10') },
      { text: t('pricing.premium.benefit11') },
      { text: t('pricing.premium.benefit12') },
      { text: t('pricing.premium.benefit13') },
      { text: t('pricing.premium.benefit14') },
    ],
  },
];

function Pricing() {
  const { t } = useTranslation();
  const PLANS = getPlans(t);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (planId) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createCheckout();
      if (response?.data?.initPoint) {
        window.location.href = response.data.initPoint;
      } else {
        setError(t('pricing.checkoutError'));
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || t('pricing.subscriptionError'));
      setLoading(false);
    }
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <AppHeader title={t('nav.plans')} onBack={() => navigate("/dashboard")} />
      <div className="w-full max-w-4xl flex flex-col md:block flex-1 md:flex-none px-4 md:px-0">
        <div className="text-center mb-10 mt-4 md:mt-0">
          <img
            src={logotipo}
            alt="Dream Line Logo"
            className="w-20 h-20 object-contain mx-auto"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            {t('pricing.choosePlan')}
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            {t('pricing.premiumSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              disabled={loading}
            />
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 text-center max-w-lg mx-auto">
            {error}
          </div>
        )}

        <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg mx-auto mt-8">
          <h2 className="text-xl font-bold text-white mb-2">
            {t('pricing.transformTitle')}
          </h2>
          <p className="text-sm text-slate-400">
            {t('pricing.socialProof')}
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8 pb-4">
          {t('pricing.paymentSecurity')}
        </p>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
            <p className="text-white text-lg">{t('pricing.redirecting')}</p>
          </div>
        </div>
      )}
    </AppContainer>
  );
}

export default Pricing;
