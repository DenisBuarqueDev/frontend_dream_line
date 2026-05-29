export default function PageHeader({ title, subtitle, children, className = "" }) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      {title && <h1 className="text-3xl font-bold text-white">{title}</h1>}
      {subtitle && <p className="text-purple-200 text-sm mt-2">{subtitle}</p>}
      {children}
    </div>
  );
}