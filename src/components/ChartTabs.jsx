import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IonIcon from "../components/ui/IonIcon";
import { starOutline, bulbOutline, heartOutline, sparklesOutline, moonOutline } from "ionicons/icons";

const TABS = [
  { id: 'overview', icon: <IonIcon icon={starOutline} className="w-4 h-4" /> },
  { id: 'personality', icon: <IonIcon icon={bulbOutline} className="w-4 h-4" /> },
  { id: 'love', icon: <IonIcon icon={heartOutline} className="w-4 h-4" /> },
  { id: 'career', icon: <IonIcon icon={sparklesOutline} className="w-4 h-4" /> },
  { id: 'details', icon: <IonIcon icon={moonOutline} className="w-4 h-4" /> }
];

export { TABS };

export default function ChartTabs({ children, insights, combinedInterpretation }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="astral-tabs-container">
      <div className="flex overflow-x-auto astral-scroll-hide border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`astral-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="text-lg flex items-center">{tab.icon}</span>
            <span>{t(`astrology.${tab.id}`)}</span>
          </button>
        ))}
      </div>
      
      <div className="p-6">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {combinedInterpretation && (
              <div className="astral-glass-card p-6 border-l-4 border-l-purple-500">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <IonIcon icon={starOutline} className="w-4 h-4" /> {t('astrology.personalizedAnalysis')}
                </h3>
                <p className="text-white/70 leading-relaxed font-light">{combinedInterpretation}</p>
              </div>
            )}
            
            {insights && insights.length > 0 && (
              <div className="astral-glass-card p-6">
                <h3 className="text-sm uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                  <IonIcon icon={bulbOutline} className="w-4 h-4" /> {t('astrology.quickInsights')}
                </h3>
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl ${insight.type === 'positive' ? 'astral-insight-positive' : 'astral-insight-info'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{insight.icon}</span>
                        <div>
                          <p className="font-medium text-white">{insight.title}</p>
                          <p className="text-sm text-white/60">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}