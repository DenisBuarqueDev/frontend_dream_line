import { getElementColor, SIGN_INTERPRETATIONS } from '../services/interpretations';
import IonIcon from "../components/ui/IonIcon";
import { sunnyOutline, moonOutline, arrowUpOutline } from "ionicons/icons";
import { useTranslation } from 'react-i18next';

export default function ChartSummary({ chartData }) {
  const { t } = useTranslation();
  if (!chartData) return null;
  
  const getInterpretation = (sign, type) => {
    const descriptions = {
      sun: {
        Áries: t('astrology.sun.aries'),
        Touro: t('astrology.sun.taurus'),
        Gêmeos: t('astrology.sun.gemini'),
        Câncer: t('astrology.sun.cancer'),
        Leão: t('astrology.sun.leo'),
        Virgem: t('astrology.sun.virgo'),
        Libra: t('astrology.sun.libra'),
        Escpião: t('astrology.sun.scorpio'),
        Sagitário: t('astrology.sun.sagittarius'),
        Capricórnio: t('astrology.sun.capricorn'),
        Aquário: t('astrology.sun.aquarius'),
        Peixes: t('astrology.sun.pisces')
      },
      moon: {
        Áries: t('astrology.moon.aries'),
        Touro: t('astrology.moon.taurus'),
        Gêmeos: t('astrology.moon.gemini'),
        Câncer: t('astrology.moon.cancer'),
        Leão: t('astrology.moon.leo'),
        Virgem: t('astrology.moon.virgo'),
        Libra: t('astrology.moon.libra'),
        Escpião: t('astrology.moon.scorpio'),
        Sagitário: t('astrology.moon.sagittarius'),
        Capricórnio: t('astrology.moon.capricorn'),
        Aquário: t('astrology.moon.aquarius'),
        Peixes: t('astrology.moon.pisces')
      },
      ascendant: {
        Áries: t('astrology.ascendant.aries'),
        Touro: t('astrology.ascendant.taurus'),
        Gêmeos: t('astrology.ascendant.gemini'),
        Câncer: t('astrology.ascendant.cancer'),
        Leão: t('astrology.ascendant.leo'),
        Virgem: t('astrology.ascendant.virgo'),
        Libra: t('astrology.ascendant.libra'),
        Escpião: t('astrology.ascendant.scorpio'),
        Sagitário: t('astrology.ascendant.sagittarius'),
        Capricórnio: t('astrology.ascendant.capricorn'),
        Aquário: t('astrology.ascendant.aquarius'),
        Peixes: t('astrology.ascendant.pisces')
      }
    };
    
    return descriptions[type]?.[sign] || t('astrology.youAre', { sign: sign.toLowerCase() });
  };
  
  const items = [
    {
      icon: <IonIcon icon={sunnyOutline} className="w-4 h-4" />,
      label: t('astrology.essence'),
      title: chartData.sunSign,
      subtitle: getInterpretation(chartData.sunSign, 'sun'),
      gradient: 'from-amber-500/20 to-orange-500/10',
      borderGlow: 'rgba(251, 191, 36, 0.5)'
    },
    {
      icon: <IonIcon icon={moonOutline} className="w-4 h-4" />,
      label: t('astrology.emotions'),
      title: chartData.moonSign,
      subtitle: getInterpretation(chartData.moonSign, 'moon'),
      gradient: 'from-violet-500/20 to-purple-500/10',
      borderGlow: 'rgba(139, 92, 246, 0.5)'
    },
    {
      icon: <IonIcon icon={arrowUpOutline} className="w-4 h-4" />,
      label: t('astrology.mask'),
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