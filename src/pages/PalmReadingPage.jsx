import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createPalmReading,
  getPalmReadings,
  getPalmReadingById,
  deletePalmReading,
} from "../services/api";
import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import GlassCard from "../components/ui/GlassCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PalmReportCards from "../components/palm/PalmReportCards";
import IonIcon from "../components/ui/IonIcon";
import {
  imagesOutline,
  cloudUploadOutline,
  trashOutline,
  arrowForwardOutline,
  handLeftOutline,
} from "ionicons/icons";

const GUIDE_STEPS = [
  "palmReading.guide.step1",
  "palmReading.guide.step2",
  "palmReading.guide.step3",
  "palmReading.guide.step4",
];

export default function PalmReadingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [leftFile, setLeftFile] = useState(null);
  const [rightFile, setRightFile] = useState(null);
  const [leftPreview, setLeftPreview] = useState(null);
  const [rightPreview, setRightPreview] = useState(null);

  const [phase, setPhase] = useState("guia");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentReading, setCurrentReading] = useState(null);
  const [history, setHistory] = useState([]);

  const refreshHistory = useCallback(() => {
    getPalmReadings(1, 10)
      .then((res) => setHistory(res.readings || []))
      .catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    return () => {
      if (leftPreview) URL.revokeObjectURL(leftPreview);
      if (rightPreview) URL.revokeObjectURL(rightPreview);
    };
  }, [leftPreview, rightPreview]);

  const handleLeftFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLeftFile(file);
    setLeftPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleRightFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRightFile(file);
    setRightPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!leftFile && !rightFile) return;
    setLoading(true);
    setError(null);
    setPhase("processando");
    try {
      const res = await createPalmReading({ leftHandFile: leftFile, rightHandFile: rightFile });
      const id = res.reading?._id;
      const detail = id ? await getPalmReadingById(id) : null;
      setCurrentReading(detail?.reading || res.reading);
      setPhase("resultado");
      refreshHistory();
    } catch (err) {
      setError(err.message || t('palmReading.result.error'));
      setPhase("upload");
    } finally {
      setLoading(false);
    }
  }, [leftFile, rightFile, refreshHistory, t]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('palmReading.history.deleteConfirm'))) return;
    try {
      await deletePalmReading(id);
      if (currentReading?._id === id) {
        setCurrentReading(null);
        setPhase("upload");
      }
      refreshHistory();
    } catch {
      setError(t('palmReading.history.errorDelete'));
    }
  };

  const resetForm = () => {
    setLeftFile(null);
    setRightFile(null);
    setLeftPreview((p) => { if (p) URL.revokeObjectURL(p); return null; });
    setRightPreview((p) => { if (p) URL.revokeObjectURL(p); return null; });
    setCurrentReading(null);
    setError(null);
    setPhase("upload");
  };

  return (
    <AppContainer>
      <AppHeader title={t('palmReading.pageTitle')} onBack={() => navigate("/dashboard")} />

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="max-w-3xl mx-auto space-y-4 pt-4">

          {phase === "guia" && (
            <GlassCard>
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <IonIcon icon={handLeftOutline} className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">{t('palmReading.guide.title')}</h2>
              </div>
              <ul className="space-y-3 mb-6">
                {GUIDE_STEPS.map((key, idx) => (
                  <li key={key} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-purple-200 font-semibold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-purple-300/80 text-xs text-center mb-4">
                {t('palmReading.guide.handTip')}
              </p>
              <button
                onClick={() => setPhase("upload")}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                {t('palmReading.upload.submit')}
              </button>
            </GlassCard>
          )}

          {phase === "upload" && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-4">{t('palmReading.upload.submit')}</h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLeftFile} />
                  {leftPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img src={leftPreview} alt={t('palmReading.upload.leftHand')} className="w-full h-40 object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                        {t('palmReading.upload.changeImage')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 rounded-xl bg-white/[0.04] border-2 border-dashed border-white/15 hover:border-purple-500/40 text-white transition-all">
                      <IonIcon icon={cloudUploadOutline} className="w-7 h-7 text-purple-300 mb-2" />
                      <span className="text-sm font-medium">{t('palmReading.upload.leftHand')}</span>
                      <span className="text-xs text-slate-400 mt-1">{t('palmReading.upload.leftHint')}</span>
                    </div>
                  )}
                </label>

                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleRightFile} />
                  {rightPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img src={rightPreview} alt={t('palmReading.upload.rightHand')} className="w-full h-40 object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                        {t('palmReading.upload.changeImage')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 rounded-xl bg-white/[0.04] border-2 border-dashed border-white/15 hover:border-purple-500/40 text-white transition-all">
                      <IonIcon icon={imagesOutline} className="w-7 h-7 text-purple-300 mb-2" />
                      <span className="text-sm font-medium">{t('palmReading.upload.rightHand')}</span>
                      <span className="text-xs text-slate-400 mt-1">{t('palmReading.upload.rightHint')}</span>
                    </div>
                  )}
                </label>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || (!leftFile && !rightFile)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner /> : <IonIcon icon={arrowForwardOutline} className="w-4 h-4" />}
                {loading ? t('shared.generating') : t('palmReading.upload.submit')}
              </button>

              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </GlassCard>
          )}

          {phase === "processando" && (
            <GlassCard className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4">
                <LoadingSpinner />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">{t('palmReading.processing.title')}</h2>
              <p className="text-slate-400 text-sm">{t('palmReading.processing.subtitle')}</p>
            </GlassCard>
          )}

          {phase === "resultado" && currentReading && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {t('palmReading.report.date', {
                    date: new Date(currentReading.createdAt).toLocaleDateString(),
                  })}
                </h2>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                >
                  {t('palmReading.result.newReading')}
                </button>
              </div>
              <PalmReportCards reading={currentReading} />
            </>
          )}

          {history.length > 0 && (
            <GlassCard>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest text-purple-200 mb-3">
                {t('palmReading.history.title')}
              </h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10"
                  >
                    <button
                      onClick={async () => {
                        try {
                          const detail = await getPalmReadingById(item._id);
                          setCurrentReading(detail.reading);
                          setPhase("resultado");
                        } catch {
                          setError(t('palmReading.history.errorLoad'));
                        }
                      }}
                      className="flex-1 text-left text-white/90 text-sm"
                    >
                      {t('palmReading.history.view')} — {new Date(item.createdAt).toLocaleDateString()}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      title={t('palmReading.history.delete')}
                    >
                      <IonIcon icon={trashOutline} className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </AppContainer>
  );
}