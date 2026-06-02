export default function AppContainer({ children, className = "" }) {
  return (
    <div className={`min-h-[100dvh] md:min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex flex-col ${className}`}>
      {children}
    </div>
  );
}
