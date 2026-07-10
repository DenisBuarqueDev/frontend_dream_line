import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import IonIcon from "../components/ui/IonIcon";
import { bedOutline } from "ionicons/icons";

function DreamListCard({ dream }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const dreamId = dream._id || dream.id;

  return (
    <GlassCard
      className="cursor-pointer hover:bg-white/15 transition-all"
      onClick={() => navigate(`/dreams/${dreamId}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs text-slate-400">{formatDate(dream.createdAt || dream.data)}</p>
        {dream.categorias && dream.categorias.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {dream.categorias.slice(0, 2).map((cat, i) => (
              <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {dream.textoSonho && (
        <p className="text-sm text-purple-100/80 italic line-clamp-2 mb-2">
          {dream.textoSonho}
        </p>
      )}

      {dream.interpretacao && (
        <p className="text-slate-300 text-sm line-clamp-2">
          {dream.interpretacao}
        </p>
      )}

      <div className="flex items-center gap-2 mt-3">
        {dream.sono && (
          <span className="text-xs text-slate-400">
            <IonIcon icon={bedOutline} className="w-4 h-4 inline" /> {dream.sono.duracaoHoras}h
          </span>
        )}
      </div>
    </GlassCard>
  );
}

export { DreamListCard };
export default DreamListCard;
