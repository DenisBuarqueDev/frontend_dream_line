import IonIcon from "../components/ui/IonIcon";
import { checkmarkCircleOutline } from "ionicons/icons";

function PricingCard({ plan, onSubscribe, disabled }) {
  const isFree = plan.id === "free";

  return (
    <div
      className={`relative rounded-3xl p-8 transition-all duration-300 ${
        isFree
          ? "bg-white/[0.06] border border-white/10"
          : "bg-gradient-to-b from-purple-600/20 to-indigo-600/10 border-2 border-purple-500/40 shadow-xl shadow-purple-500/10 scale-105"
      }`}
    >
      {!isFree && (
        <>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="px-5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full tracking-wide uppercase shadow-lg shadow-purple-500/30">
              Recomendado
            </span>
          </div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
        </>
      )}

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold mb-1 ${isFree ? "text-white" : "text-purple-200"}`}>
            {plan.name}
          </h3>
          <p className={`text-sm ${isFree ? "text-slate-500" : "text-purple-300/60"}`}>
            {plan.description}
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-5xl font-extrabold tracking-tight ${isFree ? "text-white" : "text-white"}`}>
              {plan.price}
            </span>
            {!isFree && <span className="text-sm text-purple-300/50">/mês</span>}
          </div>
        </div>

        <ul className="space-y-3.5 mb-8">
          {plan.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <IonIcon icon={checkmarkCircleOutline} className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className={`text-sm ${isFree ? "text-slate-300" : "text-slate-200"}`}>
                {benefit.text}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSubscribe(plan.id)}
          disabled={disabled && !isFree}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${
            isFree
              ? "bg-white/10 text-slate-400 border border-white/10 cursor-default"
              : disabled
                ? "bg-purple-600/50 text-white/60 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {plan.buttonText}
        </button>
      </div>
    </div>
  );
}

export default PricingCard;
