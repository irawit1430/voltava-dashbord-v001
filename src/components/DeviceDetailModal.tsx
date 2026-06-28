import React, { useState } from 'react';
import { 
  X, 
  Battery, 
  Cpu, 
  Activity, 
  Zap, 
  Sun,
  Shield, 
  Thermometer, 
  ZapOff,
  RefreshCw,
  PlayCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { Device, TelemetryHistoryPoint } from '../types';

interface DeviceDetailModalProps {
  device: Device;
  history: TelemetryHistoryPoint[];
  onClose: () => void;
  onTriggerOta: (id: string) => void;
  onToggleMosfet: (id: string) => void;
  onPingGateway?: (gatewayId: string) => Promise<string>;
}

export default function DeviceDetailModal({ 
  device, 
  history, 
  onClose, 
  onTriggerOta, 
  onToggleMosfet,
  onPingGateway
}: DeviceDetailModalProps) {
  const [activeChart, setActiveChart] = useState<'voltage' | 'current' | 'soc' | 'temp'>('soc');
  const [pingLog, setPingLog] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handlePingDeviceGateway = async () => {
    if (!device.gatewayId) {
      setPingLog("Error: This device is not linked to any active telemetry gateway node.");
      return;
    }
    if (!onPingGateway) {
      setPingLog("Error: Ping service is currently unavailable.");
      return;
    }

    setIsPinging(true);
    setPingLog(`Connecting to J1939 CAN network bus via gateway ${device.gatewayId}...\n`);
    
    try {
      const output = await onPingGateway(device.gatewayId);
      setPingLog(output);
    } catch (err: unknown) {
      setPingLog(`Error connecting to gateway: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPinging(false);
    }
  };

  const isBms = device.type === 'bms';
  const isBess = device.type === 'bess';
  
  const getCellColor = (volts: number) => {
    if (volts < 2.95) return '#ef4444'; // critical low (red)
    if (volts < 3.1) return '#f59e0b'; // low (orange)
    if (volts > 3.8) return '#ef4444'; // overcharged (red)
    return '#10b981'; // healthy (green)
  };

  const getCellTempColor = (temp: number) => {
    if (temp > 65) return '#ef4444'; // thermal hazard
    if (temp > 45) return '#f59e0b'; // elevated
    return '#3b82f6'; // normal
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel glow-blue modal-container">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <div style={styles.headerIcon}>
              {device.type === 'bms' && <Battery size={24} color="var(--accent-green)" />}
              {device.type === 'solar' && <Sun size={24} color="var(--accent-blue)" />}
              {device.type === 'bess' && <Zap size={24} color="var(--accent-green)" />}
              {device.type === 'meter' && <Activity size={24} color="var(--accent-cyan)" />}
              {device.type === 'charger' && <Zap size={24} color="var(--accent-orange)" />}
              {device.type === 'telematics' && <Cpu size={24} color="var(--accent-blue)" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={styles.title}>{device.name}</h3>
                <span className={`badge badge-${device.status}`}>{device.status}</span>
              </div>
              <p style={styles.metaSubtitle}>
                ID: <code style={styles.inlineCode}>{device.id}</code> | Model: {device.model} | Firmware: {device.firmware}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close Inspector">
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Content Body */}
        <div style={styles.modalBody}>
          <div className="modal-grid">
            
            {/* Left Panel: Primary telemetry statistics & Charts */}
            <div style={styles.telemetryPanel}>
              <h4 style={styles.sectionHeader}>Live Telemetry Indicators</h4>
              
              {/* Telemetry Grid */}
              <div style={styles.telemStatsGrid}>
                <div style={styles.telemStatBox}>
                  <span style={styles.telemLabel}>Pack Voltage</span>
                  <span style={styles.telemVal}>{device.telemetry.voltage.toFixed(1)} V</span>
                </div>
                <div style={styles.telemStatBox}>
                  <span style={styles.telemLabel}>Pack Current</span>
                  <span style={{ ...styles.telemVal, color: device.telemetry.current < 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                    {device.telemetry.current.toFixed(1)} A
                  </span>
                </div>
                {(isBms || isBess) && (
                  <>
                    <div style={styles.telemStatBox}>
                      <span style={styles.telemLabel}>State of Charge</span>
                      <span style={{ ...styles.telemVal, color: 'var(--accent-green)' }}>
                        {device.telemetry.soc.toFixed(0)}%
                      </span>
                    </div>
                    <div style={styles.telemStatBox}>
                      <span style={styles.telemLabel}>State of Health</span>
                      <span style={{ ...styles.telemVal, color: 'var(--accent-blue)' }}>
                        {device.telemetry.soh.toFixed(0)}%
                      </span>
                    </div>
                  </>
                )}
                <div style={styles.telemStatBox}>
                  <span style={styles.telemLabel}>Temperature</span>
                  <span style={{ ...styles.telemVal, color: device.telemetry.temp > 50 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {device.telemetry.temp.toFixed(1)} °C
                  </span>
                </div>
                {device.telemetry.activePower !== undefined && (
                  <div style={styles.telemStatBox}>
                    <span style={styles.telemLabel}>Active Power</span>
                    <span style={styles.telemVal}>{device.telemetry.activePower.toFixed(1)} kW</span>
                  </div>
                )}
              </div>

              {/* Historical Charting */}
              <div style={styles.chartSection}>
                <div style={styles.chartTabs}>
                  {(['soc', 'voltage', 'current', 'temp'] as const).map((tab) => {
                    if ((tab === 'soc') && !isBms && !isBess) return null;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveChart(tab)}
                        style={{
                          ...styles.chartTabBtn,
                          ...(activeChart === tab ? styles.chartTabBtnActive : {})
                        }}
                      >
                        {tab.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                <div style={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="timestamp" stroke="var(--text-secondary)" fontSize={10} />
                      <YAxis stroke="var(--text-secondary)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-surface-opaque)', 
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey={activeChart} 
                        stroke={activeChart === 'soc' ? 'var(--accent-green)' : activeChart === 'voltage' ? 'var(--accent-blue)' : activeChart === 'temp' ? 'var(--accent-red)' : 'var(--accent-orange)'} 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Panel: BMS Cells Grid OR Custom Telemetry details */}
            <div style={styles.rightPanel}>
              {isBms && device.telemetry.cellVoltages && device.telemetry.cellTemps ? (
                <div>
                  <div style={styles.flexBetween}>
                    <h4 style={styles.sectionHeader}>BMS Cell Matrix (16S)</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      MOSFET Switch: 
                      <b style={{ color: device.telemetry.mosfetStatus === 'on' ? 'var(--accent-green)' : 'var(--accent-red)', marginLeft: 4 }}>
                        {device.telemetry.mosfetStatus?.toUpperCase()}
                      </b>
                    </span>
                  </div>

                  {/* 4x4 Grid for 16 Cells */}
                  <div style={styles.cellsGrid}>
                    {device.telemetry.cellVoltages.map((v: number, idx: number) => {
                      const temp = device.telemetry.cellTemps![idx];
                      const voltColor = getCellColor(v);
                      const tempColor = getCellTempColor(temp);
                      return (
                        <div key={idx} className="cell-item" style={{ ...styles.cellBox, borderLeftColor: voltColor }}>
                          <span style={styles.cellIndex}>Cell #{idx + 1}</span>
                          <span style={{ ...styles.cellVoltage, color: voltColor }}>{v.toFixed(2)} V</span>
                          <span style={{ ...styles.cellTemp, color: tempColor }}>
                            <Thermometer size={10} /> {temp}°C
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fault list specific to this device */}
                  {device.telemetry.faults.length > 0 && (
                    <div style={styles.faultsSection}>
                      <h5 style={styles.faultHeader}>Active Fault Flags</h5>
                      <ul style={styles.faultList}>
                        {device.telemetry.faults.map((f: string, i: number) => (
                          <li key={i} style={styles.faultItem}>
                            <ZapOff size={12} color="var(--accent-red)" style={{ marginRight: 6 }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.nonBmsDetails}>
                  <h4 style={styles.sectionHeader}>Asset Details</h4>
                  
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Asset Owner</span>
                    <span style={styles.detailVal}>{device.owner}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Location City</span>
                    <span style={styles.detailVal}>{device.location.city}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Coordinates</span>
                    <span style={{ ...styles.detailVal, fontFamily: 'monospace' }}>
                      {device.location.lat.toFixed(4)}°N, {device.location.lng.toFixed(4)}°E
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Telemetry Engine</span>
                    <span style={styles.detailVal}>MQTT Gateway client</span>
                  </div>

                  <div style={{ ...styles.glowBox, marginTop: '2rem' }}>
                    <Shield size={16} color="var(--accent-blue)" style={{ marginRight: 8 }} />
                    <div>
                      <h5 style={{ fontSize: '0.8rem', fontWeight: 600 }}>Modbus/OCPP Connection Secure</h5>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        SSL encrypted telemetry channel authenticated via X.509 device certificates.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Remote Control Actions */}
              <div style={styles.controlSection}>
                <h4 style={styles.sectionHeader}>Remote IoT Control Gateway</h4>
                <div style={styles.controlButtonGrid}>
                  <button 
                    onClick={() => onTriggerOta(device.id)}
                    className="btn btn-outline"
                    style={styles.controlBtn}
                  >
                    <RefreshCw size={14} /> Trigger OTA Update
                  </button>

                  {isBms && (
                    <button 
                      onClick={() => onToggleMosfet(device.id)}
                      className="btn"
                      style={{
                        ...styles.controlBtn,
                        backgroundColor: device.telemetry.mosfetStatus === 'on' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: device.telemetry.mosfetStatus === 'on' ? 'var(--accent-red)' : 'var(--accent-green)',
                        borderColor: device.telemetry.mosfetStatus === 'on' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <ZapOff size={14} /> 
                      {device.telemetry.mosfetStatus === 'on' ? 'Forced MOSFET Cutoff' : 'Re-enable MOSFET'}
                    </button>
                  )}

                  <button 
                    onClick={handlePingDeviceGateway}
                    disabled={isPinging}
                    className="btn btn-outline"
                    style={styles.controlBtn}
                  >
                    <PlayCircle size={14} /> {isPinging ? 'Pinging CAN...' : 'Ping Telematics CAN'}
                  </button>

                  {pingLog !== null && (
                    <div style={styles.inlineTerminal}>
                      <div style={styles.inlineTerminalHeader}>
                        <span>Diagnostics: CAN Ping Terminal</span>
                        <button 
                          onClick={() => setPingLog(null)} 
                          style={styles.inlineTerminalClose}
                          title="Clear Output"
                          aria-label="Clear terminal output"
                        >
                          ×
                        </button>
                      </div>
                      <pre style={styles.inlineTerminalPre}>{pingLog}</pre>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // overlay and modal classes moved to index.css
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 700,
  },
  metaSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.1rem',
  },
  inlineCode: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '0.1rem 0.3rem',
    borderRadius: '4px',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  modalBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
  },
  // mainGrid class moved to index.css
  telemetryPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  sectionHeader: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.35rem',
    fontWeight: 600,
  },
  telemStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  telemStatBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
  },
  telemLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },
  telemVal: {
    fontSize: '1.25rem',
    fontWeight: 700,
    fontFamily: 'var(--font-title)',
    marginTop: '0.15rem',
  },
  chartSection: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  chartTabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  chartTabBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.35rem 0.5rem',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  chartTabBtnActive: {
    color: 'var(--accent-blue)',
    borderBottomColor: 'var(--accent-blue)',
  },
  chartWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '8px',
    padding: '0.5rem',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  cellsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
  },
  cellBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderLeftWidth: '3px',
    borderRadius: '6px',
    padding: '0.4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cellIndex: {
    fontSize: '0.55rem',
    color: 'var(--text-secondary)',
  },
  cellVoltage: {
    fontSize: '0.85rem',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  cellTemp: {
    fontSize: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.1rem',
  },
  faultsSection: {
    marginTop: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    padding: '0.75rem',
  },
  faultHeader: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--accent-red)',
    marginBottom: '0.4rem',
  },
  faultList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  faultItem: {
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-primary)',
  },
  nonBmsDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '0.8rem',
  },
  detailLabel: {
    color: 'var(--text-secondary)',
  },
  detailVal: {
    fontWeight: 500,
  },
  glowBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    padding: '0.75rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
  },
  controlSection: {
    marginTop: '1.25rem',
  },
  controlButtonGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  controlBtn: {
    width: '100%',
    justifyContent: 'flex-start',
    fontSize: '0.75rem',
  },
  inlineTerminal: {
    marginTop: '0.75rem',
    backgroundColor: '#02040a',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.6rem 0.75rem',
    fontFamily: '"Fira Code", monospace, "Courier New", Courier',
    fontSize: '0.7rem',
    color: '#39ff14', // matrix green
    maxHeight: '150px',
    overflowY: 'auto',
    position: 'relative',
  },
  inlineTerminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid #161b22',
    paddingBottom: '0.25rem',
    marginBottom: '0.4rem',
    fontSize: '0.65rem',
  },
  inlineTerminalClose: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
  },
  inlineTerminalPre: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    textAlign: 'left',
  },
};
