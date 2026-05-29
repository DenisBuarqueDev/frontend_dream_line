import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GAMES = {
  megaSena: { name: "Mega-Sena", icon: "🎰", color: "from-green-500 to-emerald-600" },
  lotofacil: { name: "Lotofácil", icon: "🎯", color: "from-purple-500 to-violet-600" },
  quina: { name: "Quina", icon: "💎", color: "from-blue-500 to-cyan-600" },
  duplaSena: { name: "Dupla Sena", icon: "🎲", color: "from-orange-500 to-amber-600" },
  timemania: { name: "Timemania", icon: "⚽", color: "from-red-500 to-rose-600" }
};

const DISCLAIMER = "Números gerados para entretenimento apenas. Não garantem ganhos.";

export default function LuckyNumbers() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(null);

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/lucky-numbers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const regenerateGame = async (gameKey) => {
    setRegenerating(gameKey);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/lucky-numbers/regenerate/${gameKey}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({
          ...prev,
          games: {
            ...prev.games,
            [gameKey]: result.data.numbers,
            [`${gameKey}Formatted`]: result.data.formatted,
            ...(result.data.timeDoCoracao && { timeDoCoracao: result.data.timeDoCoracao })
          }
        }));
      }
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setRegenerating(null);
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, []);

  const renderNumbers = (numbers, gameKey) => {
    const isTimemania = gameKey === "timemania";
    const displayNumbers = isTimemania ? numbers.slice(0, 10) : numbers;
    
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {displayNumbers.map((num, i) => (
          <span
            key={i}
            className={`w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-sm font-bold text-slate-800 shadow-md`}
          >
            {String(num).padStart(2, "0")}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Gerando números da sorte...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Números da Sorte</h1>
          <div className="w-10" />
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎲</span>
            <div>
              <h2 className="text-slate-800 font-bold text-lg">Seus números da sorte</h2>
              {data?.personalNumber && (
                <p className="text-slate-500 text-sm">
                  Baseados no seu número pessoal: <span className="font-bold text-violet-600">{data.personalNumber}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={fetchNumbers}
            className="w-full py-3 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Gerar novos números
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(GAMES).map(([gameKey, game]) => {
            const numbers = data?.games?.[gameKey];
            const formatted = data?.games?.[`${gameKey}Formatted`];
            
            if (!numbers) return null;

            return (
              <div key={gameKey} className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.icon}</span>
                    <h3 className="text-slate-800 font-bold">{game.name}</h3>
                  </div>
                  <button
                    onClick={() => regenerateGame(gameKey)}
                    disabled={regenerating === gameKey}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {regenerating === gameKey ? "..." : "↻"}
                  </button>
                </div>

                <div className="flex justify-center mb-3">
                  {renderNumbers(numbers, gameKey)}
                </div>

                {gameKey === "timemania" && data?.games?.timeDoCoracao && (
                  <div className="flex justify-center">
                    <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      Time: {data.games.timeDoCoracao}
                    </span>
                  </div>
                )}

                <div className="text-center mt-3">
                  <span className="text-slate-400 text-xs font-mono">
                    {formatted}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}