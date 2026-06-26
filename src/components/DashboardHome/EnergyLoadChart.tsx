
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './DashboardHome.css';

export default function EnergyLoadChart() {
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

  return (
    <div className="glass-panel chart-panel">
      <div className="panel-header">
        <h3 className="panel-title">Multi-Asset Energy Load Curve (24h)</h3>
        <span className="panel-subtitle">Monitored via industrial Modbus/DLMS Gateways</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
            <YAxis stroke="var(--text-secondary)" fontSize={11} unit="kW" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-surface-opaque)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px'
              }} 
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="solar" name="Solar Generation (kW)" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorSolar)" />
            <Area type="monotone" dataKey="load" name="Total Factory Load (kW)" stroke="var(--accent-cyan)" fillOpacity={1} fill="url(#colorLoad)" />
            <Area type="monotone" dataKey="grid" name="Grid Power Import (kW)" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorGrid)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
