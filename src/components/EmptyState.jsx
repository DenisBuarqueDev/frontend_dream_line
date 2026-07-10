import IonIcon from "../components/ui/IonIcon";
import { starOutline } from "ionicons/icons";

export default function EmptyState({ icon, title, subtitle, features = [] }) {
  return (
    <div className="astral-empty-state">
      <div className="astral-empty-icon astral-animate-float"><IonIcon icon={icon === "✨" ? starOutline : starOutline} /></div>
      <h2 className="astral-empty-title text-white font-display">{title}</h2>
      <p className="astral-empty-text">{subtitle}</p>
      
      {features.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-white/50">
          {features.map((feature, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}