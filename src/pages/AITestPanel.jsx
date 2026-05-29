import { useState, useEffect, useRef, useCallback } from 'react';

const PROVIDER_ICONS = {
  deepseek: '🧠', flux: '🎨', claude: '🤖',
  stability: '🖼️', groq_whisper: '🎙️', web_speech_api: '🎤',
  gateway: '⚡',
};

const PROVIDER_COLORS = {
  online: 'from-green-500 to-emerald-600',
  offline: 'from-red-500 to-rose-600',
  fallback: 'from-amber-500 to-yellow-600',
  parcial: 'from-amber-500 to-yellow-600',
  configurado: 'from-blue-500 to-indigo-600',
  disponivel: 'from-green-500 to-emerald-600',
};

function StatusBadge({ status }) {
  const color = PROVIDER_COLORS[status] || 'from-slate-500 to-slate-600';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${color} text-white`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' || status === 'disponivel' ? 'bg-white' : status === 'offline' ? 'bg-red-200' : 'bg-white/70'}`} />
      {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : status === 'disponivel' ? 'Disponível' : status === 'configurado' ? 'Configurado' : status === 'fallback' ? 'Fallback' : status}
    </span>
  );
}

function StatusCard({ provider, status, icon }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center transition-all hover:scale-[1.02] hover:bg-white/10">
      <div className="text-2xl mb-2">{icon || PROVIDER_ICONS[provider] || '🔌'}</div>
      <p className="text-white text-sm font-medium capitalize mb-2">{provider.replace(/_/g, ' ')}</p>
      <StatusBadge status={status} />
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  );
}

