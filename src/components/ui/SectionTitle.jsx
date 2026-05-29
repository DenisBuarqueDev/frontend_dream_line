export default function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h2>
  );
}