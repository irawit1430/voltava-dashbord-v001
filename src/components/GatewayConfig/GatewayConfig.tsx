import React, { useState, useEffect, useRef } from 'react';
import './GatewayConfig.css';
import {
  Settings,
  Plus,
  Play,
  Square,
  Terminal,
  Signal,
  X,
  Activity,
  AlertTriangle,
  Edit,
  Search,
} from 'lucide-react';
import type { Gateway, GatewayProtocol, Device } from '../../types';

interface GatewayConfigProps {
  gateways: Gateway[];
  devices: Device[];
  toggleGateway: (id: string) => Promise<any>;
  updateGatewayConfig: (id: string, data: any) => Promise<any>;
  addGateway: (data: any) => Promise<Gateway>;
  pingGateway: (id: string) => Promise<string>;
  scanGatewayBus: (id: string) => Promise<string>;
}

export default function GatewayConfig({
  gateways,
  devices,
  toggleGateway,
  updateGatewayConfig,
  addGateway,
  pingGateway,
  scanGatewayBus,
}: GatewayConfigProps) {
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDiagnosticTab, setActiveDiagnosticTab] = useState<
    'ping' | 'scan' | 'packets'
  >('ping');

  // Terminal logs
  const [pingLog, setPingLog] = useState<string>(
    'Select a gateway and click "Run Ping Test"\n'
  );
  const [scanLog, setScanLog] = useState<string>(
    'Select a gateway and click "Scan Bus"\n'
  );
  const [packetLog, setPacketLog] = useState<string[]>([]);
  const [isPinging, setIsPinging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Forms states
  const [newGw, setNewGw] = useState({
    name: '',
    protocol: 'modbus-tcp' as GatewayProtocol,
    connectionType: 'tcp' as 'tcp' | 'serial',
    ipAddress: '192.168.1.100',
    port: 502,
    serialPort: 'COM1',
    baudRate: 9600,
    pollingInterval: 5,
    connectedDevices: [] as string[],
  });

  const [editGw, setEditGw] = useState({
    name: '',
    protocol: 'modbus-tcp' as GatewayProtocol,
    connectionType: 'tcp' as 'tcp' | 'serial',
    ipAddress: '',
    port: 502,
    serialPort: '',
    baudRate: 9600,
    pollingInterval: 5,
    connectedDevices: [] as string[],
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first gateway if none selected
  useEffect(() => {
    if (gateways.length > 0 && !selectedGatewayId) {
      setSelectedGatewayId(gateways[0].id);
    }
  }, [gateways, selectedGatewayId]);

  const selectedGateway =
    gateways.find((g) => g.id === selectedGatewayId) || null;

  // Initialize edit form when selected gateway changes or editing starts
  useEffect(() => {
    if (selectedGateway) {
      setEditGw({
        name: selectedGateway.name,
        protocol: selectedGateway.protocol,
        connectionType: selectedGateway.connectionType,
        ipAddress: selectedGateway.ipAddress || '',
        port: selectedGateway.port || 502,
        serialPort: selectedGateway.serialPort || '',
        baudRate: selectedGateway.baudRate || 9600,
        pollingInterval: selectedGateway.pollingInterval,
        connectedDevices: selectedGateway.connectedDevices,
      });
    }
  }, [selectedGateway, isEditing]);

  // Simulate hex packets generator
  useEffect(() => {
    if (
      !selectedGateway ||
      selectedGateway.status !== 'online' ||
      activeDiagnosticTab !== 'packets'
    ) {
      setPacketLog([]);
      return;
    }

    setPacketLog([
      `[SYS] Packet Analyzer session started for ${selectedGateway.name} (${selectedGateway.id})`,
    ]);

    const generatePacket = () => {
      const now = new Date().toLocaleTimeString();
      let pkt = '';
      if (
        selectedGateway.protocol === 'modbus-rtu' ||
        selectedGateway.protocol === 'modbus-tcp'
      ) {
        const isTx = Math.random() > 0.5;
        if (isTx) {
          pkt =
            `[${now}] TX -> [Unit ID 01] Read Holding Registers: Start=40001, Count=6\n` +
            `Hex: 01 03 00 00 00 06 C5 C8`;
        } else {
          const v = (48 + Math.random() * 5).toFixed(1);
          const c = (10 + Math.random() * 10).toFixed(1);
          pkt =
            `[${now}] RX <- [Unit ID 01] Response (12 bytes):\n` +
            `Hex: 01 03 0C 01 E0 00 64 00 00 00 00 A4\n` +
            `Parsed: Voltage=${v}V, Current=${c}A`;
        }
      } else if (selectedGateway.protocol === 'dlms') {
        const isTx = Math.random() > 0.5;
        if (isTx) {
          pkt =
            `[${now}] TX -> DLMS GET Request (OBIS: 1.0.32.7.0.255 - Phase 1 Voltage)\n` +
            `Hex: 7E A0 19 03 21 54 12 00 ...`;
        } else {
          const v = (238 + Math.random() * 8).toFixed(1);
          pkt =
            `[${now}] RX <- DLMS GET Response (Phase 1 Voltage):\n` +
            `Hex: 7E A0 25 21 03 98 01 02 04 05 ${Math.floor(
              Math.random() * 256
            )
              .toString(16)
              .toUpperCase()}\n` +
            `Parsed: Value=${v} V`;
        }
      } else if (selectedGateway.protocol === 'ocpp') {
        const isTx = Math.random() > 0.5;
        if (isTx) {
          pkt = `[${now}] TX -> OCPP Call: MeterValuesReq (Connector=1, EnergyActiveImportRegister=${(320 + Math.random() * 10).toFixed(2)} kWh)`;
        } else {
          pkt = `[${now}] RX <- OCPP CallResult: MeterValuesConf()`;
        }
      } else if (selectedGateway.protocol === 'can') {
        const pgn = Math.random() > 0.5 ? 'FEE6' : 'F004';
        const sa = '17';
        pkt =
          `[${now}] CAN Frame: ID 0x18${pgn}${sa} [Prio=6, PGN=${pgn}, Src=${sa}]\n` +
          `Data: ` +
          Array.from({ length: 8 }, () =>
            Math.floor(Math.random() * 256)
              .toString(16)
              .padStart(2, '0')
              .toUpperCase()
          ).join(' ');
      }

      setPacketLog((prev) => [pkt, ...prev].slice(0, 25));
    };

    const interval = setInterval(generatePacket, 2500);
    return () => clearInterval(interval);
  }, [selectedGatewayId, selectedGateway, activeDiagnosticTab]);

  // Scroll to bottom of terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pingLog, scanLog]);

  const handleRunPing = async () => {
    if (!selectedGateway) return;
    setIsPinging(true);
    setPingLog(
      `Voltava Diagnostics: Pinging gateway ${selectedGateway.id}...\n`
    );

    // Simulate terminal delay
    setTimeout(async () => {
      const result = await pingGateway(selectedGateway.id);
      setPingLog(result);
      setIsPinging(false);
    }, 1500);
  };

  const handleRunScan = async () => {
    if (!selectedGateway) return;
    setIsScanning(true);
    setScanLog(
      `Voltava Diagnostics: Initiating bus scan on ${selectedGateway.id}...\n`
    );

    setTimeout(async () => {
      const result = await scanGatewayBus(selectedGateway.id);
      setScanLog(result);
      setIsScanning(false);
    }, 2000);
  };

  const handleAddGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const added = await addGateway(newGw);
      setIsAdding(false);
      setSelectedGatewayId(added.id);
      setNewGw({
        name: '',
        protocol: 'modbus-tcp',
        connectionType: 'tcp',
        ipAddress: '192.168.1.100',
        port: 502,
        serialPort: 'COM1',
        baudRate: 9600,
        pollingInterval: 5,
        connectedDevices: [],
      });
    } catch {
      setError('Failed to add gateway');
    }
  };

  const handleEditGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGatewayId) return;
    try {
      setError(null);
      await updateGatewayConfig(selectedGatewayId, editGw);
      setIsEditing(false);
    } catch {
      setError('Failed to update config');
    }
  };

  // Helper formatting values
  const getProtocolLabel = (proto: GatewayProtocol) => {
    switch (proto) {
      case 'modbus-tcp':
        return 'Modbus TCP';
      case 'modbus-rtu':
        return 'Modbus RTU';
      case 'dlms':
        return 'DLMS/COSEM';
      case 'ocpp':
        return 'OCPP 1.6J';
      case 'can':
        return 'CAN-Bus (J1939)';
      default:
        return proto;
    }
  };

  // Stats computation
  const totalGateways = gateways.length;
  const onlineGateways = gateways.filter((g) => g.status === 'online').length;
  const packetsSec = gateways
    .reduce(
      (acc, curr) =>
        acc +
        (curr.status === 'online'
          ? Math.floor((1 / curr.pollingInterval) * 10) / 10
          : 0),
      0
    )
    .toFixed(1);
  const successRate =
    totalGateways > 0
      ? Math.round(
          (gateways.reduce((acc, curr) => acc + curr.packetsTransmitted, 0) /
            Math.max(
              1,
              gateways.reduce(
                (acc, curr) =>
                  acc + curr.packetsTransmitted + curr.packetsFailed,
                0
              )
            )) *
            100
        )
      : 100;

  return (
    <div className="gw-container">
      {/* Overview stats cards */}
      <div className="gw-stats-grid">
        <div className="glass-panel gw-stat-card">
          <div className="gw-stat-header">
            <span className="gw-stat-label">Total Gateways</span>
            <div
              className="gw-icon-wrap"
              style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
            >
              <Settings size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div className="gw-stat-value">{totalGateways}</div>
          <div className="gw-stat-sub-text">
            {onlineGateways} Online actively routing
          </div>
        </div>

        <div className="glass-panel gw-stat-card">
          <div className="gw-stat-header">
            <span className="gw-stat-label">Routing Frequency</span>
            <div
              className="gw-icon-wrap"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <Activity size={18} color="var(--accent-green)" />
            </div>
          </div>
          <div className="gw-stat-value">
            {packetsSec}{' '}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              pkts/s
            </span>
          </div>
          <div className="gw-stat-sub-text">Distributed poll scheduling</div>
        </div>

        <div className="glass-panel gw-stat-card">
          <div className="gw-stat-header">
            <span className="gw-stat-label">Sync Success Rate</span>
            <div
              className="gw-icon-wrap"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <Signal size={18} color="var(--accent-blue)" />
            </div>
          </div>
          <div className="gw-stat-value">{successRate}%</div>
          <div className="gw-stat-sub-text">CRC/checksum parity validated</div>
        </div>
      </div>

      {/* Main Grid: Left is list, Right is detail and diagnostics */}
      <div className="gw-main-grid">
        {/* Left Side: Gateways List */}
        <div className="glass-panel gw-list-section">
          <div className="gw-section-title-bar">
            <h3 className="gw-title">Configured Gateways</h3>
            <button
              onClick={() => setIsAdding(true)}
              className="glow-green gw-add-button"
            >
              <Plus size={14} style={{ marginRight: 4 }} />
              Add Gateway
            </button>
          </div>

          <div className="gw-list-container">
            {gateways.map((g) => {
              const isSelected = g.id === selectedGatewayId;
              const connInfo =
                g.connectionType === 'tcp'
                  ? `${g.ipAddress}:${g.port}`
                  : `${g.serialPort}`;

              return (
                <div
                  key={g.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedGatewayId(g.id);
                      setIsEditing(false);
                    }
                  }}
                  onClick={() => {
                    setSelectedGatewayId(g.id);
                    setIsEditing(false);
                  }}
                  className={`gw-gateway-row ${isSelected ? 'gw-gateway-row-active' : ''}`}
                >
                  <div className="gw-row-main">
                    <div className="gw-row-info">
                      <span className="gw-row-name">{g.name}</span>
                      <span className="gw-row-meta">
                        <span className="gw-row-proto">
                          {getProtocolLabel(g.protocol)}
                        </span>
                        <span className="gw-row-dot">•</span>
                        <span>{connInfo}</span>
                      </span>
                    </div>

                    <div className="gw-row-status">
                      <span
                        className={`badge ${
                          g.status === 'online'
                            ? 'badge-online'
                            : g.status === 'connecting'
                              ? 'badge-warning'
                              : 'badge-fault'
                        }`}
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.45rem',
                        }}
                      >
                        {g.status}
                      </span>
                    </div>
                  </div>

                  <div className="gw-row-footer">
                    <span>
                      Tx: {g.packetsTransmitted} | Err: {g.packetsFailed}
                    </span>
                    {g.signalStrength !== undefined && (
                      <span className="gw-row-signal">
                        <Signal size={10} style={{ marginRight: 2 }} />
                        {g.signalStrength} dBm
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Gateway Details & Diagnostics Console */}
        <div className="gw-detail-section">
          {isAdding ? (
            /* Add Gateway Form */
            <div className="glass-panel gw-form-container">
              <div className="gw-form-header">
                <h3 className="gw-form-title">Add New Gateway Node</h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="gw-close-btn"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddGateway} className="gw-form">
                <div className="gw-form-grid">
                  <div className="gw-form-group">
                    <label className="gw-label">Gateway Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Haryana BESS Modbus RTU"
                      value={newGw.name}
                      onChange={(e) =>
                        setNewGw((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="gw-input"
                    />
                  </div>

                  <div className="gw-form-group">
                    <label className="gw-label">Protocol Type</label>
                    <select
                      value={newGw.protocol}
                      onChange={(e) =>
                        setNewGw((prev) => ({
                          ...prev,
                          protocol: e.target.value as GatewayProtocol,
                        }))
                      }
                      className="gw-select"
                    >
                      <option value="modbus-tcp">Modbus TCP</option>
                      <option value="modbus-rtu">Modbus RTU</option>
                      <option value="dlms">DLMS/COSEM</option>
                      <option value="ocpp">OCPP 1.6J</option>
                      <option value="can">CAN-Bus (J1939)</option>
                    </select>
                  </div>

                  <div className="gw-form-group">
                    <label className="gw-label">Connection Medium</label>
                    <select
                      value={newGw.connectionType}
                      onChange={(e) =>
                        setNewGw((prev) => ({
                          ...prev,
                          connectionType: e.target.value as 'tcp' | 'serial',
                        }))
                      }
                      className="gw-select"
                    >
                      <option value="tcp">TCP/IP Network</option>
                      <option value="serial">
                        Serial Port (RS-485 / RS-232)
                      </option>
                    </select>
                  </div>

                  <div className="gw-form-group">
                    <label className="gw-label">
                      Polling Interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={newGw.pollingInterval}
                      onChange={(e) =>
                        setNewGw((prev) => ({
                          ...prev,
                          pollingInterval: Number(e.target.value),
                        }))
                      }
                      className="gw-input"
                    />
                  </div>

                  {newGw.connectionType === 'tcp' ? (
                    <>
                      <div className="gw-form-group">
                        <label className="gw-label">IP Address</label>
                        <input
                          type="text"
                          placeholder="192.168.1.100"
                          value={newGw.ipAddress}
                          onChange={(e) =>
                            setNewGw((prev) => ({
                              ...prev,
                              ipAddress: e.target.value,
                            }))
                          }
                          className="gw-input"
                        />
                      </div>
                      <div className="gw-form-group">
                        <label className="gw-label">TCP Port</label>
                        <input
                          type="number"
                          placeholder="502"
                          value={newGw.port}
                          onChange={(e) =>
                            setNewGw((prev) => ({
                              ...prev,
                              port: Number(e.target.value),
                            }))
                          }
                          className="gw-input"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="gw-form-group">
                        <label className="gw-label">Serial Port Name</label>
                        <input
                          type="text"
                          placeholder="COM3 or /dev/ttyUSB0"
                          value={newGw.serialPort}
                          onChange={(e) =>
                            setNewGw((prev) => ({
                              ...prev,
                              serialPort: e.target.value,
                            }))
                          }
                          className="gw-input"
                        />
                      </div>
                      <div className="gw-form-group">
                        <label className="gw-label">Baud Rate</label>
                        <select
                          value={newGw.baudRate}
                          onChange={(e) =>
                            setNewGw((prev) => ({
                              ...prev,
                              baudRate: Number(e.target.value),
                            }))
                          }
                          className="gw-select"
                        >
                          <option value="2400">2400 bps</option>
                          <option value="4800">4800 bps</option>
                          <option value="9600">9600 bps</option>
                          <option value="19200">19200 bps</option>
                          <option value="38400">38400 bps</option>
                          <option value="115200">115200 bps</option>
                          <option value="250000">250000 bps (CAN)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label className="gw-label">Link Monitored Assets</label>
                  <div className="gw-assets-checklist">
                    {devices
                      .filter((d) => !d.gatewayId)
                      .map((d) => (
                        <label key={d.id} className="gw-check-label">
                          <input
                            type="checkbox"
                            checked={newGw.connectedDevices.includes(d.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewGw((prev) => ({
                                  ...prev,
                                  connectedDevices: [
                                    ...prev.connectedDevices,
                                    d.id,
                                  ],
                                }));
                              } else {
                                setNewGw((prev) => ({
                                  ...prev,
                                  connectedDevices:
                                    prev.connectedDevices.filter(
                                      (id) => id !== d.id
                                    ),
                                }));
                              }
                            }}
                            style={{ marginRight: 8 }}
                          />
                          <span>
                            {d.name} ({d.id})
                          </span>
                        </label>
                      ))}
                    {devices.filter((d) => !d.gatewayId).length === 0 && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        All available assets are already linked to gateways.
                      </span>
                    )}
                  </div>
                </div>

                <div className="gw-form-actions">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="gw-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="gw-submit-btn">
                    Create Node
                  </button>
                </div>
                {error && (
                  <div
                    style={{
                      color: 'var(--accent-red)',
                      fontSize: '0.8rem',
                      marginTop: '0.5rem',
                      textAlign: 'right',
                    }}
                  >
                    {error}
                  </div>
                )}
              </form>
            </div>
          ) : selectedGateway ? (
            /* Gateway Detail & Diagnostics view */
            <div className="gw-detail-wrapper">
              {/* Detail Stats panel */}
              <div className="glass-panel gw-detail-card">
                <div className="gw-detail-card-header">
                  <div>
                    <h3 className="gw-detail-name">{selectedGateway.name}</h3>
                    <span className="gw-detail-id">{selectedGateway.id}</span>
                  </div>

                  <div className="gw-detail-actions">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="gw-edit-btn"
                    >
                      <Edit size={14} style={{ marginRight: 4 }} />
                      Edit Settings
                    </button>

                    <button
                      onClick={() => toggleGateway(selectedGateway.id)}
                      className={`gw-toggle-btn ${selectedGateway.status === 'online' ? 'glow-green' : ''}`}
                      style={{
                        borderColor:
                          selectedGateway.status === 'online'
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(239, 68, 68, 0.4)',
                        backgroundColor:
                          selectedGateway.status === 'online'
                            ? 'rgba(16, 185, 129, 0.08)'
                            : 'rgba(239, 68, 68, 0.08)',
                        color:
                          selectedGateway.status === 'online'
                            ? 'var(--accent-green)'
                            : 'var(--accent-red)',
                      }}
                    >
                      {selectedGateway.status === 'online' ? (
                        <>
                          <Square size={12} style={{ marginRight: 4 }} />
                          Disconnect Bus
                        </>
                      ) : (
                        <>
                          <Play size={12} style={{ marginRight: 4 }} />
                          Connect Bus
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  /* Edit Settings Inline form */
                  <form
                    onSubmit={handleEditGateway}
                    className="gw-form"
                    style={{ padding: '1rem 0 0 0' }}
                  >
                    <div className="gw-form-grid">
                      <div className="gw-form-group">
                        <label className="gw-label">Gateway Name</label>
                        <input
                          type="text"
                          required
                          value={editGw.name}
                          onChange={(e) =>
                            setEditGw((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="gw-input"
                        />
                      </div>

                      <div className="gw-form-group">
                        <label className="gw-label">
                          Polling Interval (seconds)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={editGw.pollingInterval}
                          onChange={(e) =>
                            setEditGw((prev) => ({
                              ...prev,
                              pollingInterval: Number(e.target.value),
                            }))
                          }
                          className="gw-input"
                        />
                      </div>

                      {selectedGateway.connectionType === 'tcp' ? (
                        <>
                          <div className="gw-form-group">
                            <label className="gw-label">IP Address</label>
                            <input
                              type="text"
                              value={editGw.ipAddress}
                              onChange={(e) =>
                                setEditGw((prev) => ({
                                  ...prev,
                                  ipAddress: e.target.value,
                                }))
                              }
                              className="gw-input"
                            />
                          </div>
                          <div className="gw-form-group">
                            <label className="gw-label">TCP Port</label>
                            <input
                              type="number"
                              value={editGw.port}
                              onChange={(e) =>
                                setEditGw((prev) => ({
                                  ...prev,
                                  port: Number(e.target.value),
                                }))
                              }
                              className="gw-input"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="gw-form-group">
                            <label className="gw-label">Serial Port Name</label>
                            <input
                              type="text"
                              value={editGw.serialPort}
                              onChange={(e) =>
                                setEditGw((prev) => ({
                                  ...prev,
                                  serialPort: e.target.value,
                                }))
                              }
                              className="gw-input"
                            />
                          </div>
                          <div className="gw-form-group">
                            <label className="gw-label">Baud Rate</label>
                            <select
                              value={editGw.baudRate}
                              onChange={(e) =>
                                setEditGw((prev) => ({
                                  ...prev,
                                  baudRate: Number(e.target.value),
                                }))
                              }
                              className="gw-select"
                            >
                              <option value="2400">2400 bps</option>
                              <option value="4800">4800 bps</option>
                              <option value="9600">9600 bps</option>
                              <option value="19200">19200 bps</option>
                              <option value="38400">38400 bps</option>
                              <option value="115200">115200 bps</option>
                              <option value="250000">250000 bps (CAN)</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <label className="gw-label">
                        Linked Monitored Assets
                      </label>
                      <div className="gw-assets-checklist">
                        {devices.map((d) => {
                          const isCurrentlySelected =
                            editGw.connectedDevices.includes(d.id);
                          const isLinkedElsewhere =
                            d.gatewayId && d.gatewayId !== selectedGateway.id;

                          if (isLinkedElsewhere) return null; // hide devices already bound to other gateways

                          return (
                            <label key={d.id} className="gw-check-label">
                              <input
                                type="checkbox"
                                checked={isCurrentlySelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditGw((prev) => ({
                                      ...prev,
                                      connectedDevices: [
                                        ...prev.connectedDevices,
                                        d.id,
                                      ],
                                    }));
                                  } else {
                                    setEditGw((prev) => ({
                                      ...prev,
                                      connectedDevices:
                                        prev.connectedDevices.filter(
                                          (id) => id !== d.id
                                        ),
                                    }));
                                  }
                                }}
                                style={{ marginRight: 8 }}
                              />
                              <span>
                                {d.name} ({d.id})
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="gw-form-actions">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="gw-cancel-btn"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="gw-submit-btn">
                        Save Configuration
                      </button>
                    </div>
                    {error && (
                      <div
                        style={{
                          color: 'var(--accent-red)',
                          fontSize: '0.8rem',
                          marginTop: '0.5rem',
                          textAlign: 'right',
                        }}
                      >
                        {error}
                      </div>
                    )}
                  </form>
                ) : (
                  /* Read only settings display */
                  <div className="gw-meta-row-grid">
                    <div className="gw-meta-col">
                      <span className="gw-meta-label">Protocol</span>
                      <span className="gw-meta-val">
                        {getProtocolLabel(selectedGateway.protocol)}
                      </span>
                    </div>

                    <div className="gw-meta-col">
                      <span className="gw-meta-label">Medium</span>
                      <span className="gw-meta-val">
                        {selectedGateway.connectionType.toUpperCase()}
                      </span>
                    </div>

                    {selectedGateway.connectionType === 'tcp' ? (
                      <>
                        <div className="gw-meta-col">
                          <span className="gw-meta-label">IP Address</span>
                          <span className="gw-meta-val">
                            {selectedGateway.ipAddress}
                          </span>
                        </div>
                        <div className="gw-meta-col">
                          <span className="gw-meta-label">TCP Port</span>
                          <span className="gw-meta-val">
                            {selectedGateway.port}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="gw-meta-col">
                          <span className="gw-meta-label">Serial Port</span>
                          <span className="gw-meta-val">
                            {selectedGateway.serialPort}
                          </span>
                        </div>
                        <div className="gw-meta-col">
                          <span className="gw-meta-label">Baud Rate</span>
                          <span className="gw-meta-val">
                            {selectedGateway.baudRate} bps
                          </span>
                        </div>
                      </>
                    )}

                    <div className="gw-meta-col">
                      <span className="gw-meta-label">Poll Interval</span>
                      <span className="gw-meta-val">
                        {selectedGateway.pollingInterval}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Connected Devices List */}
                <div className="gw-linked-section">
                  <h4 className="gw-sub-header">
                    Monitored Assets Connected via Gateway
                  </h4>
                  <div className="gw-linked-grid">
                    {selectedGateway.connectedDevices.map((dId) => {
                      const dev = devices.find((d) => d.id === dId);
                      if (!dev) return null;
                      return (
                        <div key={dev.id} className="gw-linked-device-card">
                          <div className="gw-dev-card-top">
                            <span className="gw-dev-card-name">{dev.name}</span>
                            <span className="gw-dev-card-id">{dev.id}</span>
                          </div>
                          <div className="gw-dev-card-footer">
                            <span className="gw-dev-card-model">
                              {dev.model}
                            </span>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor:
                                    dev.status === 'online'
                                      ? 'var(--accent-green)'
                                      : dev.status === 'warning'
                                        ? 'var(--accent-orange)'
                                        : 'var(--accent-red)',
                                }}
                              />
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  textTransform: 'uppercase',
                                  fontWeight: 600,
                                }}
                              >
                                {dev.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {selectedGateway.connectedDevices.length === 0 && (
                      <div className="gw-empty-linked">
                        <AlertTriangle
                          size={14}
                          color="var(--accent-orange)"
                          style={{ marginRight: 6 }}
                        />
                        <span>
                          No assets linked to this gateway node. Edit settings
                          to link devices.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Diagnostics Console */}
              <div className="glass-panel gw-terminal-panel">
                {/* Terminal Tabs */}
                <div className="gw-terminal-tabs">
                  <button
                    onClick={() => setActiveDiagnosticTab('ping')}
                    className={`gw-terminal-tab-btn ${activeDiagnosticTab === 'ping' ? 'gw-terminal-tab-btn-active' : ''}`}
                  >
                    <Terminal size={14} style={{ marginRight: 4 }} />
                    Ping Test
                  </button>

                  <button
                    onClick={() => setActiveDiagnosticTab('scan')}
                    className={`gw-terminal-tab-btn ${activeDiagnosticTab === 'scan' ? 'gw-terminal-tab-btn-active' : ''}`}
                  >
                    <Search size={14} style={{ marginRight: 4 }} />
                    Bus Scanner
                  </button>

                  <button
                    onClick={() => setActiveDiagnosticTab('packets')}
                    className={`gw-terminal-tab-btn ${activeDiagnosticTab === 'packets' ? 'gw-terminal-tab-btn-active' : ''}`}
                  >
                    <Activity size={14} style={{ marginRight: 4 }} />
                    Packet Analyzer
                  </button>
                </div>

                {/* Terminal Actions Bar */}
                <div className="gw-terminal-action-bar">
                  <span className="gw-terminal-title">
                    {activeDiagnosticTab === 'ping' && 'Gateway Ping Utility'}
                    {activeDiagnosticTab === 'scan' &&
                      'Industrial Bus Address Scan'}
                    {activeDiagnosticTab === 'packets' &&
                      'Live RTU/TCP Packet Sniffer'}
                  </span>

                  {activeDiagnosticTab === 'ping' && (
                    <button
                      onClick={handleRunPing}
                      disabled={isPinging}
                      className="gw-run-btn"
                    >
                      <Play size={12} style={{ marginRight: 4 }} />
                      {isPinging ? 'Pinging...' : 'Run Ping Test'}
                    </button>
                  )}

                  {activeDiagnosticTab === 'scan' && (
                    <button
                      onClick={handleRunScan}
                      disabled={isScanning}
                      className="gw-run-btn"
                    >
                      <Search size={12} style={{ marginRight: 4 }} />
                      {isScanning ? 'Scanning...' : 'Scan Bus'}
                    </button>
                  )}

                  {activeDiagnosticTab === 'packets' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            selectedGateway.status === 'online'
                              ? 'var(--accent-green)'
                              : 'var(--accent-red)',
                        }}
                      />
                      {selectedGateway.status === 'online'
                        ? 'Sniffing active...'
                        : 'Sniffer inactive. Gateway is offline.'}
                    </div>
                  )}
                </div>

                {/* Terminal Display Screen */}
                <div className="gw-terminal-screen">
                  <div className="gw-terminal-content">
                    {activeDiagnosticTab === 'ping' && (
                      <pre className="gw-pre">{pingLog}</pre>
                    )}

                    {activeDiagnosticTab === 'scan' && (
                      <pre className="gw-pre">{scanLog}</pre>
                    )}

                    {activeDiagnosticTab === 'packets' && (
                      <div className="gw-packets-wrapper">
                        {packetLog.map((pkt, i) => (
                          <div key={i} className="gw-packet-row">
                            {pkt}
                          </div>
                        ))}
                        {packetLog.length === 0 && (
                          <div
                            style={{
                              color: 'var(--text-muted)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {selectedGateway.status === 'online'
                              ? 'Waiting for polling frame event...'
                              : 'Connect gateway to capture packets.'}
                          </div>
                        )}
                      </div>
                    )}
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="gw-empty-detail">
              <span>
                Select a gateway from the list to view configuration and
                diagnostics.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
