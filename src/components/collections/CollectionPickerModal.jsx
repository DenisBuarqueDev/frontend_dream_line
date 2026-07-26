import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function CollectionPickerModal({ collections, dreamId, onSelect, onClose }) {
  const { t } = useTranslation();
  const [selectedCollection, setSelectedCollection] = useState('');

  const handleConfirm = () => {
    if (!selectedCollection) return;
    onSelect(selectedCollection, dreamId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">{t('collectionPicker.title')}</h2>

        {collections.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            {t('collectionPicker.empty')}
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {collections.map((collection) => (
              <button
                key={collection._id || collection.id}
                onClick={() => setSelectedCollection(collection._id || collection.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  selectedCollection === (collection._id || collection.id)
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{collection.name}</span>
                {collection.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{collection.description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium rounded-xl transition-all"
          >
            {t('shared.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCollection}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('shared.add')}
          </button>
        </div>
      </div>
    </div>
  );
}

export { CollectionPickerModal };
export default CollectionPickerModal;
