import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const INTERPRETATIONS = {
  1: { essence: "Início, ação, liderança", traits: ["independência", "originalidade", "coragem"] },
  2: { essence: "Sensibilidade, relações, equilíbrio", traits: ["diplomacia", "cooperação", "intuição"] },
  3: { essence: "Comunicação, criatividade, alegria", traits: ["expressão", "otimismo", "arte"] },
  4: { essence: "Estabilidade, trabalho, estrutura", traits: ["praticidade", "disciplina", "confiabilidade"] },
  5: { essence: "Mudanças, movimento, liberdade", traits: ["adaptabilidade", "versatilidade", "curiosidade"] },
  6: { essence: "Harmonia, família, responsabilidade", traits: ["cuidado", "justiça", "devotamento"] },
  7: { essence: "Análise, introspecção, sabedoria", traits: ["profundidade", "espiritualidade", "inteligência"] },
  8: { essence: "Poder, abundância, autoridade", traits: ["ambição", "liderança", "materialismo"] },
  9: { essence: "Humanitarismo, completude, transformação", traits: ["generosidade", "sabedoria", "compaixão"] },
  11: { essence: "Intuição elevada, inspiração, espiritualidade", traits: ["visão", "iluminação", "sensibilidade"] },
  22: { essence: "Realização prática, construção, maestria", traits: ["ambição", "pragmatismo", "grandeza"] },
  33: { essence: "Mestria espiritual, cura, amor altruísta", traits: ["sacrifício", "ensinamento", "iluminação"] }
};

const DAY_MESSAGES = {
  1: "Dia de novoscomeços. Tome a iniciativa em algo que postponha.",
  2: "Dia de cooperação. Busque parcerias e equilíbrio nas relações.",
  3: "Dia de alegria. Expresse-se criativamente e conecte-se com alegria.",
  4: "Dia de trabalho. Foque em estruturas e responsabilidades.",
  5: "Dia de mudanças. Esteja aberto a novas experiências e adaptações.",
  6: "Dia de família. Dedique tempo ao lar e aos que ama.",
  7: "Dia de introspecção. Reserve tempo para reflexão e silêncio.",
  8: "Dia de poder. Foque em realizações materiais e metas importantes.",
  9: "Dia de encerramento. Libere o que não serve e complete ciclos."
};

const GAMES = {
  megaSena: { name: "Mega-Sena", numbers: 6 },
  lotofacil: { name: "Lotofácil", numbers: 15 },
  quina: { name: "Quina", numbers: 5 },
  timemania: { name: "Timemania", numbers: 10, hasTeam: true }
};

