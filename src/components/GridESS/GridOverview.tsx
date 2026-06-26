import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { GridMetrics } from '../../types';

interface GridOverviewProps {
  gridMetrics: GridMetrics;
}

export default function GridOverview({ gridMetrics }: GridOverviewProps) {
  // Calculate flow parameters
  const isBessCharging = gridMetrics.bessPower < 0;
  const bessAbsPower = Math.abs(gridMetrics.bessPower);
  const isSolarGenerating = gridMetrics.solarPower > 0;
  const isGridImporting = gridMetrics.gridImport > 0;

  // Chart data showing a day of Peak Shaving
  // Total load vs Grid import. Highlight BESS discharge during 12:00 - 16:00
  const peakShavingData = [
    {
      hour: '00:00',
      totalLoad: 60,
      gridImport: 60,
      bessDischarge: 0,
      solarGen: 0,
    },
    {
      hour: '04:00',
      totalLoad: 55,
      gridImport: 55,
      bessDischarge: 0,
      solarGen: 0,
    },
    {
      hour: '08:00',
      totalLoad: 120,
      gridImport: 105,
      bessDischarge: 0,
      solarGen: 15,
    },
    {
      hour: '10:00',
      totalLoad: 155,
      gridImport: 120,
      bessDischarge: 10,
      solarGen: 45,
    },
    {
      hour: '12:00',
      totalLoad: 185,
      gridImport: 135,
      bessDischarge: 35,
      solarGen: 85,
    }, // Shaved! Peak limit = 150 kW
    {
      hour: '14:00',
      totalLoad: 195,
      gridImport: 145,
      bessDischarge: 40,
      solarGen: 90,
    }, // Shaved!
    {
      hour: '16:00',
      totalLoad: 165,
      gridImport: 135,
      bessDischarge: 15,
      solarGen: 60,
    },
    {
      hour: '18:00',
      totalLoad: 140,
      gridImport: 140,
      bessDischarge: 0,
      solarGen: 5,
    },
    {
      hour: '20:00',
      totalLoad: 110,
      gridImport: 110,
      bessDischarge: 0,
      solarGen: 0,
    },
    {
      hour: '23:00',
      totalLoad: 75,
      gridImport: 75,
      bessDischarge: 0,
      solarGen: 0,
    },
  ];

  return (
    <div style={styles.container}>
      {/* 4 grid metrics indicators */}
      <div style={styles.statsGrid}>
        <div className="glass-panel" style={styles.statBox}>
          <span style={styles.statLabel}>Solar Infeed</span>
          <span style={styles.statVal}>
            {gridMetrics.solarPower.toFixed(1)} kW
          </span>
          <div style={styles.statBar}>
            <div
              style={{
                ...styles.statBarFill,
                width: `${(gridMetrics.solarPower / 100) * 100}%`,
                backgroundColor: 'var(--accent-blue)',
              }}
            />
          </div>
        </div>

        <div className="glass-panel" style={styles.statBox}>
          <span style={styles.statLabel}>BESS State</span>
          <span style={styles.statVal}>
            {isBessCharging
              ? `Charging: ${bessAbsPower.toFixed(1)} kW`
              : `Discharging: ${bessAbsPower.toFixed(1)} kW`}
          </span>
          <div style={styles.statBar}>
            <div
              style={{
                ...styles.statBarFill,
                width: `${(bessAbsPower / 100) * 100}%`,
                backgroundColor: 'var(--accent-green)',
              }}
            />
          </div>
        </div>

        <div className="glass-panel" style={styles.statBox}>
          <span style={styles.statLabel}>Grid Import</span>
          <span style={styles.statVal}>
            {gridMetrics.gridImport.toFixed(1)} kW
          </span>
          <div style={styles.statBar}>
            <div
              style={{
                ...styles.statBarFill,
                width: `${(gridMetrics.gridImport / 200) * 100}%`,
                backgroundColor: 'var(--accent-cyan)',
              }}
            />
          </div>
        </div>

        <div className="glass-panel" style={styles.statBox}>
          <span style={styles.statLabel}>Frequency & Power Quality</span>
          <span style={styles.statVal}>
            {gridMetrics.gridFrequency.toFixed(2)} Hz
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            PF: {gridMetrics.powerFactor} | 415V L-L
          </span>
        </div>
      </div>

      {/* Main Row: Animated Energy Flow Diagram & Peak Shaving Graph */}
      <div className="grid-main-layout">
        {/* Animated Energy Flow Diagram */}
        <div className="glass-panel" style={styles.diagramPanel}>
          <h3 style={styles.panelTitle}>Active Energy Flow Diagram</h3>
          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.25rem',
            }}
          >
            Real-time power allocation between solar, storage battery, utility
            grid, and factory load.
          </p>

          <div style={styles.diagramWrap}>
            <svg viewBox="0 0 500 300" style={styles.svgDiagram}>
              {/* Lines / Channels */}
              {/* Solar to Junction (150, 150) */}
              <line
                x1="80"
                y1="150"
                x2="250"
                y2="150"
                stroke={
                  isSolarGenerating
                    ? 'var(--accent-blue)'
                    : 'rgba(255,255,255,0.05)'
                }
                strokeWidth="3"
              />
              {isSolarGenerating && (
                <path
                  d="M 80,150 L 250,150"
                  stroke="#00f5ff"
                  strokeWidth="3"
                  className="flow-line"
                />
              )}

              {/* Grid to Junction */}
              <line
                x1="250"
                y1="60"
                x2="250"
                y2="150"
                stroke={
                  isGridImporting
                    ? 'var(--accent-cyan)'
                    : 'rgba(255,255,255,0.05)'
                }
                strokeWidth="3"
              />
              {isGridImporting && (
                <path
                  d="M 250,60 L 250,150"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  className="flow-line"
                />
              )}

              {/* BESS to Junction */}
              <line
                x1="250"
                y1="240"
                x2="250"
                y2="150"
                stroke={
                  bessAbsPower > 0
                    ? 'var(--accent-green)'
                    : 'rgba(255,255,255,0.05)'
                }
                strokeWidth="3"
              />
              {bessAbsPower > 0 && (
                <path
                  d={
                    isBessCharging
                      ? 'M 250,150 L 250,240'
                      : 'M 250,240 L 250,150'
                  }
                  stroke="#10b981"
                  strokeWidth="3"
                  className="flow-line"
                />
              )}

              {/* Junction to Load (420, 150) */}
              <line
                x1="250"
                y1="150"
                x2="420"
                y2="150"
                stroke="var(--accent-cyan)"
                strokeWidth="3"
              />
              <path
                d="M 250,150 L 420,150"
                stroke="#06b6d4"
                strokeWidth="3"
                className="flow-line"
              />

              {/* Node Icons & Bubbles */}
              {/* Utility Grid */}
              <g transform="translate(250, 60)">
                <circle
                  r="22"
                  fill="#090e1b"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2.5"
                />
                <path
                  d="M-6,-8 L6,-8 M0,-8 L0,8 M-10,2 L10,2 M-5,8 L5,8"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2"
                />
                <text
                  y="36"
                  fill="var(--text-primary)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  UTILITY GRID
                </text>
                <text
                  y="-28"
                  fill="var(--accent-cyan)"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {gridMetrics.gridImport.toFixed(1)} kW
                </text>
              </g>

              {/* Solar Array */}
              <g transform="translate(80, 150)">
                <circle
                  r="22"
                  fill="#090e1b"
                  stroke="var(--accent-blue)"
                  strokeWidth="2.5"
                />
                <circle
                  r="8"
                  fill="none"
                  stroke="var(--accent-blue)"
                  strokeWidth="2"
                />
                <line
                  x1="0"
                  y1="-12"
                  x2="0"
                  y2="-6"
                  stroke="var(--accent-blue)"
                  strokeWidth="2"
                />
                <line
                  x1="0"
                  y1="6"
                  x2="0"
                  y2="12"
                  stroke="var(--accent-blue)"
                  strokeWidth="2"
                />
                <line
                  x1="-12"
                  y1="0"
                  x2="-6"
                  y2="0"
                  stroke="var(--accent-blue)"
                  strokeWidth="2"
                />
                <line
                  x1="6"
                  y1="0"
                  x2="12"
                  y2="0"
                  stroke="var(--accent-blue)"
                  strokeWidth="2"
                />
                <text
                  y="36"
                  fill="var(--text-primary)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  SOLAR PV
                </text>
                <text
                  y="-28"
                  fill="var(--accent-blue)"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {gridMetrics.solarPower.toFixed(1)} kW
                </text>
              </g>

              {/* BESS Battery Storage */}
              <g transform="translate(250, 240)">
                <circle
                  r="22"
                  fill="#090e1b"
                  stroke="var(--accent-green)"
                  strokeWidth="2.5"
                />
                <rect
                  x="-8"
                  y="-10"
                  width="16"
                  height="20"
                  rx="2"
                  fill="none"
                  stroke="var(--accent-green)"
                  strokeWidth="2.5"
                />
                <line
                  x1="-4"
                  y1="-4"
                  x2="4"
                  y2="-4"
                  stroke="var(--accent-green)"
                  strokeWidth="2"
                />
                <line
                  x1="-4"
                  y1="2"
                  x2="4"
                  y2="2"
                  stroke="var(--accent-green)"
                  strokeWidth="2"
                />
                <text
                  y="36"
                  fill="var(--text-primary)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  BESS STORAGE
                </text>
                <text
                  y="-28"
                  fill="var(--accent-green)"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {gridMetrics.bessPower.toFixed(1)} kW
                </text>
              </g>

              {/* Factory Load */}
              <g transform="translate(420, 150)">
                <circle
                  r="22"
                  fill="#090e1b"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2.5"
                />
                <path
                  d="M-10,8 L-10,-4 L-2,-10 L10,-4 L10,8 Z"
                  fill="none"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2"
                />
                <text
                  y="36"
                  fill="var(--text-primary)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  FACTORY LOAD
                </text>
                <text
                  y="-28"
                  fill="var(--accent-cyan)"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {gridMetrics.industrialLoad.toFixed(1)} kW
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Peak Shaving Charts */}
        <div className="glass-panel" style={styles.shavingPanel}>
          <h3 style={styles.panelTitle}>Grid Peak Shaving Profile</h3>
          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
            }}
          >
            Visualizes load leveling: BESS discharges to absorb demand spikes
            when total load crosses {gridMetrics.peakLimit} kW.
          </p>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={peakShavingData}
                margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorGridImport"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--accent-cyan)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--accent-cyan)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorTotalLoad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--accent-red)"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--accent-red)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="hour"
                  stroke="var(--text-secondary)"
                  fontSize={10}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={10} unit="kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-opaque)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />

                {/* Horizontal reference line for Peak Demand limit */}
                <Area
                  type="monotone"
                  dataKey="totalLoad"
                  name="Unmanaged Load (kW)"
                  stroke="var(--accent-red)"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="url(#colorTotalLoad)"
                />

                <Area
                  type="monotone"
                  dataKey="gridImport"
                  name="Managed Grid Demand (kW)"
                  stroke="var(--accent-cyan)"
                  strokeWidth={2.5}
                  fill="url(#colorGridImport)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key metrics box */}
          <div style={styles.savingsBox}>
            <div style={styles.boxStat}>
              <span style={styles.boxLabel}>Peak Shaved Today</span>
              <span style={styles.boxVal}>40.0 kW</span>
            </div>
            <div style={styles.boxStat}>
              <span style={styles.boxLabel}>Demand Charges Saved</span>
              <span style={{ ...styles.boxVal, color: 'var(--accent-green)' }}>
                ₹14,500
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  statBox: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statVal: {
    fontSize: '1.4rem',
    fontWeight: 700,
    fontFamily: 'var(--font-title)',
  },
  statBar: {
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '0.2rem',
  },
  statBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  diagramPanel: {
    padding: '1.5rem',
  },
  panelTitle: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
  },
  diagramWrap: {
    backgroundColor: '#05070e',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgDiagram: {
    width: '100%',
    maxWidth: '500px',
    height: 'auto',
  },
  shavingPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  savingsBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1.25rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  boxStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  boxLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
  },
  boxVal: {
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: 'var(--font-title)',
  },
};
