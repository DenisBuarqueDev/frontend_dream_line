export default function Input({ type = "text", value, onChange, placeholder, disabled = false, className = "", ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full bg-white/5 border border-white/10 rounded-xl
        px-4 py-3 text-white placeholder:text-slate-400
        focus:ring-2 focus:ring-purple-500 focus:border-purple-500
        outline-none transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
}