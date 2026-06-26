export type DeviceType =
  | 'bms'
  | 'solar'
  | 'bess'
  | 'charger'
  | 'meter'
  | 'telematics';

export type DeviceStatus = 'online' | 'offline' | 'warning' | 'fault';

export interface TelemetryData {
  voltage: number; // V
  current: number; // A
  soc: number; // State of Charge %
  soh: number; // State of Health %
  temp: number; // °C
  activePower?: number; // kW
  reactivePower?: number; // kVAR
  energyGenerated?: number; // kWh (for Solar)
  energyConsumed?: number; // kWh (for Charger/BESS)
  powerFactor?: number; // For Smart Meter
  frequency?: number; // Hz (For Smart Meter/Grid)
  faults: string[];
  cellVoltages?: number[]; // BMS (16 cells in V, e.g., 3.2V - 3.4V)
  cellTemps?: number[]; // BMS cell temperatures
  mosfetStatus?: 'on' | 'off';
  lastUpdated: string;
}

export interface AIPredictions {
  rul: number; // Remaining Useful Life in cycles (or days)
  failureProbability: number; // percentage (0-100)
  predictedFaultType?: string; // cell degradation, MOSFET short, thermal runaway, connection failure
  healthRank: number; // percentile score (1-100)
  cellRunawayRisk: boolean; // warning flag
  mosfetRisk: boolean; // warning flag
  chargerOverheatingRisk: boolean; // warning flag
  anomaliesDetected: string[];
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  model: string;
  firmware: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    route?: [number, number][]; // route points for fleets
    currentRouteIndex?: number;
  };
  owner: string;
  telemetry: TelemetryData;
  aiPredictions?: AIPredictions;
  gatewayId?: string;
}

export type GatewayProtocol =
  | 'modbus-tcp'
  | 'modbus-rtu'
  | 'dlms'
  | 'ocpp'
  | 'can';

export type GatewayStatus = 'online' | 'offline' | 'connecting' | 'error';

export interface Gateway {
  id: string;
  name: string;
  protocol: GatewayProtocol;
  status: GatewayStatus;
  connectionType: 'tcp' | 'serial';
  ipAddress?: string;
  port?: number;
  serialPort?: string;
  baudRate?: number;
  pollingInterval: number; // in seconds
  signalStrength?: number; // dBm
  connectedDevices: string[]; // device IDs
  lastSync: string;
  packetsTransmitted: number;
  packetsFailed: number;
}

export interface GridMetrics {
  solarPower: number; // kW
  bessPower: number; // kW (positive = discharging, negative = charging)
  gridImport: number; // kW
  industrialLoad: number; // kW
  gridVoltage: number; // V
  gridFrequency: number; // Hz
  powerFactor: number;
  peakLimit: number; // kW (Peak Shaving limit)
  savingsINR: number; // Cumulative savings in ₹
  carbonOffset: number; // Cumulative CO2 saved in kg
  outageBackupPredict: number; // minutes of backup remaining
  isGridDown: boolean;
}

export interface TelemetryHistoryPoint {
  timestamp: string;
  voltage: number;
  current: number;
  soc: number;
  temp: number;
  power?: number;
}
