import { useAuth } from '../context/AuthContext';

const PREMIUM_FEATURES = {
  generate_image: { label: 'Imagem do sonho', premiumOnly: true },
  sleep_mode: { label: 'Modo Sono', premiumOnly: true },
  weekly_summary: { label: 'Resumo semanal', premiumOnly: true },
  delete_dream: { label: 'Excluir sonhos', premiumOnly: true },
  delete_emotion: { label: 'Excluir registros emocionais', premiumOnly: true },
  correlations: { label: 'Correlação sonhos × emoções', premiumOnly: true },
  notifications: { label: 'Notificações Push', premiumOnly: true },
  numerology: { label: 'Numerologia', premiumOnly: true },
  astral_chart: { label: 'Mapa Astral', premiumOnly: true },
  interpretation: { label: 'Interpretação de sonhos', premiumOnly: false, dailyLimit: 3 },
  emotion_analysis: { label: 'Análise emocional', premiumOnly: false, dailyLimit: 3 },
};

export function usePermissions() {
  const { user } = useAuth();
  const plan = user?.plan || 'free';
  const isPremium = plan === 'premium';

  const canAccess = (feature) => {
    if (isPremium) return { allowed: true };

    const featureDef = PREMIUM_FEATURES[feature];
    if (!featureDef) return { allowed: true };

    if (featureDef.premiumOnly) {
      return { allowed: false, reason: 'premium_only', label: featureDef.label };
    }

    return { allowed: true };
  };

  const getRemaining = (feature) => {
    if (isPremium) return Infinity;

    const featureDef = PREMIUM_FEATURES[feature];
    if (!featureDef || !featureDef.dailyLimit) return Infinity;

    const countKey = feature === 'interpretation' ? 'interpretationCount' : 'emotionAnalysisCount';
    const userCount = user?.[countKey] ?? 0;
    return Math.max(0, featureDef.dailyLimit - userCount);
  };

  const getLimitMessage = (feature) => {
    const featureDef = PREMIUM_FEATURES[feature];
    if (!featureDef) return '';
    const remaining = getRemaining(feature);
    if (remaining === Infinity) return '';
    if (remaining === 0) return `Você atingiu o limite de ${featureDef.dailyLimit} ${featureDef.label?.toLowerCase()}s por dia`;
    return `Você tem ${remaining} de ${featureDef.dailyLimit} ${featureDef.label?.toLowerCase()}s disponíveis hoje`;
  };

  return { isPremium, plan, canAccess, getRemaining, getLimitMessage };
}
