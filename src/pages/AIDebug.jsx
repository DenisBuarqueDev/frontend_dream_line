import { useState, useEffect } from 'react';
import { getAIGatewayStatus } from '../services/api';
import IonIcon from "../components/ui/IonIcon";
import {
  bugOutline, analyticsOutline, powerOutline, flaskOutline,
  imageOutline, micOutline, closeCircleOutline, calculatorOutline,
  starOutline, bulbOutline, chatboxOutline, clipboardOutline
} from "ionicons/icons";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PROVIDER_ICONS = {
  deepseek: '🧠', flux: '🎨', claude: '🤖',
  stability: '🖼️', whisper: '🎙️', gateway: '⚡',
};

const PROVIDER_COLORS = {
  online: 'from-green-500 to-emerald-600',
  offline: 'from-red-500 to-rose-600',
  fallback: 'from-amber-500 to-yellow-600',
  partial: 'from-amber-500 to-yellow-600',
};

export default function AIDebug() {
  const [health, setHealth] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState('idle');
  const [testingProvider, setTestingProvider] = useState(null);
  const [logs, setLogs] = useState([]);
  const [healthError, setHealthError] = useState(null);

  const fetchHealth = async () => {
    try {
      setHealthError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/health/ai`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealthError(err.message);
    }
  };

  const runAllTests = async () => {
    setLoading('running');
    setTestResults(null);
    setLogs([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/test/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setTestResults(data);

      const allLogs = [];
      for (const [provider, result] of Object.entries(data.tests || {})) {
        if (result.log) allLogs.push(...result.log);
      }
      allLogs.sort((a, b) => a.time.localeCompare(b.time));
      setLogs(allLogs);
    } catch (err) {
      setLogs(prev => [...prev, { time: new Date().toISOString(), type: 'error', message: err.message }]);
    } finally {
      setLoading('idle');
    }
  };

  const testSingleProvider = async (provider) => {
    setTestingProvider(provider);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/test/${provider}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      setTestResults(prev => prev || { tests: {} });
      setTestResults(prev => ({
        ...prev,
        tests: { ...prev.tests, [provider]: data },
      }));

      if (data.log) {
        setLogs(prev => [...data.log, ...prev].sort((a, b) => a.time.localeCompare(b.time)));
      }
    } catch (err) {
      setLogs(prev => [{ time: new Date().toISOString(), type: 'error', message: err.message }, ...prev]);
    } finally {
      setTestingProvider(null);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white"><IonIcon icon={bugOutline} /> AI Debug</h1>
          <p className="text-purple-200/60 text-sm mt-2">Diagnóstico da arquitetura de Inteligência Artificial</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white"><IonIcon icon={analyticsOutline} /> Status das APIs</h2>
            <button onClick={fetchHealth} className="text-purple-300 hover:text-white text-sm transition-colors">
              ↻ Atualizar
            </button>
          </div>

          {healthError && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {healthError}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {health && Object.entries(health).filter(([k]) => k !== 'timestamp' && k !== 'notes' && k !== 'status' && k !== 'mode').map(([provider, status]) => (
              <div key={provider} className={`bg-white/5 rounded-xl p-4 border border-white/10 text-center transition-all hover:scale-[1.02]`}>
                <div className="text-2xl mb-2">{PROVIDER_ICONS[provider] || <IonIcon icon={powerOutline} />}</div>
                <p className="text-white text-sm font-medium capitalize mb-1">{provider}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${PROVIDER_COLORS[status] || 'from-slate-500 to-slate-600'} text-white`}>
                  {status}
                </span>
              </div>
            )) || Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
                <div className="h-8 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded" />
              </div>
            ))}
          </div>

          {health && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-purple-200/60">
              <span className={`px-2 py-1 rounded-full ${health.mode === 'gateway' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-slate-400'}`}>
                Modo: {health.mode === 'gateway' ? 'Gateway IA' : 'Legado'}
              </span>
              {health.notes?.map((note, i) => (
                <span key={i} className="px-2 py-1 rounded-full bg-white/5 text-slate-400">{note}</span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white"><IonIcon icon={flaskOutline} /> Testes</h2>
            <div className="flex gap-2">
              {['deepseek', 'flux', 'claude', 'stability', 'whisper', 'gateway'].map(p => (
                <button
                  key={p}
                  onClick={() => testSingleProvider(p)}
                  disabled={testingProvider === p}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 text-white disabled:opacity-50 transition-all capitalize"
                >
                  {testingProvider === p ? '...' : PROVIDER_ICONS[p]}
                </button>
              ))}
              <button
                onClick={runAllTests}
                disabled={loading === 'running'}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all"
              >
                {loading === 'running' ? 'Testando...' : 'Testar Todos'}
              </button>
            </div>
          </div>

          {testResults && (
            <div className="space-y-3">
              <div className={`text-sm font-medium ${testResults.overall === 'online' ? 'text-green-400' : testResults.overall === 'parcial' ? 'text-amber-400' : 'text-red-400'}`}>
                Status geral: {testResults.overall}
              </div>
              {Object.entries(testResults.tests || {}).map(([provider, result]) => (
                <div key={provider} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{PROVIDER_ICONS[provider]}</span>
                      <span className="text-white font-medium capitalize">{provider}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${PROVIDER_COLORS[result.status] || 'from-slate-500 to-slate-600'} text-white`}>
                        {result.status}
                      </span>
                    </div>
                    {result.elapsed && (
                      <span className="text-xs text-slate-400">{result.elapsed}ms</span>
                    )}
                  </div>
                  {result.responsePreview && (
                    <p className="text-purple-200/60 text-xs mt-1">{result.responsePreview}</p>
                  )}
                  {result.imageUrl && (
                    <p className="text-green-300/60 text-xs mt-1"><IonIcon icon={imageOutline} /> Imagem gerada</p>
                  )}
                  {result.transcription && (
                    <p className="text-purple-200/60 text-xs mt-1"><IonIcon icon={micOutline} /> "{result.transcription}"</p>
                  )}
                  {result.error && (
                    <p className="text-red-400/60 text-xs mt-1"><IonIcon icon={closeCircleOutline} /> {result.error}</p>
                  )}
                  {result.resultPreview && (
                    <div className="flex gap-2 mt-1 text-xs text-purple-200/40">
                      {result.resultPreview.hasNumerology && <span><IonIcon icon={calculatorOutline} /> Numerologia</span>}
                      {result.resultPreview.hasSpiritualMessage && <span><IonIcon icon={starOutline} /> Mensagem espiritual</span>}
                      {result.resultPreview.hasPsychologicalAnalysis && <span><IonIcon icon={bulbOutline} /> Análise psicológica</span>}
                      <span><IonIcon icon={chatboxOutline} /> {result.resultPreview.interpretationLength} caracteres</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {loading === 'running' && !testResults && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-purple-200/60 text-sm">Testando todas as APIs...</p>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4"><IonIcon icon={clipboardOutline} /> Logs</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
              {logs.map((entry, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg ${
                  entry.type === 'error' ? 'bg-red-500/10 text-red-300' :
                  entry.type === 'warning' ? 'bg-amber-500/10 text-amber-300' :
                  entry.type === 'success' ? 'bg-green-500/10 text-green-300' :
                  'text-purple-200/60'
                }`}>
                  <span className="text-purple-400/40">{entry.time?.split('T')[1]?.split('.')[0]}</span>
                  {' '}{entry.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <a href="/dashboard" className="text-purple-300 hover:text-white text-sm transition-colors">
            ← Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
