import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Cpu, 
  Battery, 
  Sun, 
  Activity, 
  Zap, 
  RefreshCw,
  Eye
} from 'lucide-react';
import type { Device, DeviceType, DeviceStatus } from '../../types';

interface DeviceListProps {
  devices: Device[];
  onSelectDevice: (device: Device) => void;
}

export default function DeviceList({ devices, onSelectDevice }: DeviceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || device.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'bms': return <Battery size={16} color="var(--accent-green)" />;
      case 'bess': return <Zap size={16} color="var(--accent-green)" />;
      case 'solar': return <Sun size={16} color="var(--accent-blue)" />;
      case 'meter': return <Activity size={16} color="var(--accent-cyan)" />;
      case 'charger': return <Zap size={16} color="var(--accent-orange)" />;
      case 'telematics': return <Cpu size={16} color="var(--accent-blue)" />;
      default: return <Cpu size={16} />;
    }
  };

  const getTypeLabel = (type: DeviceType) => {
    switch (type) {
      case 'bms': return 'Smart BMS';
      case 'bess': return 'Factory BESS';
      case 'solar': return 'Solar Inverter';
      case 'meter': return 'Smart Meter';
      case 'charger': return 'DC Charger';
      case 'telematics': return 'Telematics';
      default: return type;
    }
  };

  const getStatusBadgeClass = (status: DeviceStatus) => {
    switch (status) {
      case 'online': return 'badge-online';
      case 'offline': return 'badge-offline';
      case 'warning': return 'badge-warning';
      case 'fault': return 'badge-fault';
      default: return '';
    }
  };

  return (
    <div style={styles.container}>
      {/* Search and Filters Bar */}
      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="var(--text-secondary)" style={styles.searchIcon} />
          <input
            type="text"
            aria-label="Search devices"
            placeholder="Search by ID, name, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            className="input-control"
          />
        </div>

        <div style={styles.filtersGroup}>
          <div style={styles.filterSelectWrap}>
            <Filter size={14} color="var(--text-secondary)" style={{ marginRight: 6 }} />
            <select
              aria-label="Filter by asset type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={styles.filterSelect}
              className="input-control"
            >
              <option value="all">All Asset Types</option>
              <option value="bms">Smart BMS</option>
              <option value="solar">Solar Inverters</option>
              <option value="bess">BESS Controllers</option>
              <option value="charger">DC Chargers</option>
              <option value="meter">Smart Meters</option>
              <option value="telematics">Telematics Gateways</option>
            </select>
          </div>

          <div style={styles.filterSelectWrap}>
            <select
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={styles.filterSelect}
              className="input-control"
            >
              <option value="all">All States</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
              <option value="fault">Fault</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid count summary */}
      <div style={styles.summaryMeta}>
        <span>Found {filteredDevices.length} matching energy assets</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={12} className="animate-spin-slow" />
          Live updating via telematics gateway
        </span>
      </div>

      {/* Devices Table Panel */}
      <div className="glass-panel" style={{ padding: '0.5rem 1rem 1rem' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Asset Name</th>
                <th>Asset Type</th>
                <th>Status</th>
                <th>Primary Telemetry</th>
                <th>Owner / Operator</th>
                <th>City / Region</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.emptyRow}>
                    No devices match the active search filter options.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  // Select telemetry summaries based on device type
                  let primaryTelem = '';
                  if (device.type === 'bms') {
                    primaryTelem = `SOC: ${device.telemetry.soc}% | ${device.telemetry.temp}°C`;
                  } else if (device.type === 'solar') {
                    primaryTelem = `${device.telemetry.activePower || 0} kW Gen`;
                  } else if (device.type === 'bess') {
                    primaryTelem = `SOC: ${device.telemetry.soc}% | ${Math.abs(device.telemetry.activePower || 0)} kW ${device.telemetry.activePower && device.telemetry.activePower > 0 ? 'Discharging' : 'Charging'}`;
                  } else if (device.type === 'meter') {
                    primaryTelem = `${device.telemetry.activePower || 0} kW Load`;
                  } else if (device.type === 'charger') {
                    primaryTelem = `${device.telemetry.activePower || 0} kW Charging`;
                  } else if (device.type === 'telematics') {
                    primaryTelem = `Batt: ${device.telemetry.voltage} V`;
                  }

                  return (
                    <tr key={device.id}>
                      <td style={styles.idCell}>
                        <code style={styles.codeId}>{device.id}</code>
                      </td>
                      <td style={styles.nameCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {getDeviceIcon(device.type)}
                          <div>
                            <span style={{ fontWeight: 600 }}>{device.name}</span>
                            <span style={styles.modelSub}>{device.model}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={styles.typeText}>{getTypeLabel(device.type)}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(device.status)}`}>
                          <span className={`pulse-dot ${device.status}`} style={{ width: 6, height: 6, marginRight: 4 }} />
                          {device.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {primaryTelem}
                      </td>
                      <td style={styles.ownerText}>{device.owner}</td>
                      <td>
                        <span style={styles.locationCity}>{device.location.city}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onSelectDevice(device)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <Eye size={14} style={{ marginRight: 4 }} /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem',
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '260px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '38px',
  },
  filtersGroup: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  filterSelectWrap: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '150px',
  },
  filterSelect: {
    cursor: 'pointer',
  },
  summaryMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    padding: '0 0.25rem',
  },
  emptyRow: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  idCell: {
    fontFamily: 'monospace',
  },
  codeId: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
  },
  nameCell: {
    whiteSpace: 'nowrap',
  },
  modelSub: {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: 400,
  },
  typeText: {
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  ownerText: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  locationCity: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
  },
};
