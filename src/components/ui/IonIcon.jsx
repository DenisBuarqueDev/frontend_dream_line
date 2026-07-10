export default function IonIcon({ icon, className = "w-5 h-5" }) {
  const svg = decodeURIComponent(icon.split(",")[1])
    .replace(/class="[^"]*"/g, "")
    .replace("<svg", '<svg fill="none" stroke="currentColor" stroke-width="32"');
  return (
    <span
      className={`${className} inline-flex items-center justify-center`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
