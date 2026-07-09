import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CollectionFormModal } from '../../components/collections/CollectionFormModal';
import { CollectionPickerModal } from '../../components/collections/CollectionPickerModal';
import AppContainer from '../../components/ui/AppContainer';
import { AppHeader, LoadingSpinner, GlassCard, PrimaryButton } from '../../components/ui';
import EmptyState from '../../components/EmptyState';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function CollectionsScreen() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const fetchCollections = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data?.success && data?.data) {
        setCollections(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreateCollection = async (name, description) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();
      if (data?.success && data?.data) {
        setCollections((prev) => [...prev, data.data]);
      }
    } catch (error) {
      console.error('Erro ao criar coleção:', error);
    }
  };

  const handleEditCollection = async (name, description) => {
    if (!editingCollection) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/collections/${editingCollection._id || editingCollection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();
      if (data?.success && data?.data) {
        setCollections((prev) =>
          prev.map((c) =>
            (c._id || c.id) === (editingCollection._id || editingCollection.id) ? data.data : c
          )
        );
      }
    } catch (error) {
      console.error('Erro ao editar coleção:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <AppContainer>
      <AppHeader
        title="Coleções"
        onRightClick={() => {
          setEditingCollection(null);
          setShowFormModal(true);
        }}
        rightIcon="+"
      />
      <div className="px-4 py-6 space-y-4">
        {collections.length === 0 ? (
          <EmptyState
            icon="📁"
            title="Nenhuma coleção"
            subtitle="crie coleções para organizar seus sonhos"
          />
        ) : (
          collections.map((collection) => (
            <GlassCard
              key={collection._id || collection.id}
              className="cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => navigate(`/collections/${collection._id || collection.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-slate-300 text-sm">{collection.description}</p>
                  )}
                  <p className="text-slate-400 text-xs mt-1">
                    {collection.dreamCount || 0} sonhos
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCollection(collection);
                    setShowFormModal(true);
                  }}
                  className="text-purple-400 hover:text-purple-300 p-2"
                >
                  ✏️
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <div className="px-4 pb-6">
        <PrimaryButton onClick={() => setShowPickerModal(true)}>
          Adicionar sonhos à coleção
        </PrimaryButton>
      </div>

      {showFormModal && (
        <CollectionFormModal
          collection={editingCollection}
          onSave={(name, description) =>
            editingCollection
              ? handleEditCollection(name, description)
              : handleCreateCollection(name, description)
          }
          onClose={() => {
            setShowFormModal(false);
            setEditingCollection(null);
          }}
        />
      )}

      {showPickerModal && (
        <CollectionPickerModal
          collections={collections}
          onClose={() => setShowPickerModal(false)}
          onSelect={(collectionId, dreamId) => {
            console.log('Adicionar sonho', dreamId, 'à coleção', collectionId);
          }}
        />
      )}
    </AppContainer>
  );
}

export default CollectionsScreen;
