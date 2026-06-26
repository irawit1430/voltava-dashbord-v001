import React, { useState } from 'react';
import { 
  Navigation, 
  BatteryCharging, 
  Gauge, 
  AlertTriangle,
  Award,
  Map
} from 'lucide-react';
import type { Device } from '../../types';

interface FleetOverviewProps {
  devices: Device[];
  onInspectDevice: (device: Device) => void;
}

export default function FleetOverview({ devices, onInspectDevice }: FleetOverviewProps) {
  const [selectedCityFilter, setSelectedCityFilter] = useState<'all' | 'Delhi-NCR' | 'Patna, Bihar'>('all');
  const [selectedMapVehicle, setSelectedMapVehicle] = useState<string | null>(null);

  // Extract BMS devices (fleets)
  const bmsDevices = devices.filter(d => d.type === 'bms');

  // Filter based on city
  const cityFilterPrefix = selectedCityFilter === 'all' ? '' : selectedCityFilter.split(',')[0];
  const filteredVehicles = bmsDevices.filter(d => {
    if (selectedCityFilter === 'all') return true;
    return d.location.city.includes(cityFilterPrefix);
  });

  // Calculate fleet stats
  const totalVehicles = filteredVehicles.length;
  const avgSoc = totalVehicles > 0 
    ? filteredVehicles.reduce((acc, curr) => acc + curr.telemetry.soc, 0) / totalVehicles 
    : 0;
  const avgSoh = totalVehicles > 0 
    ? filteredVehicles.reduce((acc, curr) => acc + curr.telemetry.soh, 0) / totalVehicles 
    : 0;

  // Mock driver ratings
  const driverRatings: Record<string, { driver: string; score: number; mileage: number; speedAlerts: number }> = {
    'BMS-ER-NCR-01': { driver: 'Rajesh Kumar', score: 94, mileage: 68.5, speedAlerts: 0 },
    'BMS-ER-BIH-02': { driver: 'Amit Yadav', score: 81, mileage: 42.0, speedAlerts: 2 },
    'BMS-ER-NCR-03': { driver: 'Vikram Singh', score: 62, mileage: 55.4, speedAlerts: 6 },
  };

  const selectedVehicleData = selectedMapVehicle 
    ? devices.find(d => d.id === selectedMapVehicle) 
    : null;

  return (
    <div style={styles.container}>
      {/* KPIs Summary */}
      <div style={styles.statsGrid}>
        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Active Pilot Fleet</span>
            <Navigation size={18} color="var(--accent-blue)" />
          </div>
          <div style={styles.kpiValue}>{totalVehicles} <span style={styles.kpiUnit}>Vehicles</span></div>
          <div style={styles.kpiFooter}>NCR/Bihar region deployment</div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Average Battery SOC</span>
            <BatteryCharging size={18} color="var(--accent-green)" />
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--accent-green)' }}>{avgSoc.toFixed(1)}%</div>
          <div style={styles.kpiFooter}>Real-time SoC tracking</div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Fleet Driving Score</span>
            <Award size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--accent-cyan)' }}>79.3 / 100</div>
          <div style={styles.kpiFooter}>Based on acceleration profiles</div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Average Battery SOH</span>
            <Gauge size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--accent-blue)' }}>{avgSoh.toFixed(1)}%</div>
          <div style={styles.kpiFooter}>Remaining Useful Life average</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Battery Health Leaderboard */}
      <div className="grid-main-layout">
        
        {/* Interactive Map Visualizer */}
        <div className="glass-panel" style={styles.mapPanel}>
          <div style={styles.mapHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Map size={18} color="var(--accent-blue)" />
              <h3 style={styles.panelTitle}>GPS Fleet Tracking</h3>
            </div>
            
            <div style={styles.filterBtnGroup}>
              <button 
                onClick={() => setSelectedCityFilter('all')}
                style={{ ...styles.filterBtn, ...(selectedCityFilter === 'all' ? styles.filterBtnActive : {}) }}
              >
                All Pilots
              </button>
              <button 
                onClick={() => setSelectedCityFilter('Delhi-NCR')}
                style={{ ...styles.filterBtn, ...(selectedCityFilter === 'Delhi-NCR' ? styles.filterBtnActive : {}) }}
              >
                Delhi-NCR
              </button>
              <button 
                onClick={() => setSelectedCityFilter('Patna, Bihar')}
                style={{ ...styles.filterBtn, ...(selectedCityFilter === 'Patna, Bihar' ? styles.filterBtnActive : {}) }}
              >
                Patna
              </button>
            </div>
          </div>

          {/* SVG Map Simulation */}
          <div style={styles.mapContainer}>
            <svg viewBox="0 0 600 320" style={styles.svgMap}>
              {/* Simulated streets / network nodes background */}
              <path d="M 50,50 L 550,50 M 50,150 L 550,150 M 50,250 L 550,250 M 150,20 L 150,300 M 300,20 L 300,300 M 450,20 L 450,300" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
              <path d="M 50,50 L 550,250 M 50,250 L 550,50" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              
              {/* Simulated Delhi-NCR route path */}
              {selectedCityFilter !== 'Patna, Bihar' && (
                <polyline 
                  points="100,60 150,80 180,120 220,90 200,160 160,200 120,180 100,60" 
                  fill="none" 
                  stroke="rgba(59, 130, 246, 0.25)" 
                  strokeWidth="2" 
                  strokeDasharray="4"
                />
              )}

              {/* Simulated Bihar route path */}
              {selectedCityFilter !== 'Delhi-NCR' && (
                <polyline 
                  points="350,220 400,210 440,240 460,180 410,160 380,190 350,220" 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.2)" 
                  strokeWidth="2" 
                  strokeDasharray="4"
                />
              )}

              {/* Vehicle markers */}
              {filteredVehicles.map((vehicle, idx) => {
                // Map latitude/longitude to SVG coordinate space
                // NCR: lat 28.6, lng 77.2
                // Bihar: lat 25.6, lng 85.1
                const isNcr = vehicle.location.city.includes('NCR') || vehicle.location.city.includes('Delhi');
                
                let cx = isNcr ? 150 : 410;
                let cy = isNcr ? 110 : 190;

                // Add slight offsets depending on mock index/route movement
                const routeIndex = vehicle.location.currentRouteIndex || 0;
                cx += Math.sin(routeIndex + idx) * 35;
                cy += Math.cos(routeIndex + idx) * 25;

                const isSelected = selectedMapVehicle === vehicle.id;
                const statusColor = vehicle.status === 'fault' ? 'var(--accent-red)' : vehicle.status === 'warning' ? 'var(--accent-orange)' : 'var(--accent-green)';

                return (
                  <g 
                    key={vehicle.id} 
                    cursor="pointer" 
                    onClick={() => setSelectedMapVehicle(isSelected ? null : vehicle.id)}
                  >
                    {/* Ring highlight */}
                    {isSelected && (
                      <circle cx={cx} cy={cy} r="18" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeDasharray="3" className="animate-spin-slow" />
                    )}
                    {/* Pulsing indicator */}
                    <circle cx={cx} cy={cy} r="10" fill="rgba(6,9,19,0.9)" stroke={statusColor} strokeWidth="2.5" />
                    <circle cx={cx} cy={cy} r="4" fill={statusColor} className={vehicle.status !== 'offline' ? "animate-pulse" : ""} />
                    {/* Label */}
                    <text x={cx} y={cy - 14} fill="var(--text-primary)" fontSize="8" fontWeight="600" textAnchor="middle" style={{ pointerEvents: 'none' }}>
                      {vehicle.name.split(' ').pop()}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover overlay detail card for Map selections */}
            {selectedVehicleData && (
              <div className="glass-panel glow-blue" style={styles.mapInfoCard}>
                <div style={styles.mapInfoCardHeader}>
                  <h4 style={styles.mapInfoTitle}>{selectedVehicleData.name}</h4>
                  <button onClick={() => setSelectedMapVehicle(null)} style={styles.mapInfoClose}>×</button>
                </div>
                <div style={styles.mapInfoGrid}>
                  <div>
                    <span style={styles.mapInfoLabel}>Status</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedVehicleData.status === 'fault' ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                      {selectedVehicleData.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span style={styles.mapInfoLabel}>Driver Rating</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {driverRatings[selectedVehicleData.id]?.score || 'N/A'}/100
                    </span>
                  </div>
                  <div>
                    <span style={styles.mapInfoLabel}>Battery SoC</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                      {selectedVehicleData.telemetry.soc.toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span style={styles.mapInfoLabel}>Operator</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {selectedVehicleData.owner.split(' ')[0]}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onInspectDevice(selectedVehicleData)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.25rem', fontSize: '0.7rem' }}
                >
                  Open BMS Inspector ➔
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Battery Health Leaderboard */}
        <div className="glass-panel" style={styles.rankingPanel}>
          <h3 style={styles.panelTitle}>SOH Health Leaderboard</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Sorts vehicle battery pack SOH to track cell degradation.
          </p>

          <div style={styles.rankList}>
            {bmsDevices
              .sort((a, b) => b.telemetry.soh - a.telemetry.soh)
              .map((vehicle, idx) => {
                const driverData = driverRatings[vehicle.id];
                const soh = vehicle.telemetry.soh;
                const scoreColor = soh > 92 ? 'var(--accent-green)' : soh > 88 ? 'var(--accent-orange)' : 'var(--accent-red)';
                
                return (
                  <div key={vehicle.id} style={styles.rankRow}>
                    <div style={styles.rankLeft}>
                      <span style={{ ...styles.rankNum, color: idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'var(--text-secondary)' }}>
                        #{idx + 1}
                      </span>
                      <div>
                        <span style={styles.rankName}>{vehicle.name}</span>
                        <span style={styles.rankDriver}>Driver: {driverData?.driver || 'Unknown'}</span>
                      </div>
                    </div>

                    <div style={styles.rankRight}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ ...styles.rankSohVal, color: scoreColor }}>{soh}% SOH</span>
                        <span style={styles.rankMileage}>{driverData?.mileage || 0} km today</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Driver Behavior Reports */}
          <div style={styles.driverSection}>
            <h4 style={styles.subHeader}>Critical Driver Safety Alerts</h4>
            <div style={styles.driverCard}>
              <AlertTriangle size={16} color="var(--accent-orange)" />
              <div style={{ fontSize: '0.75rem' }}>
                <b>NCR Express Loader 03:</b> 6 over-speed alerts triggered on NH-24. MOSFET gate cutoff initiated automatically.
              </div>
            </div>
            <div style={styles.driverCard}>
              <Award size={16} color="var(--accent-green)" />
              <div style={{ fontSize: '0.75rem' }}>
                <b>NCR E-Rickshaw 01:</b> Rajesh Kumar achieved 94% safety efficiency score. LFP temperature maintained below 36°C.
              </div>
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
  kpiCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  kpiValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: 'var(--font-title)',
  },
  kpiUnit: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  kpiFooter: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  mapPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  mapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  panelTitle: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
  },
  filterBtnGroup: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    padding: '2px',
    border: '1px solid var(--border-color)',
  },
  filterBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: 'var(--text-primary)',
  },
  mapContainer: {
    backgroundColor: '#05070e',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid var(--border-color)',
  },
  svgMap: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  mapInfoCard: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    width: '220px',
    backgroundColor: 'rgba(9, 14, 27, 0.95)',
    padding: '0.75rem',
    borderRadius: '8px',
  },
  mapInfoCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem',
  },
  mapInfoTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  mapInfoClose: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
  },
  mapInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.4rem',
  },
  mapInfoLabel: {
    display: 'block',
    fontSize: '0.55rem',
    color: 'var(--text-secondary)',
  },
  rankingPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  rankList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  rankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
  },
  rankLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  rankNum: {
    fontFamily: 'var(--font-title)',
    fontSize: '1rem',
    fontWeight: 700,
    width: '20px',
  },
  rankName: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  rankDriver: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
  },
  rankRight: {
    display: 'flex',
    alignItems: 'center',
  },
  rankSohVal: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  rankMileage: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  driverSection: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  subHeader: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    marginBottom: '0.2rem',
    fontWeight: 600,
  },
  driverCard: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
  },
};
