import { useState, useEffect } from "react";

export default function HomeGreeting({ greeting }) {
  const [animClass, setAnimClass] = useState("opacity-0 translate-y-4");

  useEffect(() => {
    const t = setTimeout(() => setAnimClass("opacity-100 translate-y-0"), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`mb-6 transition-all duration-500 ${animClass}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-white">{greeting}</h2>
      <p className="text-purple-200/70 text-sm mt-1">Como você está hoje?</p>
    </div>
  );
}
