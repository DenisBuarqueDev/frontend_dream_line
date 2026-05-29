export default function AppContainer({ children, className = "" }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}