import { useState } from 'react';

export default function PremiumBanner({ 
  title = 'Análise Premium', 
  subtitle = 'Desbloqueie insights profundos',
  features = [
    'Interpretação avançada completa',
    'Detalhes de aspectos astrológicos',
    'Relatório personalizado PDF',
    'Acesso vitalício'
  ],
  price = 'R$ 29,90',
  onUpgrade
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="astral-premium-banner overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/20 flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-white text-lg">{title}</p>
            <p className="text-sm text-white/60">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-amber-400 font-semibold">{price}</span>
          <span className={`text-white/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6">
          <div className="astral-divider mb-5" />
          
          <ul className="space-y-3 mb-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-white/70">
                <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          
          <button
            onClick={onUpgrade}
            className="w-full py-4 bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20"
          >
            Desbloquear Premium
          </button>
        </div>
      </div>
    </div>
  );
}