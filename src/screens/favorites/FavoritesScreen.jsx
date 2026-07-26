import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { DreamListCard } from '../../components/dreams/DreamListCard';
import AppContainer from '../../components/ui/AppContainer';
import { AppHeader, LoadingSpinner } from '../../components/ui';
import EmptyState from '../../components/EmptyState';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function FavoritesScreen() {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data?.success && data?.data?.dreams) {
          setFavorites(data.data.dreams);
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [getToken]);

  if (loading) return <LoadingSpinner />;

  return (
    <AppContainer>
      <AppHeader title={t('favorites.title')} />
      <div className="px-4 py-6 space-y-4">
        {favorites.length === 0 ? (
          <EmptyState
            icon="⭐"
            title={t('favorites.emptyTitle')}
            subtitle={t('favorites.emptySubtitle')}
          />
        ) : (
          favorites.map((dream) => (
            <DreamListCard key={dream._id || dream.id} dream={dream} />
          ))
        )}
      </div>
    </AppContainer>
  );
}

export default FavoritesScreen;
