
import type { Device, GridMetrics } from '../../types';
import DashboardStats from './DashboardStats';
import EnergyLoadChart from './EnergyLoadChart';
import LiveAlarms from './LiveAlarms';
import VerticalModules from './VerticalModules';
import './DashboardHome.css';

interface DashboardHomeProps {
  devices: Device[];
  gridMetrics: GridMetrics;
  setActiveTab: (tab: string) => void;
}

export default function DashboardHome({ devices, gridMetrics, setActiveTab }: DashboardHomeProps) {
  // Compute metrics
  const totalDevices = devices.length;
  const activeAlerts = devices.flatMap(d => d.telemetry.faults.map(f => ({ 
    device: d.name, 
    id: d.id, 
    fault: f, 
    status: d.status 
  })));

  return (
    <div className="dashboard-container">
      {/* 4 Stat Cards */}
      <DashboardStats 
        totalDevices={totalDevices} 
        gridMetrics={gridMetrics} 
      />

      {/* Main Charts & Active Alarms Section */}
      <div className="grid-main-layout">
        <EnergyLoadChart />
        
        <LiveAlarms 
          activeAlerts={activeAlerts} 
          onAnalyze={() => setActiveTab('devices')} 
        />
      </div>

      {/* India Vision 2031 Progress & Pilot Modules */}
      <VerticalModules />
    </div>
  );
}
