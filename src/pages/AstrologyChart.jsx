import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppContainer from '../components/ui/AppContainer';
import { AppHeader } from '../components/ui';
import { generateAstralChart, getAstralCharts, getAstralChartById, deleteAstralChart } from '../services/api';
import ChartSummary from '../components/ChartSummary';
import { PlanetGrid, getPlanetsByCategory } from '../components/PlanetCardInterpretive';
import InsightsPanel from '../components/InsightsPanel';
import EmptyState from '../components/EmptyState';
import { generateCombinedInterpretation, PLANET_IN_SIGN_INTERPRETATIONS } from '../services/interpretations';
import '../styles/astrology.css';

const SIGNS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

const SIGN_SYMBOLS = {
  'Áries': '♈', 'Touro': '♉', 'Gêmeos': '♊', 'Câncer': '♋',
  'Leão': '♌', 'Virgem': '♍', 'Libra': '♎', 'Escorpião': '♏',
  'Sagitário': '♐', 'Capricórnio': '♑', 'Aquário': '♒', 'Peixes': '♓'
};

const HOUSE_COLORS = [
  'rgba(255, 228, 225, 0.15)', 'rgba(230, 230, 250, 0.15)', 'rgba(255, 248, 220, 0.15)', 
  'rgba(224, 255, 255, 0.15)', 'rgba(240, 255, 240, 0.15)', 'rgba(255, 240, 245, 0.15)',
  'rgba(250, 240, 230, 0.15)', 'rgba(232, 232, 232, 0.15)', 'rgba(245, 245, 220, 0.15)', 
  'rgba(230, 230, 250, 0.15)', 'rgba(240, 248, 255, 0.15)', 'rgba(255, 239, 213, 0.15)'
];

const PLANET_COLORS = {
  sun: '#FFD700', moon: '#C0C0C0', mercury: '#A0522D', venus: '#DEB887',
  mars: '#FF4500', jupiter: '#DAA520', saturn: '#F4A460', uranus: '#40E0D0',
  neptune: '#4169E1', pluto: '#8B4513'
};

const PLANET_NAMES = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus',
  mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno'
};

