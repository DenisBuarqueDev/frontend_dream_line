import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DreamListCard } from '../../components/dreams/DreamListCard';
import AppContainer from '../../components/ui/AppContainer';
import { AppHeader, LoadingSpinner } from '../../components/ui';
import EmptyState from '../../components/EmptyState';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function CollectionDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [collection, setCollection] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/collections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data?.success && data?.data) {
          setCollection(data.data);
          setDreams(data.data.dreams || []);
        }
      } catch (error) {
        console.error('Erro ao carregar coleção:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id, getToken]);

  if (loading) return <LoadingSpinner />;

  if (!collection) {
    return (
      <AppContainer>
        <AppHeader title="Coleção" onBack={() => navigate('/collections')} />
        <EmptyState
          icon="📁"
          title="Coleção não encontrada"
          subtitle="esta coleção pode ter sido removida"
        />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title={collection.name} onBack={() => navigate('/collections')} />
      <div className="px-4 py-6 space-y-4">
        {collection.description && (
          <p className="text-slate-300 text-sm">{collection.description}</p>
        )}

        {dreams.length === 0 ? (
          <EmptyState
            icon="🌙"
            title="Nenhum sonho nesta coleção"
            subtitle="adicione sonhos para começar"
          />
        ) : (
          dreams.map((dream) => (
            <DreamListCard key={dream._id || dream.id} dream={dream} />
          ))
        )}
      </div>
    </AppContainer>
  );
}

export default CollectionDetailScreen;
