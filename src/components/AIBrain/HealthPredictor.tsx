import React from 'react';
import { Brain } from 'lucide-react';
import type { Device } from '../../types';

interface HealthPredictorProps {
  devices: Device[];
  onInspectDevice: (device: Device) => void;
}

export default function HealthPredictor({
  devices,
  onInspectDevice,
}: HealthPredictorProps) {
  // Extract devices with AI predictions
  const aiDevices = devices.filter((d) => d.aiPredictions);

  const getRiskColor = (prob: number) => {
    if (prob > 60) return 'var(--accent-red)';
    if (prob > 15) return 'var(--accent-orange)';
    return 'var(--accent-green)';
  };

  // Mock timeline of recent anomalies detected by AI models
  const anomaliesTimeline = [
    {
      time: '10 mins ago',
      device: 'NCR Express Loader 03',
      type: 'Thermal Anomaly',
      desc: 'BMS Cell #7 temperature rose to 71°C while ambient was 38°C. Delta exceeds 3-sigma thresholds. MOSFET automatically tripped.',
      severity: 'high',
    },
    {
      time: '1 hour ago',
      device: 'Bihar Fleet Rickshaw 02',
      type: 'Impedance Shift',
      desc: 'Cell #4 internal resistance increased by 8.4% compared to pack baseline. Expected capacity imbalance within 12 charge cycles.',
      severity: 'medium',
    },
    {
      time: '3 hours ago',
      device: 'DC Charger Noida Hub',
      type: 'Connector Wear',
      desc: 'Connector thermal sensor shows rapid rise delta during charging session (+4.8°C/min). Recommended inspection for pin degradation.',
      severity: 'medium',
    },
    {
      time: '12 hours ago',
      device: 'Factory BESS Control 01',
      type: 'Aging Projection',
      desc: 'Completed 1200 cycles. Capacity fade model projects RUL of 4,100 cycles before reaching 80% SOH. Balance charging suggested.',
      severity: 'low',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Top Welcome Banner */}
      <div className="glass-panel" style={styles.banner}>
        <div style={styles.bannerIconBox}>
          <Brain
            size={24}
            color="var(--accent-green)"
            className="animate-pulse"
          />
        </div>
        <div>
          <h3 style={styles.bannerTitle}>Voltava AI Energy Brain Dashboard</h3>
          <p style={styles.bannerDesc}>
            Runs continuous neural network inference on raw IoT telemetry
            packets. Predicts battery cell degradation, MOSFET thermal collapse,
            and grid outages before physical failures occur.
          </p>
        </div>
      </div>

      <div className="grid-main-layout">
        {/* Left Side: Asset Diagnostics & Health Percentiles */}
        <div className="glass-panel" style={styles.mainDiagnostics}>
          <h4 style={styles.sectionHeader}>Hardware Health Diagnostics</h4>

          <div style={styles.listContainer}>
            {aiDevices.map((d) => {
              const ai = d.aiPredictions!;
              const riskColor = getRiskColor(ai.failureProbability);

              return (
                <div key={d.id} style={styles.diagnosticRow}>
                  {/* Basic info */}
                  <div style={styles.diagLeft}>
                    <div>
                      <span style={styles.diagName}>{d.name}</span>
                      <span style={styles.diagId}>
                        ID: <code>{d.id}</code>
                      </span>
                    </div>
                  </div>

                  {/* Health ring mockup & SOH */}
                  <div style={styles.diagMiddle}>
                    <div style={styles.statMetric}>
                      <span style={styles.statLabel}>AI Health Score</span>
                      <span
                        style={{
                          ...styles.statVal,
                          color:
                            ai.healthRank > 80
                              ? 'var(--accent-green)'
                              : ai.healthRank > 50
                                ? 'var(--accent-orange)'
                                : 'var(--accent-red)',
                        }}
                      >
                        {ai.healthRank} / 100
                      </span>
                    </div>

                    <div style={styles.statMetric}>
                      <span style={styles.statLabel}>Remaining RUL</span>
                      <span style={styles.statVal}>{ai.rul} Cycles</span>
                    </div>

                    <div style={styles.statMetric}>
                      <span style={styles.statLabel}>Failure Risk</span>
                      <span style={{ ...styles.statVal, color: riskColor }}>
                        {ai.failureProbability.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Warning tags */}
                  <div style={styles.diagRight}>
                    <div style={styles.riskFlags}>
                      {ai.cellRunawayRisk && (
                        <span style={styles.flagRed}>🔥 Cell Runaway</span>
                      )}
                      {ai.mosfetRisk && (
                        <span style={styles.flagOrange}>⚡ MOSFET Warning</span>
                      )}
                      {!ai.cellRunawayRisk && !ai.mosfetRisk && (
                        <span style={styles.flagGreen}>✓ Healthy</span>
                      )}
                    </div>

                    <button
                      onClick={() => onInspectDevice(d)}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      Inspect ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: AI Models Log Timeline */}
        <div className="glass-panel" style={styles.timelinePanel}>
          <h3 style={styles.panelTitle}>AI Inference Logs</h3>
          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
            }}
          >
            Chronological log of anomaly flags raised by edge-gateways & cloud
            models.
          </p>

          <div style={styles.timeline}>
            {anomaliesTimeline.map((log, i) => {
              const borderCol =
                log.severity === 'high'
                  ? 'var(--accent-red)'
                  : log.severity === 'medium'
                    ? 'var(--accent-orange)'
                    : 'var(--accent-blue)';
              const bgCol =
                log.severity === 'high'
                  ? 'rgba(239, 68, 68, 0.05)'
                  : log.severity === 'medium'
                    ? 'rgba(245, 158, 11, 0.05)'
                    : 'rgba(59, 130, 246, 0.05)';

              return (
                <div
                  key={i}
                  style={{
                    ...styles.timelineItem,
                    borderLeftColor: borderCol,
                    backgroundColor: bgCol,
                  }}
                >
                  <div style={styles.timelineHeader}>
                    <span style={styles.timelineTime}>{log.time}</span>
                    <span style={{ ...styles.timelineType, color: borderCol }}>
                      {log.type}
                    </span>
                  </div>
                  <h4 style={styles.timelineDevice}>{log.device}</h4>
                  <p style={styles.timelineDesc}>{log.desc}</p>
                </div>
              );
            })}
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
  banner: {
    padding: '1.25rem 1.5rem',
    background:
      'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(6, 182, 212, 0.04) 100%)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  bannerIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  bannerTitle: {
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
  },
  bannerDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    marginTop: '0.15rem',
  },
  mainDiagnostics: {
    padding: '1.5rem',
  },
  sectionHeader: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.35rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  diagnosticRow: {
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  diagLeft: {
    minWidth: '180px',
  },
  diagName: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  diagId: {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    marginTop: '0.1rem',
  },
  diagMiddle: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  statMetric: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
  },
  statVal: {
    fontSize: '0.85rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    marginTop: '0.15rem',
  },
  diagRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  riskFlags: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  flagRed: {
    fontSize: '0.65rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '4px',
    padding: '0.1rem 0.4rem',
    fontWeight: 600,
  },
  flagOrange: {
    fontSize: '0.65rem',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: 'var(--accent-orange)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '4px',
    padding: '0.1rem 0.4rem',
    fontWeight: 600,
  },
  flagGreen: {
    fontSize: '0.65rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--accent-green)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '4px',
    padding: '0.1rem 0.4rem',
    fontWeight: 600,
  },
  timelinePanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  panelTitle: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    overflowY: 'auto',
    maxHeight: '380px',
  },
  timelineItem: {
    padding: '0.75rem',
    borderRadius: '8px',
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
  },
  timelineTime: {
    color: 'var(--text-secondary)',
  },
  timelineType: {
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  timelineDevice: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  timelineDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.3,
  },
};
