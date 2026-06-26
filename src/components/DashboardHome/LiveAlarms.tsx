
import { ShieldAlert, AlertOctagon, AlertTriangle } from 'lucide-react';
import './DashboardHome.css';

interface LiveAlarmsProps {
  activeAlerts: Array<{
    device: string;
    id: string;
    fault: string;
    status: 'online' | 'offline' | 'warning' | 'fault';
  }>;
  onAnalyze: () => void;
}

export default function LiveAlarms({ activeAlerts, onAnalyze }: LiveAlarmsProps) {
  return (
    <div className="glass-panel alarm-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <ShieldAlert size={18} color="var(--accent-red)" />
          <h3 className="panel-title">Live Telemetry Alarms</h3>
        </div>
        <span className="badge-count">{activeAlerts.length} Active</span>
      </div>

      <div className="alarm-list">
        {activeAlerts.length === 0 ? (
          <div className="empty-alarms">
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <p className="empty-text">All connected hardware online and running within safety envelopes.</p>
          </div>
        ) : (
          activeAlerts.map((alert, i) => {
            const isFault = alert.status === 'fault';
            return (
              <div 
                key={i} 
                className={`alarm-item ${isFault ? 'alarm-item-fault' : 'alarm-item-warning'}`}
              >
                <div className="alarm-meta">
                  <span className="alarm-device">{alert.device}</span>
                  <span 
                    className={`badge ${isFault ? 'badge-fault' : 'badge-warning'} alarm-badge`}
                  >
                    {alert.status}
                  </span>
                </div>
                <p className="alarm-msg">
                  {isFault ? <AlertOctagon size={12} className="alarm-msg-icon" /> : <AlertTriangle size={12} className="alarm-msg-icon" />}
                  {alert.fault}
                </p>
                <div className="alarm-actions">
                  <button 
                    onClick={onAnalyze} 
                    className="action-btn"
                    aria-label={`Analyze BMS cells for ${alert.device}`}
                  >
                    Analyze BMS Cells ➔
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
