import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { generateDreamImageWithAI } from '../../services/api';
import AppContainer from '../../components/ui/AppContainer';
import { AppHeader, LoadingSpinner, GlassCard, PrimaryButton } from '../../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function DreamDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken, user } = useAuth();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/dreams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data?.success && data?.data) {
          setDream(data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar sonho:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDream();
  }, [id, getToken]);

  const handleGenerateImage = async () => {
    if (!dream) return;
    setGeneratingImage(true);
    try {
      const result = await generateDreamImageWithAI(dream._id || dream.id);
      if (result?.data?.dream) {
        setDream((prev) => ({ ...prev, ...result.data.dream }));
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!dream) {
    return (
      <AppContainer>
        <AppHeader title="Sonho" onBack={() => navigate('/timeline')} />
        <div className="p-4 text-center text-slate-400">Sonho não encontrado</div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Detalhes do Sonho" onBack={() => navigate('/timeline')} />
      <div className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        {dream.imageUrl && (
          <img
            src={dream.imageUrl}
            alt="Imagem do sonho"
            className="w-full aspect-video object-cover rounded-2xl"
          />
        )}

        {dream.textoSonho && (
          <GlassCard>
            <h2 className="text-white font-semibold mb-2">Seu Sonho</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{dream.textoSonho}</p>
          </GlassCard>
        )}

        {dream.interpretacao && (
          <GlassCard>
            <h2 className="text-white font-semibold mb-2">Interpretação</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{dream.interpretacao}</p>
          </GlassCard>
        )}

        {user?.plan === 'premium' && !dream.imageUrl && (
          <PrimaryButton onClick={handleGenerateImage} disabled={generatingImage}>
            {generatingImage ? 'Gerando imagem...' : 'Gerar Imagem'}
          </PrimaryButton>
        )}

        {dream.createdAt && (
          <p className="text-slate-400 text-xs text-center">
            {new Date(dream.createdAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </AppContainer>
  );
}

export default DreamDetailScreen;
