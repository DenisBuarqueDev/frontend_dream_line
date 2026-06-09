import { useState, useRef, useEffect, useCallback } from 'react';

const devLog = import.meta.env.DEV ? console.log : () => {};

const audioModules = import.meta.glob('../assets/sounds/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function useHzPlayer(audioFile) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioSrc = audioModules[`../assets/sounds/${audioFile}`] || '';

  devLog(`[HzPlayer] Arquivo: ${audioFile}, URL:`, audioSrc);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    devLog(`[HzPlayer] Carregando: ${audioFile}`);

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(true);

    const onLoadStart = () => setIsLoading(true);
    const onCanPlay = () => {
      devLog(`[HzPlayer] Pronto: ${audioFile}`);
      setIsLoading(false);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      devLog(`[HzPlayer] Concluído: ${audioFile}`);
      setIsPlaying(false);
    };
    const onError = () => {
      const msg = audio.error?.message || 'Erro ao carregar áudio';
      console.error(`[HzPlayer] Erro:`, audio.error?.code, msg);
      setError('Falha ao carregar frequência. Tente novamente.');
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    if (audioSrc) {
      audio.load();
    }

    return () => {
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [audioFile, audioSrc]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    devLog('[HzPlayer] Reproduzir');
    audio.play()
      .then(() => {
        devLog('[HzPlayer] Reproduzindo');
        setIsPlaying(true);
        setError(null);
      })
      .catch((err) => {
        console.error('[HzPlayer] Bloqueado:', err.message);
        setError('Clique novamente para ouvir (navegador bloqueou o áudio automático).');
        setIsPlaying(false);
      });
  }, [audioSrc]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    devLog('[HzPlayer] Pausar');
    audio.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    devLog('[HzPlayer] Parar');
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((v) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume(v);
  }, []);

  return {
    audioRef,
    audioSrc,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    volume,
    play,
    pause,
    stop,
    seek,
    changeVolume,
  };
}
