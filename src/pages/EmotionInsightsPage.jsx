import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer,
} from "recharts";
import { getEmotionInsights } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const PIE_COLORS = [
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
  "#3B82F6", "#EF4444", "#14B8A6", "#F97316",
  "#6366F1", "#84CC16",
];

const EMOTION_EMOJIS = {
  "Ansiedade": "😰", "Tristeza": "😢", "Alegria": "😊", "Raiva": "😠",
  "Medo": "😨", "Amor": "😍", "Esperança": "🌟", "Gratidão": "🙏",
  "Frustração": "😤", "Preocupação": "😟", "Confusão": "🤔", "Solidão": "😔",
  "Cansaço": "😴", "Estresse": "😩", "Calma": "🧘", "Paz": "🕊️",
  "Motivação": "💪", "Inspiração": "✨", "Saudade": "🥺", "Vergonha": "😳",
  "Felicidade": "😊", "Tranquilidade": "🧘", "Confiança": "💪",
  "Satisfação": "😌", "Orgulho": "🎉", "Empatia": "🤝", "Compaixão": "💗",
  "Serenidade": "🕊️", "Neutro": "😐",
};

function getEmoji(emotion) {
  return EMOTION_EMOJIS[emotion] || "❤️";
}

function monthName(m) {
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return names[m - 1] || m;
}

