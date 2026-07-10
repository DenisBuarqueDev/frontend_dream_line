import { useEffect, useState } from 'react';
import IonIcon from "../components/ui/IonIcon";
import { micOutline, starOutline, sparklesOutline, calculatorOutline, imageOutline, checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";

const STEP_META = {
  transcribing: { label: 'Transcrevendo áudio...', icon: <IonIcon icon={micOutline} className="w-4 h-4" />, color: 'from-cyan-500 to-blue-500' },
  interpreting: { label: 'Interpretando seu sonho...', icon: <IonIcon icon={starOutline} className="w-4 h-4" />, color: 'from-purple-500 to-indigo-500' },
  analyzing: { label: 'Analisando emoções e padrões...', icon: <IonIcon icon={sparklesOutline} className="w-4 h-4" />, color: 'from-pink-500 to-rose-500' },
  numerology: { label: 'Calculando numerologia...', icon: <IonIcon icon={calculatorOutline} className="w-4 h-4" />, color: 'from-amber-500 to-yellow-500' },
  image: { label: 'Gerando imagem do sonho...', icon: <IonIcon icon={imageOutline} className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
  spiritual: { label: 'Conectando mensagem espiritual...', icon: <IonIcon icon={starOutline} className="w-4 h-4" />, color: 'from-violet-500 to-purple-500' },
  complete: { label: 'Sonho interpretado!', icon: <IonIcon icon={checkmarkCircleOutline} className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
  error: { label: 'Erro na interpretação', icon: <IonIcon icon={closeCircleOutline} className="w-4 h-4" />, color: 'from-red-500 to-rose-500' },
};

export default function AIStepsOverlay({ steps, currentStep, isVisible, onCancel }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      setProgress(0);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!steps || steps.length === 0 || !currentStep) return;

    const currentIndex = steps.findIndex(s => s.id === currentStep.id);
    if (currentIndex === -1) return;

    const nextPercent = ((currentIndex + 1) / steps.length) * 100;
    setProgress(nextPercent);
  }, [currentStep, steps]);

  if (!visible) return null;

  const currentMeta = STEP_META[currentStep?.id] || STEP_META.interpreting;
  const isComplete = currentStep?.id === 'complete';
  const isError = currentStep?.id === 'error';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-purple-500/10">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            {!isComplete && !isError && (
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentMeta.color} animate-ping opacity-20`} />
            )}
            <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${currentMeta.color} flex items-center justify-center shadow-lg ${!isComplete && !isError ? 'animate-pulse' : ''}`}>
              <span className="text-3xl flex items-center">{currentMeta.icon}</span>
            </div>
          </div>

          <h3 className={`text-xl font-bold mb-2 ${isError ? 'text-red-300' : 'text-white'}`}>
            {currentMeta.label}
          </h3>

          {!isComplete && !isError && (
            <p className="text-purple-200/60 text-sm">
              Processando seu sonho.
            </p>
          )}
        </div>

        {!isComplete && !isError && steps && (
          <div className="space-y-1 mb-6">
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${currentMeta.color} transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-purple-200/40 mt-1">
              <span>{Math.round(progress)}%</span>
              <span>{steps.length} etapas</span>
            </div>
          </div>
        )}

        {!isComplete && !isError && steps && (
          <ul className="space-y-2">
            {steps.map((step, index) => {
              const meta = STEP_META[step.id] || {};
              const isCurrent = currentStep?.id === step.id;
              const isPast = steps.indexOf(currentStep) > index;

              return (
                <li
                  key={step.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                    isCurrent
                      ? 'bg-white/10 border border-white/10'
                      : isPast
                        ? 'text-purple-200/50'
                        : 'text-purple-200/30'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPast
                      ? 'bg-green-500/30 text-green-300'
                      : isCurrent
                        ? `bg-gradient-to-br ${meta.color} text-white`
                        : 'bg-white/10 text-purple-200/30'
                  }`}>
                    {isPast ? '✓' : index + 1}
                  </span>
                  <span className={`text-sm flex-1 ${
                    isCurrent ? 'text-white font-medium' : isPast ? 'text-purple-200/60' : 'text-purple-200/30'
                  }`}>
                    {meta.label || step.id}
                  </span>
                  {isCurrent && (
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${meta.color} animate-pulse`} />
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {isComplete && (
          <p className="text-green-300/80 text-sm text-center mb-4">
            Seu sonho foi analisado com sucesso!
          </p>
        )}

        {isError && onCancel && (
          <button
            onClick={onCancel}
            className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium rounded-xl transition-all text-sm"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
