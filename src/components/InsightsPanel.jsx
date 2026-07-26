import { useTranslation } from 'react-i18next';
import { generateInsights } from '../services/interpretations';

export default function InsightsPanel({ chartData }) {
  const { t } = useTranslation();
  const insights = generateInsights(chartData);
  
  if (!insights || insights.length === 0) return null;
  
  return (
    <div className="astral-glass-card p-6">
      <h3 className="text-sm uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
        <span>✨</span> Insights do seu mapa
      </h3>
      
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`astral-glass-card p-4 ${insight.type === 'positive' ? 'astral-insight-positive' : 'astral-insight-info'} astral-animate-fade-in`}
            style={{ animationDelay: `${idx * 0.15}s`, opacity: 0 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-white mb-1">{insight.title}</p>
                <p className="text-sm text-white/60">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}