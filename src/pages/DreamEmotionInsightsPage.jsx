import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDreamEmotionCorrelations } from "../services/api";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const DAY_OPTIONS = [
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
  { label: "180 dias", value: 180 },
];

const DREAM_CATEGORIES = [
  "Perseguição", "Queda", "Água", "Família", "Trabalho",
  "Morte", "Dinheiro", "Viagem", "Relacionamento", "Outros",
];

const CATEGORY_EMOJIS = {
  Perseguição: "🏃", Queda: "📉", Água: "🌊", Família: "👨‍👩‍👧‍👧",
  Trabalho: "💼", Morte: "💀", Dinheiro: "💰", Viagem: "✈️",
  Relacionamento: "💕", Outros: "📌",
};

function getCatEmoji(cat) {
  return CATEGORY_EMOJIS[cat] || "📌";
}

function heatmapColor(value) {
  if (value === 0 || value == null) return "bg-gray-800/30";
  if (value < 15) return "bg-purple-900/40";
  if (value < 30) return "bg-purple-700/50";
  if (value < 50) return "bg-purple-600/60";
  return "bg-purple-500/70";
}

function ChartTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900/95 border border-white/10 rounded-xl px-3 py-2 text-sm text-white shadow-xl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function DreamEmotionInsightsPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDreamEmotionCorrelations(days)
      .then((result) => {
        if (result.success) {
          setData(result.data);
        } else {
          setError("Erro ao carregar correlações.");
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar correlações:", err);
        setError(err.message || "Erro ao carregar correlações.");
      })
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <AppContainer>
        <AppHeader title="Correlações" onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppContainer>
    );
  }

  if (error || !data || data.totalDreams === 0) {
    return (
      <AppContainer>
        <AppHeader title="Correlações" onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-white font-semibold text-lg mb-2">
              {error ? "Erro ao carregar" : "Nenhum dado ainda"}
            </h3>
            <p className="text-purple-200 text-sm mb-4">
              {error
                ? "Não foi possível carregar as correlações."
                : "Registre sonhos e emoções para ver correlações entre eles."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/dreams/new")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
              >
                Registrar sonho
              </button>
              <button
                onClick={() => navigate("/emotions/new")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold"
              >
                Registrar emoção
              </button>
            </div>
          </div>
        </div>
      </AppContainer>
    );
  }

  const {
    dreamCategories = {},
    correlationTable = [],
    correlations = [],
    insights = [],
    totalDreams,
    totalEmotions,
    correlatedCount,
    categoriesIdentified,
  } = data;

  const catChartData = DREAM_CATEGORIES
    .filter(c => (dreamCategories[c] || 0) > 0)
    .map(c => ({ name: c, count: dreamCategories[c] || 0 }))
    .sort((a, b) => b.count - a.count);

  const topCatEntry = catChartData.length > 0 ? catChartData[0] : null;
  const topCorrelation = correlations.length > 0 ? correlations[0] : null;

  return (
    <AppContainer>
      <AppHeader title="Correlações" onBack={() => navigate("/dashboard")} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-4 pt-4">

          <div className="flex gap-2 justify-center">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  days === opt.value
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">🔗</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Principal</p>
              <p className="text-white font-bold text-sm truncate">
                {topCorrelation
                  ? `${topCorrelation.emotion} (${topCorrelation.percentage}%)`
                  : "—"}
              </p>
              <p className="text-purple-300 text-xs">{topCorrelation?.dreamCategory || "—"}</p>
            </GlassCard>

            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">{topCatEntry ? getCatEmoji(topCatEntry.name) : "💭"}</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Categoria</p>
              <p className="text-white font-bold text-sm truncate">{topCatEntry?.name || "—"}</p>
              <p className="text-purple-300 text-xs">{topCatEntry?.count || 0} sonhos</p>
            </GlassCard>

            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">{totalEmotions > 0 ? "😊" : "—"}</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Emoções</p>
              <p className="text-white font-bold text-lg">{totalEmotions}</p>
              <p className="text-purple-300 text-xs">registradas</p>
            </GlassCard>

            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">{totalDreams > 0 ? "🌙" : "—"}</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Sonhos</p>
              <p className="text-white font-bold text-lg">{totalDreams}</p>
              <p className="text-purple-300 text-xs">{correlatedCount} correlacionados</p>
            </GlassCard>
          </div>

          {insights.length > 0 && (
            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold mb-3">📌 Insights</h3>
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <p key={i} className="text-purple-200 text-sm leading-relaxed">{insight}</p>
                ))}
              </div>
            </GlassCard>
          )}

          {catChartData.length > 0 && (
            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold mb-3">📊 Distribuição por Categoria</h3>
              <div style={{ minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={catChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "#a78bfa", fontSize: 11 }} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fill: "#a78bfa", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {correlationTable.length > 0 && (
            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold mb-3">🔥 Mapa de Calor: Emoção × Categoria</h3>
              <p className="text-purple-300 text-xs mb-3">
                Percentual de sonhos correlacionados por emoção e categoria
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-white">
                  <thead>
                    <tr>
                      <th className="text-left text-white/50 font-medium p-2 whitespace-nowrap">Emoção</th>
                      {DREAM_CATEGORIES.map((cat) => (
                        <th key={cat} className="text-center text-white/50 font-medium p-2" title={cat}>
                          {getCatEmoji(cat)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationTable.map((row) => (
                      <tr key={row.emotion} className="border-t border-white/5">
                        <td className="font-medium text-white/80 p-2 whitespace-nowrap">{row.emotion}</td>
                        {DREAM_CATEGORIES.map((cat) => {
                          const val = row[cat] || 0;
                          return (
                            <td
                              key={cat}
                              className={`text-center p-2 rounded ${heatmapColor(val)}`}
                            >
                              {val > 0 ? `${val}%` : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {correlations.length > 0 && (
            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold mb-3">📋 Correlações Detalhadas</h3>
              <div className="space-y-2">
                {correlations.map((c, i) => (
                  <div
                    key={`${c.emotion}-${c.dreamCategory}-${i}`}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium min-w-[100px]">{c.emotion}</span>
                      <span className="text-purple-300 text-sm">→</span>
                      <span className="text-white text-sm">{getCatEmoji(c.dreamCategory)} {c.dreamCategory}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/60">{c.occurrences} sonho{c.occurrences !== 1 ? 's' : ''}</span>
                      <span className={`font-bold ${c.percentage >= 50 ? 'text-green-400' : c.percentage >= 30 ? 'text-yellow-400' : 'text-purple-300'}`}>
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="text-center pb-4">
            <p className="text-white/30 text-xs">
              Período: {days} dias · {totalDreams} sonhos · {totalEmotions} emoções · {correlatedCount} correlações · {categoriesIdentified} categorias
            </p>
          </div>

        </div>
      </div>
    </AppContainer>
  );
}
