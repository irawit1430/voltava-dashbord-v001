import { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Zap, Activity, BatteryCharging } from 'lucide-react';
import './DashboardHome.css';

export default function EnergyLoadChart() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'solar' | 'load-grid' | 'battery'>('all');
  const [mouseY, setMouseY] = useState<number | undefined>(undefined);

  const handleMouseMove = (state: any) => {
    if (state && state.chartY !== undefined) {
      // Clamp Y coordinate to prevent it from going out of bounds of the 320px responsive container
      const y = Math.max(10, Math.min(state.chartY - 60, 200));
      setMouseY(y);
    } else {
      setMouseY(undefined);
    }
  };

  const handleMouseLeave = () => {
    setMouseY(undefined);
  };

  // Mock historical power flow curve for Rajasthan and Gurugram Factory
  const chartData = [
    { time: '08:00', solar: 15, load: 120, grid: 105, bessSoc: 60 },
    { time: '10:00', solar: 45, load: 140, grid: 95, bessSoc: 65 },
    { time: '12:00', solar: 85, load: 160, grid: 75, bessSoc: 55 },
    { time: '14:00', solar: 92, load: 175, grid: 83, bessSoc: 40 },
    { time: '16:00', solar: 60, load: 165, grid: 105, bessSoc: 42 },
    { time: '18:00', solar: 10, load: 150, grid: 140, bessSoc: 60 },
    { time: '20:00', solar: 0, load: 135, grid: 135, bessSoc: 75 },
  ];

  // Dynamic stats calculated from data
  const peakSolar = Math.max(...chartData.map(d => d.solar));
  const avgLoad = Math.round(chartData.reduce((acc, d) => acc + d.load, 0) / chartData.length);
  const peakGrid = Math.max(...chartData.map(d => d.grid));
  const currentBess = chartData[chartData.length - 1].bessSoc;

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Sort payload descending by normalized height to match the physical order of the lines
      // Power axis max is ~180, Bess axis max is 100.
      const sortedPayload = [...payload].sort((a: any, b: any) => {
        const aNorm = a.dataKey === 'bessSoc' ? a.value / 100 : a.value / 180;
        const bNorm = b.dataKey === 'bessSoc' ? b.value / 100 : b.value / 180;
        return bNorm - aNorm;
      });

      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-title">🕒 Time: {label}</p>
          <div className="tooltip-items">
            {sortedPayload.map((item: any) => {
              const isBess = item.dataKey === 'bessSoc';
              const unit = isBess ? '%' : 'kW';
              return (
                <div key={item.dataKey} className="tooltip-item" style={{ '--item-color': item.color || item.stroke } as React.CSSProperties}>
                  <span className="tooltip-indicator" />
                  <span className="tooltip-label">{item.name}:</span>
                  <span className="tooltip-value">{item.value}{unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel chart-panel">
      <div className="panel-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="panel-title">Multi-Asset Energy Load Curve (24h)</h3>
          <span className="panel-subtitle">Monitored via industrial Modbus/DLMS Gateways</span>
        </div>
        
        {/* Toggle Filters */}
        <div className="chart-filters">
          <button 
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Assets
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'solar' ? 'active' : ''}`}
            onClick={() => setActiveFilter('solar')}
          >
            <Sun size={12} className="pill-icon" /> Solar
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'load-grid' ? 'active' : ''}`}
            onClick={() => setActiveFilter('load-grid')}
          >
            <Zap size={12} className="pill-icon" /> Load & Grid
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'battery' ? 'active' : ''}`}
            onClick={() => setActiveFilter('battery')}
          >
            <BatteryCharging size={12} className="pill-icon" /> Battery SoC
          </button>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="chart-kpi-summary">
        <div className="kpi-card kpi-card--solar">
          <div className="kpi-icon-wrap"><Sun size={14} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Solar Peak</span>
            <span className="kpi-value">{peakSolar} <span className="kpi-unit">kW</span></span>
          </div>
        </div>
        <div className="kpi-card kpi-card--load">
          <div className="kpi-icon-wrap"><Zap size={14} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Avg Load</span>
            <span className="kpi-value">{avgLoad} <span className="kpi-unit">kW</span></span>
          </div>
        </div>
        <div className="kpi-card kpi-card--grid">
          <div className="kpi-icon-wrap"><Activity size={14} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Grid Peak</span>
            <span className="kpi-value">{peakGrid} <span className="kpi-unit">kW</span></span>
          </div>
        </div>
        <div className="kpi-card kpi-card--battery">
          <div className="kpi-icon-wrap"><BatteryCharging size={14} /></div>
          <div className="kpi-info">
            <span className="kpi-label">BESS Charge</span>
            <span className="kpi-value">{currentBess}%</span>
          </div>
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart 
            data={chartData} 
            margin={{ top: 10, right: -5, left: -25, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.02)" />
            <XAxis 
              dataKey="time" 
              stroke="var(--text-secondary)" 
              fontSize={10} 
              tickLine={false}
              dy={8}
              style={{ fontFamily: 'var(--font-sans)' }}
            />
            <YAxis 
              yAxisId="power"
              stroke="var(--text-secondary)" 
              fontSize={10} 
              tickLine={false}
              unit=" kW"
              dx={-8}
              style={{ fontFamily: 'var(--font-sans)' }}
            />
            {(activeFilter === 'all' || activeFilter === 'battery') && (
              <YAxis 
                yAxisId="battery"
                orientation="right"
                stroke="var(--accent-green)" 
                fontSize={10} 
                tickLine={false}
                unit=" %"
                dx={8}
                domain={[0, 100]}
                style={{ fontFamily: 'var(--font-sans)' }}
              />
            )}
            <Tooltip 
              content={<CustomTooltip />} 
              position={mouseY !== undefined ? { y: mouseY } : undefined}
            />
            
            {/* Conditional Area & Line rendering */}
            {(activeFilter === 'all' || activeFilter === 'solar') && (
              <Area 
                yAxisId="power"
                type="monotone" 
                dataKey="solar" 
                name="Solar Generation" 
                stroke="var(--accent-orange)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSolar)" 
                activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent-orange)' }}
              />
            )}
            
            {(activeFilter === 'all' || activeFilter === 'load-grid') && (
              <Area 
                yAxisId="power"
                type="monotone" 
                dataKey="load" 
                name="Total Factory Load" 
                stroke="var(--accent-cyan)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorLoad)" 
                activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent-cyan)' }}
              />
            )}
            
            {(activeFilter === 'all' || activeFilter === 'load-grid') && (
              <Area 
                yAxisId="power"
                type="monotone" 
                dataKey="grid" 
                name="Grid Power Import" 
                stroke="var(--accent-red)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorGrid)" 
                activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent-red)' }}
              />
            )}

            {(activeFilter === 'all' || activeFilter === 'battery') && (
              <Line
                yAxisId="battery"
                type="monotone"
                dataKey="bessSoc"
                name="Battery State of Charge"
                stroke="var(--accent-green)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2, strokeWidth: 0, fill: 'var(--accent-green)' }}
                activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent-green)' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
