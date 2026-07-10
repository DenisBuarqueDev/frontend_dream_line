import IonIcon from "../components/ui/IonIcon";
import { sparklesOutline } from "ionicons/icons";

export default function DreamNumerologyPanel({ numerology }) {
  if (!numerology) return null;

  const {
    vibration,
    energy,
    frequency,
    chakra,
    planet,
    detectedEmotions,
    spiritualMessage
  } = numerology;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl p-5 sm:p-6 border border-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <IonIcon icon={sparklesOutline} className="w-5 h-5 text-purple-400" />
          Energia do Sonho
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Vibração do Sonho</p>
            <p className="text-2xl font-bold text-purple-300">{vibration}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Energia do Dia</p>
            <p className="text-2xl font-bold text-indigo-300">{energy}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Frequência Hz</p>
            <p className="text-lg font-bold text-purple-200">{frequency}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Chakra</p>
            <p className="text-sm font-semibold text-indigo-200">{chakra}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Planeta Regente</p>
            <p className="text-sm font-semibold text-purple-200">{planet}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Emoções</p>
            <div className="flex flex-wrap gap-1">
              {detectedEmotions && detectedEmotions.length > 0 ? (
                detectedEmotions.map((emotion, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {emotion}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Não detectadas</span>
              )}
            </div>
          </div>
        </div>

        {spiritualMessage && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-purple-500/20">
            <p className="text-xs text-purple-300 mb-1 font-medium">Conselho Espiritual</p>
            <p className="text-sm text-purple-100 leading-relaxed">{spiritualMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
