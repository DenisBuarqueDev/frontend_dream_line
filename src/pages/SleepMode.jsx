import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMOTIONAL_STATES = [
  { id: "calmo", label: "Calmo", icon: "😌", color: "from-emerald-500 to-teal-600" },
  { id: "ansioso", label: "Ansioso", icon: "😰", color: "from-amber-500 to-orange-600" },
  { id: "estressado", label: "Estressado", icon: "😤", color: "from-red-500 to-rose-600" },
  { id: "cansado", label: "Cansado", icon: "😴", color: "from-indigo-500 to-purple-600" },
  { id: "desmotivado", label: "Desmotivado", icon: "😐", color: "from-slate-500 to-slate-600" },
  { id: "voltar_dormir", label: "Voltar a dormir", icon: "🌙", color: "from-violet-500 to-indigo-600" },
  { id: "preocupado", label: "Preocupado", icon: "☹️", color: "from-blue-500 to-slate-600" },
  { id: "sobrecarregado", label: "Sobrecarregado", icon: "🫩", color: "from-yellow-400 to-yellow-700" },
  { id: "triste", label: "Triste", icon: "😔", color: "from-slate-500 to-slate-600" },
  { id: "irritado", label: "Irritado", icon: "😠", color: "from-rose-400 to-rose-600" },
  { id: "inquieto", label: "Inquieto", icon: "😖", color: "from-fuchsia-400 to-fuchsia-600" },
  { id: "com_medo", label: "Com medo", icon: "😧", color: "from-pink-300 to-pink-600" },
];

export default function SleepMode() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userPlan = user?.plan || "free";
  const canUseEmotions = userPlan === "premium" || userPlan === "pro";

  const handleSelect = (state) => {
    if (!canUseEmotions) return;
    navigate("/sleep-player", { state: { emotionalState: state.id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-4 sm:p-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Como você está sentindo?
            </h1>
            <p className="text-purple-200 text-sm sm:text-base">
              Escolha uma opção para ajudar no seu sono
            </p>
          </div>

          {!canUseEmotions && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-amber-300 text-sm">
                As opções emocionais estão disponíveis apenas para planos Premium ou Pro.
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
    </div>
  );
}
