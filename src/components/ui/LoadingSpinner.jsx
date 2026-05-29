export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={`${sizes[size]} border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin ${className}`} />
  );
}