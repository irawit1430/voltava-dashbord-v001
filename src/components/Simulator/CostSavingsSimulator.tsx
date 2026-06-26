import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatINR } from '../../utils/formatters';

interface DiscomOption {
  name: string;
  peak: number;
  offPeak: number;
  demandCharge: number;
}

const DISCOMS: Record<string, DiscomOption> = {
  'bses': { name: 'BSES Rajdhani (Delhi)', peak: 12.5, offPeak: 5.2, demandCharge: 450 },
  'tata': { name: 'Tata Power DDL (Delhi)', peak: 11.8, offPeak: 5.5, demandCharge: 450 },
  'msedcl': { name: 'MSEDCL (Mumbai)', peak: 14.2, offPeak: 6.8, demandCharge: 420 },
  'bescom': { name: 'BESCOM (Bengaluru)', peak: 10.5, offPeak: 4.8, demandCharge: 380 },
  'custom': { name: 'Custom Parameters', peak: 13.0, offPeak: 6.0, demandCharge: 400 },
};

export default function CostSavingsSimulator() {
  const [selectedDiscom, setSelectedDiscom] = useState<string>('bses');
  const [bessCapacity, setBessCapacity] = useState<number>(150); // kWh
  const [peakLimit, setPeakLimit] = useState<number>(120); // kW
  const [peakTariff, setPeakTariff] = useState<number>(12.5); // ₹/kWh
  const [offPeakTariff, setOffPeakTariff] = useState<number>(5.2); // ₹/kWh

  // Update tariffs when DISCOM changes
  useEffect(() => {
    if (selectedDiscom !== 'custom') {
      const info = DISCOMS[selectedDiscom];
      setPeakTariff(info.peak);
      setOffPeakTariff(info.offPeak);
    }
  }, [selectedDiscom]);

  // Calculations
  const demandChargeRate = DISCOMS[selectedDiscom]?.demandCharge || 450; // ₹/kW/month
  const basePeakLoad = 180; // kW unmanaged peak load
  const peakShavedKw = Math.max(0, basePeakLoad - peakLimit);
  
  // Monthly demand charge savings
  const demandSavingsINR = peakShavedKw * demandChargeRate;

  // Arbitrage savings per day: battery charged during off-peak, discharged during peak
  const dailyArbitrageKwh = bessCapacity * 0.85; // 85% depth of discharge
  const roundTripEfficiency = 0.9; // 90%
  const arbitrageSavingsPerDay = dailyArbitrageKwh * (peakTariff - (offPeakTariff / roundTripEfficiency));
  const monthlyArbitrageINR = Math.max(0, arbitrageSavingsPerDay * 30);

  // Total monthly savings
  const totalMonthlySavingsINR = demandSavingsINR + monthlyArbitrageINR;

  // BESS Investment cost (estimated at ₹14,000 per kWh for LFP cabinet systems in India)
  const systemCapEx = bessCapacity * 13500;
  
  // Payback period in years
  const paybackYears = totalMonthlySavingsINR > 0 
    ? Number((systemCapEx / (totalMonthlySavingsINR * 12)).toFixed(1))
    : 99;

  // Chart data
  const chartData = [
    { name: 'Unmanaged Bill', DemandCharges: basePeakLoad * demandChargeRate, EnergyCost: 245000 },
    { name: 'Voltava Optimized', DemandCharges: peakLimit * demandChargeRate, EnergyCost: 245000 - monthlyArbitrageINR },
  ];


  return (
    <div style={styles.container}>
      {/* Top Banner */}
      <div className="glass-panel" style={styles.bannerBox}>
        <div style={styles.bannerHeader}>
          <Sparkles size={18} color="var(--accent-green)" />
          <span style={styles.bannerLabel}>VOLTAVA INTEL ENGINE</span>
        </div>
        <h3 style={styles.bannerTitle}>BESS Peak Shaving & Arbitrage Calculator</h3>
        <p style={styles.bannerDesc}>
          Simulate battery integration. BESS absorbs energy during low-tariff off-peak times (e.g. night/early morning) and discharges to shave expensive demand spikes and offset high peak-hour grid rates.
        </p>
      </div>

      <div className="sim-grid">
        
        {/* Left Side: Sliders & Settings */}
        <div className="glass-panel" style={styles.sliderPanel}>
          <h4 style={styles.sectionHeader}>Simulator Controls</h4>

          {/* DISCOM Select */}
          <div style={styles.controlGroup}>
            <label style={styles.sliderLabel}>Indian Utility DISCOM Tariff Model</label>
            <select
              value={selectedDiscom}
              onChange={(e) => setSelectedDiscom(e.target.value)}
              className="input-control"
              style={styles.selectControl}
            >
              {Object.entries(DISCOMS).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>

          {/* Slider 1: BESS Capacity */}
          <div style={styles.controlGroup}>
            <div style={styles.sliderValueRow}>
              <label style={styles.sliderLabel}>Battery Energy Storage Capacity</label>
              <span style={styles.sliderValue}>{bessCapacity} kWh</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={bessCapacity}
              onChange={(e) => setBessCapacity(Number(e.target.value))}
              style={styles.rangeInput}
            />
            <span style={styles.sliderRangeHint}>50 kWh to 500 kWh cabinet</span>
          </div>

          {/* Slider 2: Peak Limit */}
          <div style={styles.controlGroup}>
            <div style={styles.sliderValueRow}>
              <label style={styles.sliderLabel}>Grid Peak Shaving Limit</label>
              <span style={{ ...styles.sliderValue, color: 'var(--accent-cyan)' }}>{peakLimit} kW</span>
            </div>
            <input
              type="range"
              min="80"
              max="180"
              step="5"
              value={peakLimit}
              onChange={(e) => setPeakLimit(Number(e.target.value))}
              style={styles.rangeInput}
            />
            <span style={styles.sliderRangeHint}>Unmanaged Peak: {basePeakLoad} kW</span>
          </div>

          {/* Custom tariff fields (if custom selected) */}
          <div style={{ ...styles.tariffsRow, display: selectedDiscom === 'custom' ? 'grid' : 'none' }}>
            <div style={styles.controlGroup}>
              <label style={styles.sliderLabel}>Peak Tariff (₹/kWh)</label>
              <input 
                type="number" 
                step="0.5" 
                value={peakTariff} 
                onChange={(e) => {
                  setSelectedDiscom('custom');
                  setPeakTariff(Number(e.target.value));
                }}
                className="input-control"
              />
            </div>
            <div style={styles.controlGroup}>
              <label style={styles.sliderLabel}>Off-Peak (₹/kWh)</label>
              <input 
                type="number" 
                step="0.5" 
                value={offPeakTariff} 
                onChange={(e) => {
                  setSelectedDiscom('custom');
                  setOffPeakTariff(Number(e.target.value));
                }}
                className="input-control"
              />
            </div>
          </div>

          <div style={styles.infoFooter}>
            <HelpCircle size={14} color="var(--text-secondary)" style={{ marginRight: 6 }} />
            <span>CapEx assumes LFP battery cell chemistry @ ₹13,500/kWh inclusive of inverters.</span>
          </div>
        </div>

        {/* Right Side: Results & Cost Comparison Chart */}
        <div style={styles.resultsWrapper}>
          
          {/* Result Cards */}
          <div style={styles.resultsGrid}>
            <div className="glass-panel" style={styles.resultCard}>
              <span style={styles.resultLabel}>Monthly Savings</span>
              <span style={{ ...styles.resultVal, color: 'var(--accent-green)' }}>
                {formatINR(totalMonthlySavingsINR)}
              </span>
              <div style={styles.breakdownSub}>
                <span>Demand: +{formatINR(demandSavingsINR)}</span>
                <span>Arbitrage: +{formatINR(monthlyArbitrageINR)}</span>
              </div>
            </div>

            <div className="glass-panel" style={styles.resultCard}>
              <span style={styles.resultLabel}>Est. System CapEx</span>
              <span style={styles.resultVal}>{formatINR(systemCapEx)}</span>
              <span style={styles.resultMeta}>Payback: <b>{paybackYears} Years</b></span>
            </div>
          </div>

          {/* Bar Chart comparing monthly bills */}
          <div className="glass-panel" style={styles.chartPanel}>
            <h4 style={styles.chartTitle}>Monthly Grid Invoice Comparison</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Shaving peak demand reduces contract demand charges. Time-of-Use (ToU) arbitrage cuts active energy charges.
            </p>
            <div style={{ height: '180px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    formatter={(value) => formatINR(Number(value))}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface-opaque)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="DemandCharges" name="Demand Charges (Contract kW)" fill="var(--accent-red)" stackId="a" />
                  <Bar dataKey="EnergyCost" name="Energy charges (kWh ToU)" fill="var(--accent-cyan)" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
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
  bannerBox: {
    padding: '1.25rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
  },
  bannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.4rem',
  },
  bannerLabel: {
    fontSize: '0.65rem',
    color: 'var(--accent-green)',
    letterSpacing: '0.1em',
    fontWeight: 700,
  },
  bannerTitle: {
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
  },
  bannerDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    marginTop: '0.2rem',
  },
  // mainGrid moved to index.css
  sliderPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  sectionHeader: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.35rem',
    fontWeight: 600,
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  selectControl: {
    cursor: 'pointer',
  },
  sliderValueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  sliderValue: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--accent-green)',
    fontFamily: 'monospace',
  },
  rangeInput: {
    width: '100%',
    cursor: 'pointer',
    accentColor: 'var(--accent-green)',
  },
  sliderRangeHint: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    textAlign: 'right',
  },
  tariffsRow: {
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  infoFooter: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
    marginTop: '0.5rem',
  },
  resultsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  resultCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  resultVal: {
    fontSize: '1.6rem',
    fontWeight: 800,
    fontFamily: 'var(--font-title)',
    marginTop: '0.15rem',
  },
  breakdownSub: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  resultMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  chartPanel: {
    padding: '1.5rem',
  },
  chartTitle: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
};