function weekLabel(w) {
  if (!w || !w.startDate) return `Sem ${w?.week || "?"}`;
  const d = new Date(w.startDate);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatShortDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function safeArr(arr) {
  return Array.isArray(arr) ? arr : [];
}

function PremiumBlock() {
  const navigate = useNavigate();
  return (
    <AppContainer>
      <AppHeader title="Insights Emocionais" onBack={() => navigate("/dashboard")} />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Insights Emocionais são exclusivos do Premium
          </h3>
          <p className="text-purple-200 text-sm mb-6">
            Acompanhe padrões, intensidade emocional e evolução dos seus sentimentos ao longo do tempo.
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Seja Premium
          </button>
        </div>
      </div>
    </AppContainer>
  );
}

export default function EmotionInsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.plan !== "premium") {
      setLoading(false);
      return;
    }

    getEmotionInsights()
      .then((result) => {
        if (result.success) {
          setRaw(result.data);
        } else {
          setError("erro_tecnico");
        }
      })
      .catch((err) => {
        const msg = err.message || "";
        if (msg.includes("Premium")) {
          setError("premium_block");
        } else {
          setError("erro_tecnico");
        }
      })
      .finally(() => setLoading(false));
  }, [user?.plan]);

  if (user?.plan !== "premium") {
    return <PremiumBlock />;
  }

  if (loading) {
    return (
      <AppContainer>
        <AppHeader title="Insights Emocionais" onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppContainer>
    );
  }

  if (error === "premium_block") {
    return <PremiumBlock />;
  }

  if (error || !raw || raw.totalCount === 0) {
    return (
      <AppContainer>
        <AppHeader title="Insights Emocionais" onBack={() => navigate("/dashboard")} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-white font-semibold text-lg mb-2">
              {error ? "Erro ao carregar" : "Nenhum dado ainda"}
            </h3>
            <p className="text-purple-200 text-sm mb-4">
              {error
                ? "Não foi possível carregar seus insights. Tente novamente."
                : "Registre emoções para ver seus insights emocionais."}
            </p>
            {!error && (
              <button
                onClick={() => navigate("/emotions/new")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
              >
                Registrar emoção
              </button>
            )}
          </div>
        </div>
      </AppContainer>
    );
  }

  const distribution = safeArr(raw.emotionDistribution);
  const weeklyFreq = safeArr(raw.weeklyFrequency);
  const monthlyFreq = safeArr(raw.monthlyFrequency);
  const dailyInt = safeArr(raw.dailyIntensity);
  const insightsList = safeArr(raw.insights);
  const temporal = raw.temporalComparison || { last7Days: { count: 0, avgIntensity: 0, topEmotions: [] }, prev7Days: { count: 0, avgIntensity: 0, topEmotions: [] } };

  const distData = distribution.slice(0, 8).map((e) => ({
    name: e.emotion || e._id || "Desconhecido",
    value: e.count || 0,
    percentage: e.percentage || 0,
    emoji: getEmoji(e.emotion || e._id || ""),
  }));
  const otherCount = distribution.slice(8).reduce((s, e) => s + (e.count || 0), 0);
  if (otherCount > 0) {
    distData.push({ name: "Outros", value: otherCount, percentage: 0, emoji: "📌" });
  }

  const weeklyData = [...weeklyFreq].reverse().map((w) => ({
    name: weekLabel(w),
    count: w.count || 0,
    intensity: w.avgIntensity || 0,
  }));

  const dailyData = dailyInt.map((d) => ({
    name: formatShortDate(d.date),
    intensity: d.avgIntensity || 0,
    count: d.count || 0,
  }));

  const mainInsight = insightsList.length > 0 ? insightsList[0] : null;

  return (
    <AppContainer>
      <AppHeader title="Insights Emocionais" onBack={() => navigate("/dashboard")} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-4 pt-4">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">{getEmoji(raw.predominantEmotion)}</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Predominante</p>
              <p className="text-white font-bold text-lg truncate">{raw.predominantEmotion || "-"}</p>
              <p className="text-purple-300 text-xs">{raw.predominantPct || 0}% dos registros</p>
            </GlassCard>
            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Intensidade média</p>
              <p className="text-white font-bold text-lg">{raw.avgIntensity ?? 0}</p>
              <p className="text-purple-300 text-xs">de 10</p>
            </GlassCard>
            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Registros no mês</p>
              <p className="text-white font-bold text-lg">
                {monthlyFreq.length > 0 ? monthlyFreq[0].count : 0}
              </p>
              <p className="text-purple-300 text-xs">
                {monthlyFreq.length > 0 ? monthName(monthlyFreq[0].month) : "-"}
              </p>
            </GlassCard>
            <GlassCard className="p-4 border-white/10 text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Total</p>
              <p className="text-white font-bold text-lg">{raw.totalCount}</p>
              <p className="text-purple-300 text-xs">registros</p>
            </GlassCard>
          </div>

          {mainInsight && (
            <GlassCard className="p-4 border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mainInsight.icon}</span>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wide mb-0.5">Insight principal</p>
                  <p className="text-purple-200 text-sm">{mainInsight.message}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {insightsList.length > 1 && (
            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold text-sm mb-3">Observações</h3>
              <div className="space-y-2">
                {insightsList.slice(1).map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-purple-200">
                    <span>{insight.icon}</span>
                    <p>{insight.message}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold text-sm mb-4">Distribuição das emoções</h3>
              {distData.length > 0 ? (
                <div className="flex justify-center" style={{ minHeight: 280 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={distData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {distData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        formatter={(value, name) => [`${value} registros`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">Sem dados suficientes.</p>
              )}
              <div className="grid grid-cols-2 gap-1 mt-2">
                {distData.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-purple-200">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="truncate">{e.emoji} {e.name}</span>
                    <span className="text-white/50 ml-auto">{e.percentage}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold text-sm mb-4">Intensidade ao longo do tempo</h3>
              {dailyData.length > 1 ? (
                <div style={{ minHeight: 280 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="intensity"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: "#8B5CF6", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">Registre emoções por mais dias para ver a evolução.</p>
              )}
            </GlassCard>
          </div>

          <GlassCard className="p-4 border-white/10">
            <h3 className="text-white font-semibold text-sm mb-4">Registros por semana</h3>
            {weeklyData.length > 0 ? (
              <div style={{ minHeight: 250 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">Sem dados semanais.</p>
            )}
          </GlassCard>

          {(temporal.last7Days.count > 0 || temporal.prev7Days.count > 0) && (
            <GlassCard className="p-4 border-white/10">
              <h3 className="text-white font-semibold text-sm mb-4">Comparação: Últimos 7 dias vs 7 dias anteriores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wide mb-2">Últimos 7 dias</p>
                  <p className="text-white text-lg font-bold">{temporal.last7Days.count} registros</p>
                  <p className="text-purple-300 text-sm">
                    Intensidade: {temporal.last7Days.avgIntensity}/10
                  </p>
                  {temporal.last7Days.topEmotions && temporal.last7Days.topEmotions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {temporal.last7Days.topEmotions.map((e, i) => (
                        <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-purple-200">
                          {getEmoji(e.emotion)} {e.emotion}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wide mb-2">7 dias anteriores</p>
                  <p className="text-white text-lg font-bold">{temporal.prev7Days.count} registros</p>
                  <p className="text-purple-300 text-sm">
                    Intensidade: {temporal.prev7Days.avgIntensity}/10
                  </p>
                  {temporal.prev7Days.topEmotions && temporal.prev7Days.topEmotions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {temporal.prev7Days.topEmotions.map((e, i) => (
                        <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-purple-200">
                          {getEmoji(e.emotion)} {e.emotion}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {temporal.last7Days.count > 0 && temporal.prev7Days.count > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(() => {
                    const diff = temporal.last7Days.count - temporal.prev7Days.count;
                    const intensityDiff = (temporal.last7Days.avgIntensity - temporal.prev7Days.avgIntensity).toFixed(1);
                    return (
                      <>
                        <div className={`rounded-xl p-3 text-center ${diff > 0 ? 'bg-green-500/10 border border-green-500/30' : diff < 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5 border border-white/10'}`}>
                          <p className={`text-lg font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </p>
                          <p className="text-white/50 text-xs">registros {diff > 0 ? 'a mais' : diff < 0 ? 'a menos' : 'estável'}</p>
                        </div>
                        <div className={`rounded-xl p-3 text-center ${Number(intensityDiff) > 0 ? 'bg-orange-500/10 border border-orange-500/30' : Number(intensityDiff) < 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                          <p className={`text-lg font-bold ${Number(intensityDiff) > 0 ? 'text-orange-400' : Number(intensityDiff) < 0 ? 'text-green-400' : 'text-white'}`}>
                            {Number(intensityDiff) > 0 ? `+${intensityDiff}` : intensityDiff}
                          </p>
                          <p className="text-white/50 text-xs">intensidade {Number(intensityDiff) > 0 ? 'subiu' : Number(intensityDiff) < 0 ? 'caiu' : 'estável'}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </AppContainer>
  );
}