function NatalChartModal({ chartData, width = 380, height = 380 }) {
  const svgRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!chartData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.85;
    const houseRadius = outerRadius * 0.75;

    const g = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);

    const defs = svg.append('defs');
    
    const gradient = defs.append('radialGradient')
      .attr('id', 'astralChartGradient')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#1a1030');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#0F0A1E');

    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    g.append('circle')
      .attr('r', outerRadius + 5)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(139, 92, 246, 0.3)')
      .attr('stroke-width', 1)
      .attr('filter', 'url(#glow)');

    g.append('circle')
      .attr('r', outerRadius)
      .attr('fill', 'url(#astralChartGradient)')
      .attr('stroke', 'rgba(139, 92, 246, 0.5)')
      .attr('stroke-width', 1.5);

    g.append('circle')
      .attr('r', innerRadius)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(139, 92, 246, 0.2)')
      .attr('stroke-width', 1);

    const houses = [];
    for (let i = 0; i < 12; i++) {
      const startAngle = ((i * 30) - 90) * Math.PI / 180;
      const endAngle = ((i * 30 + 30) - 90) * Math.PI / 180;
      houses.push({ startAngle, endAngle, index: i });
    }

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(houseRadius);

    g.selectAll('.house')
      .data(houses)
      .enter()
      .append('path')
      .attr('class', 'house')
      .attr('d', d => arc(d))
      .attr('fill', (d, i) => HOUSE_COLORS[i])
      .attr('stroke', 'rgba(139, 92, 246, 0.2)')
      .attr('stroke-width', 0.5);

    g.selectAll('.sign-label')
      .data(SIGNS)
      .enter()
      .append('text')
      .attr('class', 'sign-label')
      .attr('x', (d, i) => {
        const angle = ((i * 30 + 15) - 90) * Math.PI / 180;
        return Math.cos(angle) * (outerRadius - 35);
      })
      .attr('y', (d, i) => {
        const angle = ((i * 30 + 15) - 90) * Math.PI / 180;
        return Math.sin(angle) * (outerRadius - 35);
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'rgba(255, 255, 255, 0.6)')
      .attr('font-size', '20px')
      .text(d => SIGN_SYMBOLS[d]);

    const planetPositions = chartData.planets.map(p => {
      const signIndex = SIGNS.indexOf(p.sign);
      const signStart = signIndex * 30;
      const degree = signStart + p.degree;
      const angle = (degree - 90) * Math.PI / 180;
      return { ...p, angle, radius: innerRadius * 0.7 };
    });

    const planetGroup = g.selectAll('.planet-group')
      .data(planetPositions)
      .enter()
      .append('g')
      .attr('class', 'planet-group')
      .attr('transform', d => `translate(${Math.cos(d.angle - Math.PI/2) * d.radius}, ${Math.sin(d.angle - Math.PI/2) * d.radius})`)
      .style('cursor', 'pointer');

    planetGroup.append('circle')
      .attr('r', 14)
      .attr('fill', d => PLANET_COLORS[d.planet] || '#888')
      .attr('stroke', 'rgba(255, 255, 255, 0.8)')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    planetGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .text(d => PLANET_NAMES[d.planet]?.[0] || d.planet[0].toUpperCase());

    planetGroup
      .on('mouseenter', (event, d) => {
        const planetName = PLANET_NAMES[d.planet] || d.planet;
        setTooltipContent(`
          <div style="font-weight: 600; margin-bottom: 4px; color: white;">${planetName}</div>
          <div style="font-size: 13px; color: rgba(255,255,255,0.7);">${SIGN_SYMBOLS[d.sign]} ${d.sign} ${d.degree}°</div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px;">Casa ${d.house}</div>
          ${d.retrograde ? '<div style="font-size: 11px; color: #FBBF24; margin-top: 2px;">♑ Retrogrado</div>' : ''}
        `);
        setShowTooltip(true);
        setTooltipPos({ x: event.pageX, y: event.pageY });
      })
      .on('mousemove', (event) => {
        setTooltipPos({ x: event.pageX, y: event.pageY });
      })
      .on('mouseleave', () => {
        setShowTooltip(false);
      });

  }, [chartData, width, height]);

  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height} />
      
      {showTooltip && (
        <div
          className="astral-tooltip"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            maxWidth: 200
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </div>
  );
}