function calculateLifePath(dateStr) {
  const digits = dateStr.replace(/-/g, "").replace(/\D/g, "");
  const sum = digits.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  let result = sum;
  while (result > 9 && ![11, 22, 33].includes(result)) {
    result = result.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return result;
}

function calculatePersonalNumber(birthDate, currentDate) {
  const birth = new Date(birthDate);
  const current = new Date(currentDate);
  const sum = birth.getDate() + (birth.getMonth() + 1) + current.getFullYear();
  let result = sum;
  while (result > 9 && ![11, 22, 33].includes(result)) {
    result = result.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return result;
}

function calculateUniversalDay(dateStr) {
  const date = new Date(dateStr);
  const sum = date.getDate() + (date.getMonth() + 1) + date.getFullYear();
  let result = sum;
  while (result > 9) {
    result = result.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return result;
}

function generateLuckyNumbers() {
  const teams = ["Flamengo", "Corinthians", "Palmeiras", "São Paulo", "Santos", "Cruzeiro", "Grêmio", "Internacional", "Bahia", "Fortaleza"];
  return {
    megaSena: Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1).sort((a, b) => a - b),
    lotofacil: Array.from({ length: 15 }, () => Math.floor(Math.random() * 25) + 1).sort((a, b) => a - b),
    quina: Array.from({ length: 5 }, () => Math.floor(Math.random() * 80) + 1).sort((a, b) => a - b),
    timemania: Array.from({ length: 10 }, () => Math.floor(Math.random() * 80) + 1).sort((a, b) => a - b),
    timeDoCoracao: teams[Math.floor(Math.random() * teams.length)]
  };
}

export default function Numerology() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [luckyNumbers, setLuckyNumbers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [energyRes, luckyRes] = await Promise.all([
          fetch("/api/energy/today", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/lucky-numbers", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const energyResult = await energyRes.json();
        const luckyResult = await luckyRes.json();
        setData(energyResult.data?.numerology || energyResult.data);
        if (luckyResult.success && luckyResult.data?.games) {
          setLuckyNumbers(luckyResult.data.games);
        } else {
          setLuckyNumbers(generateLuckyNumbers());
        }
      } catch (err) {
        setError(err.message);
        const stored = localStorage.getItem("userBirthDate");
        if (stored) {
          const today = new Date().toISOString();
          setData({
            lifePath: calculateLifePath(stored),
            personalNumber: calculatePersonalNumber(stored, today),
            universalNumber: calculateUniversalDay(today),
            message: DAY_MESSAGES[calculateUniversalDay(today)]
          });
          setLuckyNumbers(generateLuckyNumbers());
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNumberColor = (num) => {
    if ([11, 22, 33].includes(num)) return "from-amber-500 to-orange-600";
    const colors = ["from-red-500 to-rose-600", "from-orange-500 to-amber-600", "from-yellow-500 to-lime-600", "from-green-500 to-emerald-600", "from-teal-500 to-cyan-600", "from-blue-500 to-indigo-600", "from-indigo-500 to-violet-600", "from-purple-500 to-fuchsia-600", "from-pink-500 to-rose-600"];
    return colors[(num - 1) % 9];
  };

  const getNumberMeaning = (num) => INTERPRETATIONS[num] || INTERPRETATIONS[1];
  const formatNumbers = (nums) => nums.map(n => String(n).padStart(2, "0")).join("-");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Numerologia</h1>
          <div className="w-10" />
        </div>

        {error && (
          <div className="bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-xl text-sm mb-4">
            Configure seu mapa astral para ver todos os dados.
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="text-purple-200 text-sm mb-2">Hoje</div>
            <div className="text-white text-lg font-medium">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-500/10 rounded-2xl p-5 border border-purple-500/20">
              <div className="text-center">
                <div className="text-purple-200 text-sm mb-2">Número do Caminho de Vida</div>
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getNumberColor(data?.lifePath || 1)} shadow-lg`}>
                  <span className="text-white text-3xl font-bold">{data?.lifePath || "?"}</span>
                </div>
                <div className="mt-3 text-white font-medium">{getNumberMeaning(data?.lifePath || 1).essence}</div>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {getNumberMeaning(data?.lifePath || 1).traits.map((trait, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">{trait}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <div className="text-slate-400 text-sm mb-2">Número Pessoal</div>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${getNumberColor(data?.personalNumber || 1)} shadow-md`}>
                  <span className="text-white text-2xl font-bold">{data?.personalNumber || "?"}</span>
                </div>
                <div className="mt-2 text-slate-300 text-sm">Energia do dia</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                <div className="text-slate-400 text-sm mb-2">Número Universal</div>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${getNumberColor(data?.universalNumber || 1)} shadow-md`}>
                  <span className="text-white text-2xl font-bold">{data?.universalNumber || "?"}</span>
                </div>
                <div className="mt-2 text-slate-300 text-sm">Energia coletiva</div>
              </div>
            </div>

            {data?.message && (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white">
                <div className="text-purple-200 text-sm mb-2">Mensagem do Dia</div>
                <p className="text-white font-medium">{data.message}</p>
              </div>
            )}

            {data?.yearNumber && (
              <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20">
                <div className="text-amber-300 text-sm mb-2">Ano Pessoal {new Date().getFullYear()}</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{data.yearNumber}</span>
                  </div>
                  <div className="text-white">{getNumberMeaning(data.yearNumber).essence}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {luckyNumbers && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mt-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎲</span>
              <h2 className="text-white font-bold text-lg">Seus Números da Sorte</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(GAMES).map(([key, game]) => {
                const nums = luckyNumbers[key];
                if (!nums) return null;
                return (
                  <div key={key} className="bg-white/5 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-sm font-medium">{game.name}</span>
                      {game.hasTeam && luckyNumbers.timeDoCoracao && (
                        <span className="text-slate-400 text-xs">⚽ {luckyNumbers.timeDoCoracao}</span>
                      )}
                    </div>
                    <div className="text-white font-mono text-lg tracking-wider">{formatNumbers(nums)}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-slate-500 text-xs mt-3 text-center">Apenas para entretenimento</p>
          </div>
        )}
      </div>
    </div>
  );
}