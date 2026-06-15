import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sendEmotionChatMessage, getEmotionConversation } from "../services/api";
import AppContainer from "../components/ui/AppContainer";
import GlassCard from "../components/ui/GlassCard";
import AppHeader from "../components/ui/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function EmotionChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getEmotionConversation(id)
      .then((result) => {
        if (result.success) {
          setMessages(result.data.messages || []);
        }
      })
      .catch((err) => console.error("Erro ao carregar conversa:", err))
      .finally(() => setLoadingHistory(false));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const result = await sendEmotionChatMessage(id, text);
      if (result.success) {
        const aiMessage = result.data.messages[result.data.messages.length - 1];
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, não consegui responder agora. Tente novamente." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingHistory) {
    return (
      <AppContainer>
        <AppHeader title="Conversa" onBack={() => navigate(`/emotions/${id}/analysis`)} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppHeader title="Conversa" onBack={() => navigate(`/emotions/${id}/analysis`)} />
      <div className="flex-1 flex flex-col px-4 pb-4">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-w-xl w-full mx-auto">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Vamos conversar
              </h3>
              <p className="text-purple-200 text-sm max-w-xs">
                Conte mais sobre como você está se sentindo. Estou aqui para ouvir.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : "bg-white/10 border border-white/10 text-purple-100"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className="text-[10px] mt-1 opacity-40">
                  {msg.role === "user" ? "Você" : "IA"}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="max-w-xl w-full mx-auto">
          <GlassCard className="p-2 border-white/10">
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-400 resize-none px-2 py-1 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppContainer>
  );
}