function ChartExplanation({ onClose }) {
  const explanations = [
    { icon: '☀️', title: 'O Sol', desc: 'Sua essência e propósito de vida. O signo mais importante do seu mapa.', color: 'amber' },
    { icon: '🌙', title: 'A Lua', desc: 'Suas emoções e intuição. Como você sente e processa sentimentos.', color: 'violet' },
    { icon: '⬆️', title: 'Ascendente', desc: 'Como você se apresenta ao mundo. Sua primeira impressão.', color: 'pink' },
    { icon: '🪐', title: 'Planetas', desc: 'Cada um representa diferentes áreas da sua vida.', color: 'blue' },
    { icon: '🏠', title: 'Casas', desc: 'As 12 casas representam diferentes áreas da sua vida.', color: 'green' }
  ];
  
  return (
    <div className="fixed inset-0 astral-modal-overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="astral-explanation-card max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-display font-semibold text-white mb-6">Entenda seu Mapa</h3>
        
        <div className="space-y-4">
          {explanations.map((item, idx) => (
            <div key={idx} className={`astral-explanation-item bg-${item.color}-500/10`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <h4 className={`font-semibold text-${item.color}-400`}>{item.title}</h4>
              </div>
              <p className="text-sm text-white/60 ml-9">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 py-4 astral-btn-primary"
        >
          Entendi!
        </button>
      </div>
    </div>
  );
}

export default function AstrologyChart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userPlan = user?.plan || "free";
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    timezone: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isPremium = userPlan === 'premium';
  const isPro = userPlan === 'pro';
  const atPremiumLimit = isPremium && history.length >= 1;

  const parseDateToISO = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 3) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4, 8);
    } else if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    setFormData(prev => ({ ...prev, birthDate: formatted }));
  };

  const loadHistory = async () => {
    try {
      const { charts } = await getAstralCharts();
      setHistory(charts || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  useEffect(() => {
    if (userPlan === 'free') {
      navigate('/dashboard');
      return;
    }
    loadHistory();
  }, [userPlan]);

  useEffect(() => {
    if (history.length > 0 && !chartData) {
      setChartData(history[0]);
    }
  }, [history]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`
      );
      const data = await response.json();
      
      if (data.results) {
        setSearchResults(data.results.map(r => ({
          name: r.name,
          country: r.country || '',
          latitude: r.latitude,
          longitude: r.longitude,
          timezone: r.timezone || 'UTC'
        })));
        setShowResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setSearchResults([]);
    }
  };

  const selectLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      city: location.name,
      country: location.country,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      timezone: location.timezone
    }));
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.birthDate || !formData.birthTime || !formData.city) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Selecione uma localização válida da lista.');
      setLoading(false);
      return;
    }

    try {
      const isoDate = parseDateToISO(formData.birthDate);
      const result = await generateAstralChart({
        name: formData.name || `Mapa Astral ${new Date().toLocaleDateString('pt-BR')}`,
        birthDate: isoDate,
        birthTime: formData.birthTime,
        location: {
          city: formData.city,
          country: formData.country,
          latitude,
          longitude,
          timezone: formData.timezone || 'UTC'
        }
      });
      
      setChartData(result);
      loadHistory();
      setActiveTab('overview');
    } catch (err) {
      setError(err.message || 'Erro ao gerar mapa astral');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chartId) => {
    if (!confirm('Excluir este mapa astral?')) return;
    
    try {
      await deleteAstralChart(chartId);
      loadHistory();
      if (chartData && chartData._id === chartId) {
        setChartData(null);
      }
    } catch (err) {
      setError('Erro ao excluir mapa astral');
    }
  };

  const loadChart = async (chartId) => {
    try {
      const chart = await getAstralChartById(chartId);
      setChartData(chart);
      setActiveTab('overview');
    } catch (err) {
      setError('Erro ao carregar mapa astral');
    }
  };

  const combinedInterpretation = generateCombinedInterpretation(chartData);

  const TABS_CONFIG = [
    { id: 'overview', label: 'Visão Geral', icon: '✨' },
    { id: 'personality', label: 'Personalidade', icon: '🧠' },
    { id: 'love', label: 'Amor', icon: '❤️' },
    { id: 'career', label: 'Carreira', icon: '💫' },
    { id: 'details', label: 'Detalhes', icon: '🌙' }
  ];

  const renderTabContent = () => {
    if (!chartData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col items-center">
              <div className="astral-animate-float">
                <NatalChartModal chartData={chartData} width={350} height={350} />
              </div>
              <button
                onClick={() => setShowExplanation(true)}
                className="mt-6 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
              >
                <span>📖</span> Entender o gráfico
              </button>
            </div>
            <div className="space-y-4">
              <ChartSummary chartData={chartData} />
              <InsightsPanel chartData={chartData} />
            </div>
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-6">
            {[
              { planet: 'sun', icon: '☀️', sign: chartData.sunSign, color: 'amber' },
              { planet: 'moon', icon: '🌙', sign: chartData.moonSign, color: 'violet' },
              { planet: 'ascendant', icon: '⬆️', sign: chartData.ascendant, color: 'pink' }
            ].map((item, idx) => (
              <div key={idx} className="astral-glass-card p-6">
                <h3 className={`font-semibold text-${item.color}-400 mb-3 flex items-center gap-2 text-lg`}>
                  <span>{item.icon}</span> {item.planet === 'ascendant' ? 'Ascendente' : item.planet === 'moon' ? 'Lua' : 'Sol'}: {item.sign}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {PLANET_IN_SIGN_INTERPRETATIONS[item.planet]?.[item.sign] ||
                    `Seu ${item.planet === 'ascendant' ? 'ascendente' : item.planet} em ${item.sign} representa sua ${item.planet === 'ascendant' ? 'máscara social' : item.planet === 'moon' ? 'vida emocional' : 'essência'}.`}
                </p>
              </div>
            ))}
            
            <PlanetGrid planets={getPlanetsByCategory(chartData.planets, 'personality')} />
          </div>
        );

      case 'love':
        return (
          <div className="space-y-6">
            <div className="astral-glass-card p-6 border-l-4 border-l-pink-500">
              <h3 className="font-semibold text-pink-400 mb-3 flex items-center gap-2 text-lg">
                <span>❤️</span> Vênus: O Planeta do Amor
              </h3>
              {chartData.planets.find(p => p.planet === 'venus') ? (
                <div>
                  <p className="text-white/70 leading-relaxed mb-3">
                    {PLANET_IN_SIGN_INTERPRETATIONS.venus?.[chartData.planets.find(p => p.planet === 'venus')?.sign]}
                  </p>
                  <p className="text-sm text-white/50">
                    {SIGN_SYMBOLS[chartData.planets.find(p => p.planet === 'venus')?.sign]} 
                    {chartData.planets.find(p => p.planet === 'venus')?.sign} 
                    {chartData.planets.find(p => p.planet === 'venus')?.degree}° • Casa {chartData.planets.find(p => p.planet === 'venus')?.house}
                  </p>
                </div>
              ) : (
                <p className="text-white/50">Vênus não encontrado.</p>
              )}
            </div>
            
            <div className="astral-glass-card p-6 border-l-4 border-l-violet-500">
              <h3 className="font-semibold text-violet-400 mb-3 flex items-center gap-2 text-lg">
                <span>🌙</span> A Lua: Emoções no Amor
              </h3>
              <p className="text-white/70 leading-relaxed">
                {PLANET_IN_SIGN_INTERPRETATIONS.moon?.[chartData.moonSign]}
              </p>
            </div>
            
            <PlanetGrid planets={getPlanetsByCategory(chartData.planets, 'love')} />
          </div>
        );

      case 'career':
        return (
          <div className="space-y-6">
            <div className="astral-glass-card p-6 border-l-4 border-l-amber-500">
              <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2 text-lg">
                <span>🎯</span> Júpiter: Crescimento
              </h3>
              {chartData.planets.find(p => p.planet === 'jupiter') ? (
                <div>
                  <p className="text-white/70 leading-relaxed mb-2">
                    Seu Júpiter em {chartData.planets.find(p => p.planet === 'jupiter')?.sign} indica como você busca crescer profissionalmente.
                  </p>
                  <p className="text-sm text-white/50">
                    {SIGN_SYMBOLS[chartData.planets.find(p => p.planet === 'jupiter')?.sign]} 
                    {chartData.planets.find(p => p.planet === 'jupiter')?.sign} 
                    {chartData.planets.find(p => p.planet === 'jupiter')?.degree}° • Casa {chartData.planets.find(p => p.planet === 'jupiter')?.house}
                  </p>
                </div>
              ) : (
                <p className="text-white/50">Júpiter não encontrado.</p>
              )}
            </div>
            
            <div className="astral-glass-card p-6 border-l-4 border-l-slate-500">
              <h3 className="font-semibold text-slate-400 mb-3 flex items-center gap-2 text-lg">
                <span>🏛️</span> Saturno: Estrutura
              </h3>
              {chartData.planets.find(p => p.planet === 'saturn') ? (
                <div>
                  <p className="text-white/70 leading-relaxed mb-2">
                    Seu Saturno em {chartData.planets.find(p => p.planet === 'saturn')?.sign} representa suas responsabilidades profissionais.
                  </p>
                  <p className="text-sm text-white/50">
                    {SIGN_SYMBOLS[chartData.planets.find(p => p.planet === 'saturn')?.sign]} 
                    {chartData.planets.find(p => p.planet === 'saturn')?.sign} 
                    {chartData.planets.find(p => p.planet === 'saturn')?.degree}° • Casa {chartData.planets.find(p => p.planet === 'saturn')?.house}
                  </p>
                </div>
              ) : (
                <p className="text-white/50">Saturno não encontrado.</p>
              )}
            </div>
            
            <PlanetGrid planets={getPlanetsByCategory(chartData.planets, 'career')} />
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <PlanetGrid planets={chartData.planets} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppContainer className="md:items-start md:justify-center md:p-8">
      <AppHeader title="Mapa Astral" onBack={() => { window.location.href = '/dashboard'; }} />
      <div className="w-full max-w-7xl mx-auto flex flex-col md:block flex-1 md:flex-none px-4 md:px-0">
        <div className="flex flex-col gap-8">
          <div>
            {chartData ? (
              <div className="space-y-6">
                <ChartSummary chartData={chartData} />
                
                <div className="astral-tabs-container">
                  <div className="flex overflow-x-auto astral-scroll-hide border-b border-white/10">
                    {TABS_CONFIG.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`astral-tab ${activeTab === tab.id ? 'active' : ''}`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-6">
                    {combinedInterpretation && activeTab === 'overview' && (
                      <div className="astral-glass-card p-6 mb-6 border-l-4 border-l-purple-500">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <span>✨</span> Sua Análise
                        </h3>
                        <p className="text-white/70 leading-relaxed font-light">{combinedInterpretation}</p>
                      </div>
                    )}
                    
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState 
                icon=""
                title=""
                subtitle="Preencha seus dados de nascimento e descubra uma análise única do seu céu natal, feita especialmente para você."
                features={['☀️ Sol, Lua e Ascendente', '🗣️ Comunicação e Amor', '💫 Carreira e Crescimento']}
              />
            )}
          </div>

          <div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Seus Dados</h2>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Nome do Mapa</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Meu Mapa 2024"
                    maxLength={50}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Data de Nascimento *</label>
                    <input
                      type="text"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleDateChange}
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      required
                      className="astral-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/50 mb-2">Hora *</label>
                    <input
                      type="time"
                      name="birthTime"
                      value={formData.birthTime}
                      onChange={handleInputChange}
                      required
                      className="astral-input w-full"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm text-white/50 mb-2">Local de Nascimento *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => {
                      handleInputChange(e);
                      searchLocation(e.target.value);
                    }}
                    placeholder="Buscar cidade..."
                    required
                    className="astral-input w-full"
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 astral-glass max-h-48 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectLocation(result)}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-white/80"
                        >
                          <span className="font-medium text-white">{result.name}</span>
                          <span className="text-white/40 text-sm ml-2">{result.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {formData.city && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-sm">
                    <p className="text-purple-400">📍 {formData.city}, {formData.country}</p>
                  </div>
                )}

                {atPremiumLimit && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm">
                    <p className="text-amber-300">
                      Plano Premium permite apenas 1 mapa astral. Exclua o mapa existente para gerar outro ou faça upgrade para o plano Pro.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/pricing')}
                      className="mt-2 text-purple-400 hover:text-purple-300 underline text-xs"
                    >
                      Ver planos
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || atPremiumLimit}
                  className="astral-btn-primary w-full"
                >
                  {atPremiumLimit ? (
                    'Limite atingido'
                  ) : loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gerando...
                    </span>
                  ) : (
                    'Gerar Meu Mapa'
                  )}
                </button>
              </form>
              
              {history.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                    <span>📜</span> Meus Mapas
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto astral-scroll-hide">
                    {history.map(chart => (
                      <div 
                        key={chart._id} 
                        className={`astral-glass-card p-3 cursor-pointer transition-all ${chartData?._id === chart._id ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => loadChart(chart._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white text-sm">{chart.name || 'Mapa Astral'}</h4>
                            <p className="text-xs text-white/40 mt-0.5">
                              {new Date(chart.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-white/60 mt-1">
                              ☀️ {chart.sunSign} • 🌙 {chart.moonSign} • ⬆️ {chart.ascendant}
                            </p>
                          </div>
                          {(isPremium || isPro) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(chart._id);
                              }}
                              className="text-white/30 hover:text-red-400 transition-colors p-1"
                              title="Excluir"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showExplanation && (
        <ChartExplanation onClose={() => setShowExplanation(false)} />
      )}
    </AppContainer>
  );
}