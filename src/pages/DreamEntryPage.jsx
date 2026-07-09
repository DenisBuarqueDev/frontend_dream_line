import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveDream, interpretDreamWithAI } from "../services/api";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import { AppHeader } from "../components/ui";
import logotipo from "../assets/logotipo-white.png";

export default function DreamEntryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dreamDate, setDreamDate] = useState(new Date().toISOString().split("T")[0]);
  const [interpretation, setInterpretation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const userPlan = user?.plan || "free";

  useEffect(() => {
    if (interpretation) {
      saveDream({
        titulo: title,
        textoSonho: description,
        data: dreamDate,
        interpretacao: interpretation.interpretacao,
        categorias: interpretation.categorias,
        padroes: interpretation.padroes,
        sono: interpretation.sono,
      }).catch((err) => console.error("Erro ao salvar sonho:", err));
    }
  }, [interpretation, title, description, dreamDate]);

  const handleInterpret = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await interpretDreamWithAI(description.trim(), {
        generateImage: userPlan === "premium",
      });
      setInterpretation(data.data || data);
    } catch (err) {
      setError(err.message || "Erro ao interpretar sonho.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContainer className="md:items-center md:justify-center">
      <div className="w-full max-w-xl flex flex-col md:block flex-1 md:flex-none">
        <GlassCard className="flex flex-col flex-1 md:block rounded-none md:rounded-2xl p-4 pb-8 md:p-6 lg:p-10 shadow-none md:shadow-xl border-0 md:border">
          <AppHeader title="Registrar Sonho" onBack={() => navigate("/dashboard")} />

          <div className="text-center mb-8">
            <img
              src={logotipo}
              alt="Dream Line Logo"
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white">Dream Line</h1>
            <p className="text-purple-200 text-sm mt-2">
              Conte seu sonho
            </p>
          </div>

          {!interpretation ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-purple-200/70 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Dê um nome ao seu sonho"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-purple-200/70 mb-1">Descrição do sonho</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu sonho com detalhes..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-purple-200/70 mb-1">Data</label>
                <input
                  type="date"
                  value={dreamDate}
                  onChange={(e) => setDreamDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleInterpret}
                disabled={isLoading || !description.trim()}
                className="w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Interpretando...
                  </span>
                ) : (
                  "Interpretar Sonho"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {title || "Seu Sonho"}
                </h3>
                <p className="text-sm text-purple-200/70 mb-4 italic">
                  {description}
                </p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {interpretation.interpretacao}
                  </p>
                </div>
              </div>

              {interpretation.categorias?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interpretation.categorias.map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {interpretation.padroes?.tematicos?.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-xs text-purple-300 font-semibold mb-2">PADRÕES IDENTIFICADOS</p>
                  <div className="flex flex-wrap gap-2">
                    {interpretation.padroes.tematicos.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">🎯 {p}</span>
                    ))}
                    {interpretation.padroes.espirituais?.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">🕊 {p}</span>
                    ))}
                    {interpretation.padroes.biologicos?.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">🧬 {p}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/timeline")}
                className="w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver na Timeline
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </AppContainer>
  );
}
