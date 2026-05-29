function NumberBall({ num, color = "purple" }) {
  const colorMap = {
    purple: "bg-purple-500/30 text-purple-200 border-purple-500/40",
    indigo: "bg-indigo-500/30 text-indigo-200 border-indigo-500/40",
    violet: "bg-violet-500/30 text-violet-200 border-violet-500/40",
    pink: "bg-pink-500/30 text-pink-200 border-pink-500/40",
    blue: "bg-blue-500/30 text-blue-200 border-blue-500/40"
  };

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border text-xs sm:text-sm font-bold ${colorMap[color] || colorMap.purple} shadow-sm`}>
      {String(num).padStart(2, "0")}
    </span>
  );
}

const GAME_COLORS = {
  megaSena: "purple",
  quina: "indigo",
  lotofacil: "violet",
  duplaSena: "pink",
  timemania: "blue"
};

const GAME_LABELS = {
  megaSena: { name: "Mega-Sena", numbers: 6 },
  quina: { name: "Quina", numbers: 5 },
  lotofacil: { name: "Lotofácil", numbers: 15 },
  duplaSena: { name: "Dupla Sena", numbers: 6 },
  timemania: { name: "Timemania", numbers: 10 }
};

export default function LuckyNumbersCard({ luckyNumbers }) {
  if (!luckyNumbers) return null;

  const games = [
    { key: "megaSena", data: luckyNumbers.megaSena },
    { key: "quina", data: luckyNumbers.quina },
    { key: "lotofacil", data: luckyNumbers.lotofacil },
    { key: "duplaSena", data: luckyNumbers.duplaSena },
    { key: "timemania", data: luckyNumbers.timemania?.numbers }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 sm:p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Números da Sorte
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {games.map(({ key, data }) => {
          const config = GAME_LABELS[key];
          const color = GAME_COLORS[key] || "purple";
          const isTimemania = key === "timemania";

          if (!data || data.length === 0) return null;

          return (
            <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">
                {config.name}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.map((num, i) => (
                  <NumberBall key={i} num={num} color={color} />
                ))}
              </div>
              {isTimemania && luckyNumbers.timemania?.team && (
                <p className="text-xs text-slate-400 mt-2">
                  Time do Coração: <span className="text-purple-300 font-medium">{luckyNumbers.timemania.team}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center">
        Números gerados para entretenimento apenas. Não garantem ganhos.
      </p>
    </div>
  );
}
