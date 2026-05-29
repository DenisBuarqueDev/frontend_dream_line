export default function Label({ children, className = "" }) {
  return (
    <label className={`text-sm font-medium text-slate-300 ${className}`}>
      {children}
    </label>
  );
}