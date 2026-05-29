export default function SecondaryButton({ children, onClick, disabled = false, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white/10 hover:bg-white/20 border border-white/10
        text-white rounded-xl px-4 py-2 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}