
import { Cpu, Sun, TrendingUp, Leaf, ArrowUpRight } from 'lucide-react';
import type { GridMetrics } from '../../types';
import './DashboardHome.css';
import { formatINR } from '../../utils/formatters';

interface DashboardStatsProps {
  totalDevices: number;
  gridMetrics: GridMetrics;
}

export default function DashboardStats({ totalDevices, gridMetrics }: DashboardStatsProps) {

  return (
    <div className="stats-grid">
      {/* Total Assets */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-label">Connected Assets</span>
          <div className="icon-wrap icon-wrap-cyan">
            <Cpu size={20} color="var(--accent-cyan)" />
          </div>
        </div>
        <div className="stat-value">{totalDevices}</div>
        <div className="stat-footer">
          <span className="stat-trend-up">
            <ArrowUpRight size={14} /> +12% this week
          </span>
          <span className="stat-sub-text">Target 100k+ by 2031</span>
        </div>
      </div>

      {/* Solar Power */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-label">Active Solar Power</span>
          <div className="icon-wrap icon-wrap-blue">
            <Sun size={20} color="var(--accent-blue)" />
          </div>
        </div>
        <div className="stat-value">
          {gridMetrics.solarPower} <span className="stat-unit">kW</span>
        </div>
        <div className="stat-footer">
          <span className="stat-trend-up">
            Peak 92.0 kW today
          </span>
          <span className="stat-sub-text">Rajasthan & Delhi sites</span>
        </div>
      </div>

      {/* Grid Import */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-label">Net Grid Demand</span>
          <div className="icon-wrap icon-wrap-red">
            <TrendingUp size={20} color={gridMetrics.gridImport > gridMetrics.peakLimit ? "var(--accent-red)" : "var(--accent-cyan)"} />
          </div>
        </div>
        <div className="stat-value">
          {gridMetrics.gridImport} <span className="stat-unit">kW</span>
        </div>
        <div className="stat-footer">
          {gridMetrics.gridImport > gridMetrics.peakLimit ? (
            <span className="stat-trend-down">
              Peak Limit {gridMetrics.peakLimit} kW Exceeded
            </span>
          ) : (
            <span className="stat-trend-up">
              Below Peak Limit ({gridMetrics.peakLimit} kW)
            </span>
          )}
          <span className="stat-sub-text">Industrial Power Factor: {gridMetrics.powerFactor}</span>
        </div>
      </div>

      {/* Accrued Savings */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-label">Financial & CO₂ Savings</span>
          <div className="icon-wrap icon-wrap-green">
            <Leaf size={20} color="var(--accent-green)" />
          </div>
        </div>
        <div className="stat-value stat-value-green">
          {formatINR(gridMetrics.savingsINR, 2)}
        </div>
        <div className="stat-footer">
          <span className="stat-trend-up">
            🌱 {gridMetrics.carbonOffset.toFixed(2)} kg CO₂ Saved
          </span>
          <span className="stat-sub-text">Solar + BESS arbitrage</span>
        </div>
      </div>
    </div>
  );
}
