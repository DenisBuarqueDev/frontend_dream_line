export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-white/10 text-white",
    primary: "bg-purple-500/20 text-purple-300",
    secondary: "bg-indigo-500/20 text-indigo-300",
    success: "bg-emerald-500/20 text-emerald-300",
    warning: "bg-amber-500/20 text-amber-300",
    error: "bg-red-500/20 text-red-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}