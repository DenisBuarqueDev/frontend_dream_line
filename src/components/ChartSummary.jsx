import { getElementColor, SIGN_INTERPRETATIONS } from '../services/interpretations';
import IonIcon from "../components/ui/IonIcon";
import { sunnyOutline, moonOutline, arrowUpOutline } from "ionicons/icons";

export default function ChartSummary({ chartData }) {
  if (!chartData) return null;
  
  const getInterpretation = (sign, type) => {
    const descriptions = {
      sun: {
        Áries: 'Você nasceu para brilhar e liderar',
        Touro: 'Você valoriza estabilidade e prazer',
        Gêmeos: 'Você é curioso e comunicativo',
        Câncer: 'Você busca segurança emocional',
        Leão: 'Você nasceu para brilhar',
        Virgem: 'Você busca perfeição em tudo',
        Libra: 'Você busca harmonia e equilíbrio',
        Escpião: 'Você tem poder de transformação',
        Sagitário: 'Você busca liberdade e expansão',
        Capricórnio: 'Você é ambicioso e determinado',
        Aquário: 'Você é único e original',
        Peixes: 'Você é intuitivo e sonhador'
      },
      moon: {
        Áries: 'Você sente tudo com intensidade',
        Touro: 'Você precisa de conforto e segurança',
        Gêmeos: 'Você processa emoções pela mente',
        Câncer: 'Você sente com profundidade empatia',
        Leão: 'Você precisa de amor e reconhecimento',
        Virgem: 'Você analisa seus próprios sentimentos',
        Libra: 'Você busca harmonia emocional',
        Escpião: 'Você sente com intensidade transformadora',
        Sagitário: 'Você precisa de liberdade emocional',
        Capricórnio: 'Você é reservado, mas leal',
        Aquário: 'Você intelectualiza seus sentimentos',
        Peixes: 'Você absorve as emoções dos outros'
      },
      ascendant: {
        Áries: 'livre e pioneiro',
        Touro: 'seguro e confiável',
        Gêmeos: 'curioso e adaptável',
        Câncer: 'cuidadoso e protetor',
        Leão: 'carismático e brilhante',
        Virgem: 'analítico e prestativo',
        Libra: 'diplomático e harmonioso',
        Escpião: 'misterioso e intenso',
        Sagitário: 'otimista e aventureiro',
        Capricórnio: 'ambicioso e responsável',
        Aquário: 'independente e inovador',
        Peixes: 'sonhador e compassivo'
      }
    };
    
    return descriptions[type]?.[sign] || `você é ${sign.toLowerCase()}`;
  };
  
  const items = [
    {
      icon: <IonIcon icon={sunnyOutline} className="w-4 h-4" />,
      label: 'Essência',
      title: chartData.sunSign,
      subtitle: getInterpretation(chartData.sunSign, 'sun'),
      gradient: 'from-amber-500/20 to-orange-500/10',
      borderGlow: 'rgba(251, 191, 36, 0.5)'
    },
    {
      icon: <IonIcon icon={moonOutline} className="w-4 h-4" />,
      label: 'Emoções',
      title: chartData.moonSign,
      subtitle: getInterpretation(chartData.moonSign, 'moon'),
      gradient: 'from-violet-500/20 to-purple-500/10',
      borderGlow: 'rgba(139, 92, 246, 0.5)'
    },
    {
      icon: <IonIcon icon={arrowUpOutline} className="w-4 h-4" />,
      label: 'Máscara',
      title: chartData.ascendant,
      subtitle: getInterpretation(chartData.ascendant, 'ascendant'),
      gradient: 'from-pink-500/20 to-rose-500/10',
      borderGlow: 'rgba(244, 114, 182, 0.5)'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className={`astral-glass-card p-6 astral-animate-fade-in astral-stagger-${index + 1}`}
          style={{
            background: `linear-gradient(135deg, ${item.gradient.replace('from-', 'rgba(').split(' ')[0]}, ${item.gradient.includes('20') ? '0.08' : '0.05'} 100%)`,
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="astral-planet-icon"
              style={{ background: `${item.borderGlow}` }}
            >
              <span className="text-2xl flex items-center">{item.icon}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">{item.label}</p>
              <h3 className="text-xl font-semibold text-white font-display">{item.title}</h3>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{item.subtitle}</p>
        </div>
      ))}
    </div>
  );
}