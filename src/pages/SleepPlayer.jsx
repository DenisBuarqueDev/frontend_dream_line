import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FREQUENCY_MAP = {
  calmo: { hz: "963Hz", file: "963hz.mp3", label: "Calmo" },
  ansioso: { hz: "432Hz", file: "432hz.mp3", label: "Ansioso" },
  estressado: { hz: "396Hz", file: "396hz.mp3", label: "Estressado" },
  cansado: { hz: "111Hz", file: "111hz.mp3", label: "Cansado" },
  desmotivado: { hz: "528Hz", file: "528hz.mp3", label: "Desmotivado" },
  voltar_dormir: { hz: "528Hz", file: "528hz.mp3", label: "Voltar a dormir" },
  
  preocupado: { hz: "852Hz", file: "852hz.mp3", label: "Preocupado" },
  sobrecarregado: { hz: "639Hz", file: "639hz.mp3", label: "Sobrecarregado" },
  triste: { hz: "111Hz", file: "111hz.mp3", label: "Triste" },
  irritado: { hz: "888Hz", file: "888hz.mp3", label: "Irritado" },
  inquieto: { hz: "888Hz", file: "8888hz.mp3", label: "Inquieto" },
  com_medo: { hz: "174Hz", file: "174hz.mp3", label: "Com medo" },

};
//, , , , Inquieto, Com medo,
export default function SleepPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const emotionalState = location.state?.emotionalState || "calmo";
  
  const frequencyData = FREQUENCY_MAP[emotionalState] || FREQUENCY_MAP.calmo;
  const audioFile = frequencyData.file;
  const frequency = frequencyData.hz;
  const stateLabel = frequencyData.label;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current.currentTime);
      });
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleEndSession = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 sm:p-10">
          <button
            onClick={() => navigate("/sleep")}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Modo relaxamento
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-xl">
              <span className="text-purple-300 font-medium">Estado: {stateLabel}</span>
              <span className="text-purple-400">|</span>
              <span className="text-purple-300 font-bold">{frequency}</span>
            </div>
          </div>

          <div className="bg-purple-500/10 rounded-2xl p-6 mb-6 border border-purple-500/20">
            <audio ref={audioRef} src={`/src/assets/sounds/${audioFile}`} />

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-[1.05]"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="w-full max-w-md">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-purple-500/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
            </svg>
            <p className="text-slate-300 text-sm leading-relaxed">
              Coloque fones de ouvido, feche os olhos e respire lentamente
            </p>
          </div>

          <button
            onClick={handleEndSession}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-xl transition-all"
          >
            Encerrar sessão
          </button>
        </div>
      </div>
    </div>
  );
}