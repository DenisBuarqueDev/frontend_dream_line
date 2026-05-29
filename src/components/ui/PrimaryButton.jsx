export default function PrimaryButton({ children, onClick, disabled = false, className = "", type = "button", fullWidth = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r from-purple-600 to-indigo-600
        hover:from-purple-500 hover:to-indigo-500
        text-white font-semibold rounded-xl
        px-5 py-3 transition-all shadow-lg
        hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}