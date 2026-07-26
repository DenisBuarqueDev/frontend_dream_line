import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../context/AuthContext";
import AppContainer from "../components/ui/AppContainer";
import { AppHeader } from "../components/ui";

export default function SleepMode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userPlan = user?.plan || "free";
  const canUseEmotions = userPlan === "premium";

  const EMOTIONAL_STATES = [
    { id: "calmo", label: t('sleep.emotion.calm'), icon: "😌", color: "from-emerald-500 to-teal-600" },
    { id: "ansioso", label: t('sleep.emotion.anxious'), icon: "😰", color: "from-amber-500 to-orange-600" },
    { id: "estressado", label: t('sleep.emotion.stressed'), icon: "😤", color: "from-red-500 to-rose-600" },
    { id: "cansado", label: t('sleep.emotion.tired'), icon: "😴", color: "from-indigo-500 to-purple-600" },
    { id: "desmotivado", label: t('sleep.emotion.demotivated'), icon: "😐", color: "from-slate-500 to-slate-600" },
    { id: "voltar_dormir", label: t('sleep.emotion.goBackToSleep'), icon: "🌙", color: "from-violet-500 to-indigo-600" },
    { id: "preocupado", label: t('sleep.emotion.worried'), icon: "☹️", color: "from-blue-500 to-slate-600" },
    { id: "sobrecarregado", label: t('sleep.emotion.overwhelmed'), icon: "🫩", color: "from-yellow-400 to-yellow-700" },
    { id: "triste", label: t('sleep.emotion.sad'), icon: "😔", color: "from-slate-500 to-slate-600" },
    { id: "irritado", label: t('sleep.emotion.irritated'), icon: "😠", color: "from-rose-400 to-rose-600" },
    { id: "inquieto", label: t('sleep.emotion.restless'), icon: "😖", color: "from-fuchsia-400 to-fuchsia-600" },
    { id: "com_medo", label: t('sleep.emotion.scared'), icon: "😧", color: "from-pink-300 to-pink-600" },
  ];

  const handleSelect = (state) => {
    if (!canUseEmotions) return;
    navigate("/sleep-player", { state: { emotionalState: state.id } });
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <AppHeader title={t('sleep.title')} onBack={() => navigate("/timeline")} />
      <div className="w-full max-w-2xl flex flex-col md:block flex-1 md:flex-none px-4 md:px-0">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-2xl shadow-xl p-4 md:p-8">

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t('sleep.howFeeling')}
            </h1>
            <p className="text-purple-200 text-sm sm:text-base">
              {t('sleep.chooseOption')}
            </p>
          </div>

          {!canUseEmotions && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-amber-300 text-sm">
                {t('sleep.premiumOnlyEmotions')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {EMOTIONAL_STATES.map((state) => (
              <button
                key={state.id}
                onClick={() => handleSelect(state)}
                disabled={!canUseEmotions}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                  canUseEmotions
                    ? "hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                } bg-gradient-to-br ${state.color}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl">{state.icon}</span>
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {state.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
