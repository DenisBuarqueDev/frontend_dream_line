import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { generateNameNumerology, getNameNumerologyRemaining } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const LETTER_MAP = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8
};

function reduceToDigit(n) {
  if (n === 0) return 0;
  let num = n;
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return num;
}

function letterValue(char) {
  return LETTER_MAP[char.toUpperCase()] || 0;
}

export default function NameNumerologyPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      getNameNumerologyRemaining()
        .then(r => {
          if (r.success) setRemaining(r.data.remaining);
        })
        .catch(() => {});
    }
  }, [isLoading]);

  const handleGenerate = useCallback(async () => {
    if (!fullName.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!birthDate) {
      setError("Informe sua data de nascimento.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateNameNumerology(fullName.trim(), birthDate);
      if (response.success) {
        setResult(response.data.record);
        setRemaining(r => r !== null ? r - 1 : null);
      } else {
        setError(response.message || "Erro ao gerar numerologia.");
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Premium")) {
        setError("premium_block");
      } else if (msg.includes("Limite")) {
        setError("limite_atingido");
      } else {
        setError(msg || "Erro ao gerar numerologia.");
      }
    } finally {
      setLoading(false);
    }
  }, [fullName, birthDate]);

  if (isLoading) {
    return (
      <AppContainer>
        <AppHeader title="Numerologia do Nome" onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Numerologia do Nome" onBack={() => navigate("/dashboard")} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-4 pt-4">

          {!result && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-4">Descubra a Numerologia do seu Nome</h2>
              <p className="text-purple-200 text-sm mb-6">
                Baseado no seu nome completo e data de nascimento, revelamos os números que regem sua personalidade, alma e destino.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Nome completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Data de nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all [color-scheme:dark]"
                  />
                </div>

                {remaining !== null && (
                  <p className="text-slate-400 text-xs">
                    Gerações disponíveis hoje: {remaining}
                  </p>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Calculando..." : "Gerar Numerologia"}
                </button>

                {error && error !== "premium_block" && error !== "limite_atingido" && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}

                {error === "premium_block" && (
                  <div className="text-center mt-4">
                    <p className="text-yellow-400 text-sm mb-2">Esta funcionalidade requer plano Premium.</p>
                    <button onClick={() => navigate("/pricing")} className="text-purple-400 underline text-sm">
                      Ver planos
                    </button>
                  </div>
                )}

                {error === "limite_atingido" && (
                  <div className="text-center mt-4">
                    <p className="text-yellow-400 text-sm mb-2">Você atingiu o limite diário de gerações.</p>
                    <button onClick={() => navigate("/pricing")} className="text-purple-400 underline text-sm">
                      Faça upgrade para Premium e tenha mais gerações
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {result && result.calculations && (
            <>
              <LetterTable data={result.calculations.letterValues} fullName={result.fullName} />

              <VowelCard data={result.calculations.vowels} />

              <ConsonantCard data={result.calculations.consonants} />

              <ExpressionCard data={result.calculations.expression} />

              <LifePathCard data={result.calculations.lifePath} birthDate={result.birthDate} />

              <InterpretationsCard data={result.calculations.interpretations} />

              <PyramidCard data={result.calculations.pyramidOfLife} />

              <CabalisticCard data={result.calculations.cabalistic} />

              <CorrelationCard data={result.calculations.correlation} />

              <AngelNumbersCard data={result.calculations.angelNumbers} />

              <SummaryCard text={result.calculations.overallSummary} numbers={[
                result.calculations.vowels.soulNumber,
                result.calculations.consonants.personalityNumber,
                result.calculations.expression.number,
                result.calculations.lifePath.number
              ]} />

              <div className="text-center pb-4">
                <button
                  onClick={() => { setResult(null); setError(null); }}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all"
                >
                  Nova Numerologia
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppContainer>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-xl font-semibold text-white mb-4">{children}</h2>;
}

function LetterTable({ data }) {
  return (
    <GlassCard>
      <SectionTitle>Tabela de Equivalência das Letras</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-white/10">
              <th className="text-left py-2 px-2">Letra</th>
              {Object.keys(LETTER_MAP).slice(0, 9).map(l => (
                <th key={l} className="py-2 px-1 text-center">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-2 px-2 text-slate-400">Valor</td>
              {Object.keys(LETTER_MAP).slice(0, 9).map(l => (
                <td key={l} className="py-2 px-1 text-center text-white">{LETTER_MAP[l]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-white/10">
              <th className="text-left py-2 px-2">Letra</th>
              {Object.keys(LETTER_MAP).slice(9, 18).map(l => (
                <th key={l} className="py-2 px-1 text-center">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-2 text-slate-400">Valor</td>
              {Object.keys(LETTER_MAP).slice(9, 18).map(l => (
                <td key={l} className="py-2 px-1 text-center text-white">{LETTER_MAP[l]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-white/10">
              <th className="text-left py-2 px-2">Letra</th>
              {Object.keys(LETTER_MAP).slice(18).map(l => (
                <th key={l} className="py-2 px-1 text-center">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-2 text-slate-400">Valor</td>
              {Object.keys(LETTER_MAP).slice(18).map(l => (
                <td key={l} className="py-2 px-1 text-center text-white">{LETTER_MAP[l]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-purple-300 mb-2">Letras do seu nome:</h3>
        <div className="flex flex-wrap gap-2">
          {(data || []).map((item, i) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-mono">
              {item.letter} = {item.value}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function VowelCard({ data }) {
  if (!data) return null;
  return (
    <GlassCard>
      <SectionTitle>Número da Alma (Vogais)</SectionTitle>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {data.letters.map((l, i) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-pink-500/20 text-pink-300 text-sm font-mono">
              {l} = {letterValue(l)}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs">Soma</p>
            <p className="text-white text-2xl font-bold">{data.sum}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Redução</p>
            <p className="text-white text-2xl font-bold">{data.reduced}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Número da Alma</p>
            <p className="text-pink-400 text-3xl font-bold">{data.soulNumber}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ConsonantCard({ data }) {
  if (!data) return null;
  return (
    <GlassCard>
      <SectionTitle>Número da Personalidade (Consoantes)</SectionTitle>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {data.letters.map((l, i) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-mono">
              {l} = {letterValue(l)}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs">Soma</p>
            <p className="text-white text-2xl font-bold">{data.sum}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Redução</p>
            <p className="text-white text-2xl font-bold">{data.reduced}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Número da Personalidade</p>
            <p className="text-blue-400 text-3xl font-bold">{data.personalityNumber}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ExpressionCard({ data }) {
  if (!data) return null;
  return (
    <GlassCard>
      <SectionTitle>Número da Expressão</SectionTitle>
      <div className="space-y-3">
        <div className="space-y-1">
          {(data.steps || []).map((step, i) => (
            <p key={i} className="text-slate-300 text-sm font-mono">{step}</p>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs">Soma</p>
            <p className="text-white text-2xl font-bold">{data.sum}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Redução</p>
            <p className="text-white text-2xl font-bold">{data.reduced}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Expressão</p>
            <p className="text-purple-400 text-3xl font-bold">{data.number}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function LifePathCard({ data, birthDate }) {
  if (!data) return null;
  return (
    <GlassCard>
      <SectionTitle>Caminho da Vida</SectionTitle>
      <p className="text-slate-400 text-sm mb-3">Data: {birthDate}</p>
      <div className="space-y-2 mb-4">
        {(data.steps || []).map((step, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
            <span className="text-slate-400 text-xs w-40">{step.label}</span>
            <span className="text-white font-mono">{step.value}</span>
            <span className="text-slate-500">→</span>
            <span className="text-purple-400 font-bold font-mono">{step.reduced}</span>
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-slate-400 text-xs">Número do Caminho da Vida</p>
        <p className="text-purple-400 text-4xl font-bold">{data.number}</p>
      </div>
    </GlassCard>
  );
}

const INTERPRETATION_LABELS = {
  soul: "Interpretação da Alma",
  personality: "Interpretação da Personalidade",
  expression: "Interpretação da Expressão",
  lifePath: "Interpretação do Caminho da Vida"
};

const INTERPRETATION_COLORS = {
  soul: "text-pink-400",
  personality: "text-blue-400",
  expression: "text-purple-400",
  lifePath: "text-amber-400"
};

function InterpretationsCard({ data }) {
  if (!data) return null;
  const keys = Object.keys(data);
  return (
    <GlassCard>
      <SectionTitle>Interpretações</SectionTitle>
      <div className="space-y-4">
        {keys.map(key => {
          const item = data[key];
          if (!item) return null;
          return (
            <div key={key} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${INTERPRETATION_COLORS[key] || 'text-white'}`}>
                  {INTERPRETATION_LABELS[key] || key}
                </h3>
                <span className="text-2xl font-bold text-white">{item.number}</span>
              </div>
              <p className="text-purple-200 text-xs font-medium mb-1">{item.essence}</p>
              <p className="text-slate-300 text-sm mb-2">{item.text}</p>
              <div className="flex flex-wrap gap-1">
                {(item.traits || []).map((trait, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function PyramidCard({ data }) {
  if (!data) return null;
  const maxAge = data.length > 0 ? Math.max(...data.map(s => s.age)) : 84;
  return (
    <GlassCard>
      <SectionTitle>Pirâmide da Vida</SectionTitle>
      <div className="flex flex-col items-center">
        {[...data].reverse().map((stage, i) => {
          const width = 100 - i * 15;
          const colors = [
            'from-purple-600 to-pink-600',
            'from-indigo-600 to-purple-600',
            'from-blue-600 to-indigo-600',
            'from-teal-600 to-blue-600'
          ];
          return (
            <div
              key={i}
              style={{ width: `${width}%` }}
              className={`bg-gradient-to-r ${colors[i % colors.length]} rounded-lg p-3 mb-2 text-center transition-all hover:scale-105`}
            >
              <p className="text-white text-xs font-medium">
                {stage.age > 0 ? `${stage.age} anos` : 'Nascimento'} — Número {stage.number}
              </p>
              <p className="text-white/70 text-xs mt-1">{stage.meaning}</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function CabalisticCard({ data }) {
  if (!data) return null;
  return (
    <GlassCard>
      <SectionTitle>Numerologia Cabalística</SectionTitle>
      <div className="space-y-3">
        <p className="text-slate-300 text-sm">
          {data.table?.method || 'Método de cálculo baseado na tabela pitagórica'}
        </p>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Cálculo:</p>
          <p className="text-white text-sm font-mono break-all">{data.calculation}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs">Resultado Cabalístico</p>
          <p className="text-purple-400 text-4xl font-bold">{data.result}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function CorrelationCard({ data }) {
  if (!data) return null;
  return (
    <GlassCard>
      <SectionTitle>Correlação Numérica</SectionTitle>
      <div className="space-y-3">
        <div>
          <p className="text-slate-400 text-xs mb-2">Números encontrados:</p>
          <div className="flex flex-wrap gap-2">
            {(data.numbers || []).map((n, i) => (
              <span key={i} className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center">
                {n}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-2">Características:</p>
          <div className="flex flex-wrap gap-1">
            {(data.characteristics || []).map((c, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-sm">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

const ANGEL_COLORS = [
  'from-purple-500/20 to-pink-500/20',
  'from-indigo-500/20 to-purple-500/20',
  'from-blue-500/20 to-indigo-500/20',
  'from-teal-500/20 to-blue-500/20',
  'from-green-500/20 to-teal-500/20',
  'from-yellow-500/20 to-orange-500/20',
  'from-orange-500/20 to-red-500/20',
  'from-pink-500/20 to-rose-500/20',
  'from-violet-500/20 to-purple-500/20'
];

function AngelNumbersCard({ data }) {
  if (!data) return null;
  return (
    <GlassCard>
      <SectionTitle>Angel Numbers</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(data || []).map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${ANGEL_COLORS[i % ANGEL_COLORS.length]} rounded-xl p-4 border border-white/5`}>
            <p className="text-2xl font-bold text-white mb-1">{item.number}</p>
            <p className="text-slate-300 text-xs leading-relaxed">{item.meaning}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function SummaryCard({ text, numbers }) {
  return (
    <GlassCard className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border-purple-500/20">
      <SectionTitle>Resumo Geral</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {(numbers || []).map((n, i) => (
          <span key={i} className="w-10 h-10 rounded-full bg-purple-500/30 text-white font-bold flex items-center justify-center text-lg">
            {n}
          </span>
        ))}
      </div>
      <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
    </GlassCard>
  );
}
