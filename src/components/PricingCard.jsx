function PricingCard({ plan, onSubscribe, loading }) {
  const handleClick = () => {
    onSubscribe(plan.id);
  };

  const isFree = plan.id === "free";
  const isLoading = loading === plan.id;

  return (
    <div
      className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
        plan.popular ? "scale-105 ring-2 ring-violet-500/50" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold rounded-full">
            Mais popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-white">{plan.price}</span>
          <span className="text-sm text-slate-400">/mês</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            {benefit.locked ? (
              <>
                <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <span className="text-sm text-slate-400">{benefit.text}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="text-sm text-slate-200">{benefit.text}</span>
              </>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
          plan.buttonStyle === "outline"
            ? "border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10"
            : plan.buttonStyle === "gradient"
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
            : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white shadow-lg shadow-amber-500/25"
        }`}
      >
        {isLoading ? "Redirecionando..." : plan.buttonText}
      </button>
    </div>
  );
}

export default PricingCard;