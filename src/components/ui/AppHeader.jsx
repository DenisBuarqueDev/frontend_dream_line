export default function AppHeader({ title, onBack, onRightClick, rightIcon, leftExtra, className = "" }) {
  return (
    <div className={`flex md:hidden items-center justify-between px-4 pt-4 pb-2 ${className}`}>
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all"
            title="Voltar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {leftExtra}
      </div>
      <h1 className="text-lg font-bold text-white">{title}</h1>
      {onRightClick ? (
        <button
          onClick={onRightClick}
          className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all"
          title="Sair"
        >
          {rightIcon || (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
        </button>
      ) : (
        <div className="w-10" />
      )}
    </div>
  );
}
