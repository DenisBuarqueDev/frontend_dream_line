import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  tematicos: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  espirituais: ['#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC'],
  biologicos: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
};

function DreamInsights({ dreams = [] }) {
  const data = useMemo(() => {
    if (!dreams || dreams.length === 0) return null;

    const frequencyMap = {
      tematicos: {},
      espirituais: {},
      biologicos: {},
    };

    const ensureArray = (arr) => (Array.isArray(arr) ? arr : []);

    dreams.forEach((dream) => {
      const tematicos = ensureArray(dream.padroes?.tematicos);
      const espirituais = ensureArray(dream.padroes?.espirituais);
      const biologicos = ensureArray(dream.padroes?.biologicos);

      tematicos.forEach((p) => {
        frequencyMap.tematicos[p] = (frequencyMap.tematicos[p] || 0) + 1;
      });
      espirituais.forEach((p) => {
        frequencyMap.espirituais[p] = (frequencyMap.espirituais[p] || 0) + 1;
      });
      biologicos.forEach((p) => {
        frequencyMap.biologicos[p] = (frequencyMap.biologicos[p] || 0) + 1;
      });
    });

    const formatPieData = (obj) => {
      if (!obj || typeof obj !== 'object') return [];
      return Object.entries(obj).map(([name, value]) => ({ name, value }));
    };

    const formatLineData = () => {
      const allPatterns = [
        ...Object.entries(frequencyMap.tematicos),
        ...Object.entries(frequencyMap.espirituais),
        ...Object.entries(frequencyMap.biologicos),
      ]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      return allPatterns.map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
      }));
    };

    return {
      tematicos: formatPieData(frequencyMap.tematicos),
      espirituais: formatPieData(frequencyMap.espirituais),
      biologicos: formatPieData(frequencyMap.biologicos),
      lineData: formatLineData(),
      total: dreams.length,
    };
  }, [dreams]);

  if (!data) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-2">
            Nenhum dado disponível
          </p>
          <p className="text-slate-400 text-sm">
            Registre seus sonhos para ver a análise
          </p>
        </div>
      </div>
    );
  }

  const renderPieChart = (dataChart, category, colors) => {
    if (!dataChart || dataChart.length === 0) return null;
    return (
      <div className="bg-slate-50 rounded-xl p-4">
        <h3 className="text-base font-semibold text-slate-700 mb-4 capitalize">
          {category}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={dataChart}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {dataChart.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {dataChart.map((entry, index) => (
            <span
              key={entry.name}
              className="text-xs text-slate-500 flex items-center gap-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              {entry.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-hidden">
      <div className="mb-8 overflow-x-auto">
        <div className="bg-slate-50 rounded-xl p-4 min-w-0">
          <h3 className="text-base font-semibold text-slate-700 mb-4">
            Padrões Frequentes
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Bar
                dataKey="count"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {renderPieChart(data.tematicos, 'Temáticos', COLORS.tematicos)}
        {renderPieChart(data.espirituais, 'Espirituais', COLORS.espirituais)}
        {renderPieChart(data.biologicos, 'Biológicos', COLORS.biologicos)}
      </div>
    </div>
  );
}

export default DreamInsights;
