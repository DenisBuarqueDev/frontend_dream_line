import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { generateDreamImageWithAI } from '../../services/api';
import AppContainer from '../../components/ui/AppContainer';
import { AppHeader, LoadingSpinner, GlassCard, PrimaryButton } from '../../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function DreamDetailScreen() {
  const { t } = useTranslation();
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
        <AppHeader title={t('dreamDetail.header')} onBack={() => navigate('/timeline')} />
        <div className="p-4 text-center text-slate-400">{t('dreamDetail.notFound')}</div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title={t('dreamDetail.title')} onBack={() => navigate('/timeline')} />
      <div className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        {dream.imageUrl && (
          <img
            src={dream.imageUrl}
            alt={t('dreamDetail.imageAlt')}
            className="w-full aspect-video object-cover rounded-2xl"
          />
        )}

        {dream.textoSonho && (
          <GlassCard>
            <h2 className="text-white font-semibold mb-2">{t('dreamDetail.yourDream')}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{dream.textoSonho}</p>
          </GlassCard>
        )}

        {dream.interpretacao && (
          <GlassCard>
            <h2 className="text-white font-semibold mb-2">{t('dreamDetail.interpretation')}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{dream.interpretacao}</p>
          </GlassCard>
        )}

        {user?.plan === 'premium' && !dream.imageUrl && (
          <PrimaryButton onClick={handleGenerateImage} disabled={generatingImage}>
            {generatingImage ? t('dreamDetail.generatingImage') : t('dreamDetail.generateImage')}
          </PrimaryButton>
        )}

        {dream.createdAt && (
          <p className="text-slate-400 text-xs text-center">
            {new Date(dream.createdAt).toLocaleDateString('pt-BR')}
          </p>
        )}

        <GlassCard>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {t('dreamDetail.chatTitle')}
          </h2>
          <p className="text-purple-200/70 text-sm mb-4">
            {t('dreamDetail.chatDescription')}
          </p>
          <button
            onClick={() => navigate('/dream-coach')}
            className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all"
          >
            {t('dreamDetail.startChat')}
          </button>
        </GlassCard>
      </div>
    </AppContainer>
  );
}

export default DreamDetailScreen;
