export default function EmptyState({ icon = '✨', title, subtitle, features = [] }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4">{subtitle}</p>
      
      {features.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {features.map((feature, idx) => (
            <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-xs text-purple-200">
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}