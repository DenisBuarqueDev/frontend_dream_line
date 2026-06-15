export default function GlassCard({ children, className = "", onClick }) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}