import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IonIcon from "../components/ui/IonIcon";
import { shieldCheckmarkOutline } from "ionicons/icons";

export default function PremiumModal({ isOpen, onClose, featureName }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const feature = featureName || t('premium.featureDefault');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-purple-500/20 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
            <IonIcon icon={shieldCheckmarkOutline} className="w-8 h-8 text-purple-400" />
          </div>

          <p className="text-white font-semibold text-lg mb-1">{t('premium.title')}</p>
          <p className="text-slate-400 text-sm mb-6">
            {t('premium.description', { feature })}
          </p>

          <button
            onClick={() => { onClose(); navigate('/pricing'); }}
            className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('premium.subscribe')}
          </button>

          <p className="text-xs text-slate-500 mt-3">
            {t('premium.priceInfo')}
          </p>
        </div>
      </div>
    </div>
  );
}
