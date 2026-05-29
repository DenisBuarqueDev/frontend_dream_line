import { getElementColor, PLANET_MEANINGS, PLANET_IN_SIGN_INTERPRETATIONS, SIGN_SYMBOLS } from '../services/interpretations';

export function getPlanetsByCategory(planets, category) {
  const categories = {
    personality: ['sun', 'moon', 'mercury'],
    love: ['venus', 'moon'],
    career: ['jupiter', 'saturn'],
    all: null
  };
  
  const relevantPlanets = categories[category];
  if (!relevantPlanets) return planets;
  
  return planets.filter(p => relevantPlanets.includes(p.planet));
}

const PLANET_ICONS = {
  sun: '☀️',
  moon: '🌙',
  mercury: '🗣️',
  venus: '❤️',
  mars: '⚡',
  jupiter: '🎯',
  saturn: '🏛️',
  uranus: '⚡',
  neptune: '✨',
  pluto: '🌑'
};

const ELEMENT_GRADIENTS = {
  fire: { from: 'from-red-500/20', to: 'to-orange-500/10' },
  earth: { from: 'from-green-500/20', to: 'to-emerald-500/10' },
  air: { from: 'from-blue-500/20', to: 'to-cyan-500/10' },
  water: { from: 'from-sky-500/20', to: 'to-indigo-500/10' }
};

function PlanetCardInterpretiveInner({ planet, index = 0 }) {
  const elementColors = getElementColor(planet.sign);
  const element = elementColors ? Object.keys(ELEMENT_GRADIENTS).find(
    key => elementColors.border && elementColors.border.includes(
      { fire: '#EF4444', earth: '#22C55E', air: '#3B82F6', water: '#0EA5E9' }[key]
    )
  ) : null;
  
  const planetMeaning = PLANET_MEANINGS[planet.planet] || { icon: '⭐', name: planet.planet, description: '' };
  const interpretation = PLANET_IN_SIGN_INTERPRETATIONS[planet.planet]?.[planet.sign];
  
  const gradient = element ? ELEMENT_GRADIENTS[element] : { from: 'from-purple-500/20', to: 'to-violet-500/10' };
  
  return (
    <div 
      className={`astral-glass-card p-5 astral-animate-fade-in`}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
        background: `linear-gradient(135deg, ${gradient.from.replace('from-', 'rgba(').replace('/20', ', 0.08)').replace('-500', ', 0)')}, ${gradient.to.replace('to-', 'rgba(').replace('/10', ', 0.04)').replace('-500', ', 0)')} 100%)`,
        borderColor: 'rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="astral-planet-icon shrink-0"
          style={{ 
            background: `linear-gradient(135deg, ${gradient.from.replace('from-', '')}30, ${gradient.to.replace('to-', '')}20)`
          }}
        >
          <span className="text-xl">{PLANET_ICONS[planet.planet] || '⭐'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1">
            {planetMeaning.name}
          </p>
          <h4 className="text-lg font-semibold text-white flex items-center gap-2 truncate">
            <span>{SIGN_SYMBOLS[planet.sign]}</span>
            <span>{planet.sign}</span>
            <span className="text-sm text-white/60 font-normal">{planet.degree}°</span>
          </h4>
        </div>
      </div>
      
      <p className="text-sm text-white/65 leading-relaxed mb-4">
        {interpretation || `${planetMeaning.description}. Seu ${planetMeaning.name.toLowerCase()} em ${planet.sign} traz características únicas.`}
      </p>
      
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs text-white/40">Casa {planet.house}</span>
        {planet.retrograde && (
          <span className="text-xs text-amber-400/80 font-medium">♑ Retrogrado</span>
        )}
      </div>
    </div>
  );
}

export function PlanetGrid({ planets, limit }) {
  const displayedPlanets = limit ? planets.slice(0, limit) : planets;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayedPlanets.map((planet, idx) => (
        <PlanetCardInterpretiveInner key={idx} planet={planet} index={idx} />
      ))}
    </div>
  );
}

export default PlanetCardInterpretiveInner;