export default function AITestPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState('idle');
  const [textTestResult, setTextTestResult] = useState(null);
  const [imageTestResult, setImageTestResult] = useState(null);
  const [audioTestResult, setAudioTestResult] = useState(null);
  const [testLogs, setTestLogs] = useState([]);
  const [webSpeechAvailable, setWebSpeechAvailable] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [textTesting, setTextTesting] = useState(false);
  const [imageTesting, setImageTesting] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const addLog = useCallback((type, message) => {
    const entry = { time: new Date().toISOString(), type, message };
    setTestLogs(prev => [entry, ...prev].slice(0, 100));
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/diagnostics');
      const data = await res.json();
      setStatus(data);
      addLog('success', 'Status das APIs atualizado');
    } catch (err) {
      addLog('error', `Erro ao buscar status: ${err.message}`);
    }
  }, [addLog]);

  const testText = async () => {
    setTextTesting(true);
    setTextTestResult(null);
    addLog('info', 'Iniciando teste de interpretação (DeepSeek)...');

    const start = Date.now();

    try {
      const res = await fetch('/api/test/deepseek', { headers: authHeaders });
      const data = await res.json();
      const elapsed = Date.now() - start;

      if (data.status === 'offline') {
        addLog('warning', 'DeepSeek offline, tentando fallback Claude...');
        const claudeRes = await fetch('/api/test/claude', { headers: authHeaders });
        const claudeData = await claudeRes.json();
        const claudeElapsed = Date.now() - start;

        setTextTestResult({
          provider: 'claude (fallback)',
          status: claudeData.status,
          response: claudeData.responsePreview || claudeData.error,
          elapsed: claudeElapsed,
        });

        if (claudeData.status === 'online') {
          addLog('success', `Claude fallback respondeu em ${claudeElapsed}ms`);
        } else {
          addLog('error', 'Ambos DeepSeek e Claude falharam');
        }
      } else {
        setTextTestResult({
          provider: 'deepseek',
          status: data.status,
          response: data.responsePreview,
          elapsed,
          tokens: data.tokensUsed,
        });
        addLog('success', `DeepSeek respondeu em ${elapsed}ms`);
      }
    } catch (err) {
      addLog('error', `Erro no teste de texto: ${err.message}`);
      setTextTestResult({ provider: 'erro', status: 'offline', response: err.message, elapsed: Date.now() - start });
    } finally {
      setTextTesting(false);
    }
  };

  const testImage = async () => {
    setImageTesting(true);
    setImageTestResult(null);
    addLog('info', 'Iniciando teste de geração de imagem (FLUX)...');

    const start = Date.now();

    try {
      const res = await fetch('/api/test/flux', { headers: authHeaders });
      const data = await res.json();
      const elapsed = Date.now() - start;

      setImageTestResult({
        provider: data.fallback ? `stability (fallback de flux)` : 'flux',
        status: data.status,
        imageUrl: data.imageUrl,
        elapsed,
        seed: data.seed,
      });

      if (data.status === 'online') {
        addLog('success', `Imagem gerada em ${elapsed}ms via ${data.fallback ? 'Stability fallback' : 'FLUX'}`);
      } else {
        addLog('error', 'Geração de imagem falhou');
      }
    } catch (err) {
      addLog('error', `Erro no teste de imagem: ${err.message}`);
      setImageTestResult({ provider: 'erro', status: 'offline', response: err.message, elapsed: Date.now() - start });
    } finally {
      setImageTesting(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      addLog('info', 'Gravação de áudio iniciada');
    } catch (err) {
      addLog('error', `Erro ao iniciar gravação: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
      addLog('info', 'Gravação finalizada');
    }
  };

  const testAudio = async () => {
    if (!audioBlob) {
      addLog('warning', 'Grave um áudio primeiro');
      return;
    }

    setAudioTesting(true);
    setAudioTestResult(null);
    addLog('info', 'Enviando áudio para Groq Whisper...');

    const start = Date.now();
    const formData = new FormData();
    formData.append('audio', audioBlob, 'test_recording.webm');

    try {
      const res = await fetch('/api/test/whisper', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });
      const data = await res.json();
      const elapsed = Date.now() - start;

      setAudioTestResult({
        provider: data.provider || 'groq-whisper',
        text: data.text,
        elapsed,
        size: audioBlob.size,
        status: data.text ? 'online' : 'offline',
      });

      if (data.text) {
        addLog('success', `Groq Whisper transcreveu em ${elapsed}ms`);
      } else {
        addLog('error', `Transcrição falhou: ${data.error || 'texto vazio'}`);
      }
    } catch (err) {
      addLog('error', `Erro no teste de áudio: ${err.message}`);
      setAudioTestResult({ provider: 'erro', status: 'offline', response: err.message, elapsed: Date.now() - start });
    } finally {
      setAudioTesting(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    setWebSpeechAvailable(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, [fetchStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">🧪 Painel IA / Diagnóstico</h1>
            <p className="text-purple-200/60 text-sm mt-1">Teste e monitore todas as APIs de inteligência artificial</p>
          </div>
          <button
            onClick={fetchStatus}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all"
          >
            ↻ Atualizar
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Status IA</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {status ? (
              <>
                <StatusCard provider="deepseek" status={status.deepseek} icon="🧠" />
                <StatusCard provider="flux" status={status.flux} icon="🎨" />
                <StatusCard provider="claude" status={status.claude} icon="🤖" />
                <StatusCard provider="stability" status={status.stability} icon="🖼️" />
                <StatusCard provider="groq_whisper" status={status.groq_whisper} icon="🎙️" />
                <StatusCard provider="web_speech_api" status={webSpeechAvailable ? 'disponivel' : 'offline'} icon="🎤" />
                <StatusCard provider="gateway" status={status.gateway} icon="⚡" />
              </>
            ) : (
              Array(7).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
                  <div className="h-8 bg-white/10 rounded mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3 mx-auto" />
                </div>
              ))
            )}
          </div>

          {status && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-purple-200/60">
              <span className={`px-2 py-1 rounded-full ${status.mode === 'gateway' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-slate-400'}`}>
                Modo: {status.mode === 'gateway' ? 'Gateway IA' : 'Legado'}
              </span>
              <span className={`px-2 py-1 rounded-full ${status.status === 'online' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                Geral: {status.status === 'online' ? '✅ Todas online' : '⚠️ Parcial'}
              </span>
              {status.notes?.map((note, i) => (
                <span key={i} className="px-2 py-1 rounded-full bg-white/5 text-slate-400">{note}</span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Teste de Interpretação</h2>
            <p className="text-purple-200/40 text-xs mb-4">DeepSeek → Claude (fallback automático)</p>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-4">
              <p className="text-purple-200/60 text-xs">
                Prompt: <span className="text-white/80">"Interprete este sonho: estou voando sobre um oceano escuro."</span>
              </p>
            </div>

            <button
              onClick={testText}
              disabled={textTesting}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {textTesting ? <><Spinner /> Testando...</> : '🧠 Testar DeepSeek'}
            </button>

            {textTestResult && (
              <div className={`mt-4 p-4 rounded-xl border ${
                textTestResult.status === 'online' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">Resposta</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-200/60">{textTestResult.elapsed}ms</span>
                    <StatusBadge status={textTestResult.status} />
                  </div>
                </div>
                <p className="text-purple-200/80 text-sm leading-relaxed">{textTestResult.response}</p>
                <p className="text-xs text-purple-200/40 mt-2">Provider: {textTestResult.provider}{textTestResult.tokens ? ` · ${textTestResult.tokens} tokens` : ''}</p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Teste de Imagem</h2>
            <p className="text-purple-200/40 text-xs mb-4">FLUX → Stability (fallback automático)</p>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-4">
              <p className="text-purple-200/60 text-xs">
                Prompt: <span className="text-white/80">"surreal dream with moonlight and cosmic atmosphere"</span>
              </p>
            </div>

            <button
              onClick={testImage}
              disabled={imageTesting}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {imageTesting ? <><Spinner /> Gerando...</> : '🎨 Gerar Imagem Teste'}
            </button>

            {imageTestResult && (
              <div className={`mt-4 p-4 rounded-xl border ${
                imageTestResult.status === 'online' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">Resultado</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-200/60">{imageTestResult.elapsed}ms</span>
                    <StatusBadge status={imageTestResult.status} />
                  </div>
                </div>

                {imageTestResult.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-black/30">
                    <img
                      src={imageTestResult.imageUrl}
                      alt="Imagem gerada por IA"
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <p className="text-xs text-purple-200/40">Provider: {imageTestResult.provider}{imageTestResult.seed ? ` · Seed: ${imageTestResult.seed}` : ''}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Teste de Áudio</h2>
          <p className="text-purple-200/40 text-xs mb-4">Groq Whisper · Fallback: Web Speech API</p>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={audioTesting}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                recording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
              }`}
            >
              {recording ? '⏹ Parar Gravação' : '🎤 Gravar Áudio'}
            </button>

            {audioBlob && (
              <button
                onClick={testAudio}
                disabled={audioTesting}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {audioTesting ? <><Spinner /> Transcrevendo...</> : '📝 Transcrever'}
              </button>
            )}

            {audioBlob && !audioTesting && (
              <button
                onClick={() => { setAudioBlob(null); setAudioTestResult(null); }}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200/60 transition-all"
              >
                Limpar
              </button>
            )}
          </div>

          {audioBlob && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-purple-200/60 text-xs">🎵 Áudio capturado</span>
                <span className="text-purple-200/40 text-xs">{(audioBlob.size / 1024).toFixed(1)} KB</span>
                <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 flex-1 max-w-[200px]" />
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-4">
            <p className="text-xs text-purple-200/40">
              Web Speech API:{' '}
              <span className={webSpeechAvailable ? 'text-green-400' : 'text-red-400'}>
                {webSpeechAvailable ? '✅ Disponível' : '❌ Indisponível'}
              </span>
            </p>
          </div>

          {audioTestResult && (
            <div className={`p-4 rounded-xl border ${
              audioTestResult.status === 'online' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Transcrição</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-200/60">{audioTestResult.elapsed}ms</span>
                  <StatusBadge status={audioTestResult.status} />
                </div>
              </div>
              <p className="text-purple-200/80 text-sm leading-relaxed">{audioTestResult.text || audioTestResult.response || ' texto vazio'}</p>
              <p className="text-xs text-purple-200/40 mt-2">
                Provider: {audioTestResult.provider}
                {audioTestResult.size ? ` · ${(audioTestResult.size / 1024).toFixed(1)} KB` : ''}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">📋 Logs Detalhados</h2>
            {testLogs.length > 0 && (
              <button
                onClick={() => setTestLogs([])}
                className="text-xs text-purple-200/40 hover:text-white transition-colors"
              >
                Limpar logs
              </button>
            )}
          </div>

          {testLogs.length === 0 ? (
            <p className="text-purple-200/30 text-sm text-center py-8">Nenhum log ainda. Execute os testes acima.</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {testLogs.map((entry, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg ${
                  entry.type === 'error' ? 'bg-red-500/10 text-red-300' :
                  entry.type === 'warning' ? 'bg-amber-500/10 text-amber-300' :
                  entry.type === 'success' ? 'bg-green-500/10 text-green-300' :
                  'text-purple-200/60'
                }`}>
                  <span className="text-purple-400/40">
                    {entry.time?.split('T')[1]?.split('.')[0]}
                  </span>
                  {' '}{entry.message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <a href="/admin/ai-debug" className="text-purple-300 hover:text-white text-sm transition-colors mr-4">
            🔧 Debug Completo →
          </a>
          <a href="/dashboard" className="text-purple-300 hover:text-white text-sm transition-colors">
            ← Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
