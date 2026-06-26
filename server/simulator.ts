import { Device, GridMetrics, TelemetryHistoryPoint, Gateway } from './types';

// Coordinates for Delhi-NCR e-rickshaw route simulation
const NCR_ROUTE: [number, number][] = [
  [28.6139, 77.2090], // Connaught Place
  [28.6250, 77.2150],
  [28.6300, 77.2300], // ITO
  [28.6200, 77.2400],
  [28.6100, 77.2500], // Pragati Maidan
  [28.5950, 77.2300], // Lodhi Garden
  [28.5800, 77.2100], // AIIMS
  [28.5700, 77.1950],
  [28.5900, 77.1800], // Chanakyapuri
  [28.6139, 77.2090], // Loop back
];

// Coordinates for Patna, Bihar route simulation
const BIHAR_ROUTE: [number, number][] = [
  [25.6110, 85.1440], // Patna Junction
  [25.6170, 85.1600], // Gandhi Maidan
  [25.6200, 85.1800],
  [25.6150, 85.2000], // Gulzarbagh
  [25.6100, 85.1800],
  [25.5980, 85.1500],
  [25.6110, 85.1440], // Loop back
];

export let devices: Device[] = [
  {
    id: 'BMS-ER-NCR-01',
    name: 'NCR E-Rickshaw 01',
    type: 'bms',
    status: 'online',
    model: 'VoltBMS-LFP-48V',
    firmware: 'v2.1.4',
    location: { lat: 28.6139, lng: 77.2090, city: 'Delhi-NCR', route: NCR_ROUTE, currentRouteIndex: 0 },
    owner: 'Shera E-Mobility Fleet',
    gatewayId: 'GW-DEL-TLM-01',
    telemetry: {
      voltage: 51.2,
      current: -15.4,
      soc: 74,
      soh: 96,
      temp: 34.5,
      faults: [],
      cellVoltages: [3.21, 3.22, 3.20, 3.21, 3.22, 3.21, 3.20, 3.19, 3.21, 3.22, 3.22, 3.20, 3.21, 3.21, 3.22, 3.21],
      cellTemps: [33, 34, 34, 33, 35, 34, 33, 33, 34, 34, 35, 34, 33, 34, 33, 34],
      mosfetStatus: 'on',
      lastUpdated: new Date().toISOString()
    },
    aiPredictions: {
      rul: 1850,
      failureProbability: 1.2,
      healthRank: 94,
      cellRunawayRisk: false,
      mosfetRisk: false,
      chargerOverheatingRisk: false,
      anomaliesDetected: []
    }
  },
  {
    id: 'BMS-ER-BIH-02',
    name: 'Bihar Fleet Rickshaw 02',
    type: 'bms',
    status: 'warning',
    model: 'VoltBMS-LFP-48V',
    firmware: 'v2.1.3',
    location: { lat: 25.6110, lng: 85.1440, city: 'Patna, Bihar', route: BIHAR_ROUTE, currentRouteIndex: 0 },
    owner: 'Dehat Energy Operators',
    gatewayId: 'GW-PAT-MOD-02',
    telemetry: {
      voltage: 48.8,
      current: -2.5,
      soc: 18,
      soh: 91,
      temp: 38.2,
      faults: ['Low SoC', 'Cell #4 Voltage Under-limit'],
      cellVoltages: [3.18, 3.19, 3.17, 2.92, 3.19, 3.18, 3.17, 3.18, 3.19, 3.17, 3.19, 3.18, 3.17, 3.18, 3.19, 3.17],
      cellTemps: [37, 38, 38, 41, 38, 37, 37, 38, 37, 38, 39, 38, 37, 38, 37, 38],
      mosfetStatus: 'on',
      lastUpdated: new Date().toISOString()
    },
    aiPredictions: {
      rul: 1120,
      failureProbability: 18.5,
      predictedFaultType: 'Cell Degradation',
      healthRank: 62,
      cellRunawayRisk: false,
      mosfetRisk: false,
      chargerOverheatingRisk: false,
      anomaliesDetected: ['Voltage Imbalance Detected', 'Cell #4 resistance increase']
    }
  },
  {
    id: 'BMS-ER-NCR-03',
    name: 'NCR Express Loader 03',
    type: 'bms',
    status: 'fault',
    model: 'VoltBMS-LFP-60V',
    firmware: 'v2.1.4',
    location: { lat: 28.5800, lng: 77.2100, city: 'Noida-NCR', route: NCR_ROUTE.slice().reverse(), currentRouteIndex: 4 },
    owner: 'Zomato Last-Mile Cargo',
    gatewayId: 'GW-DEL-TLM-01',
    telemetry: {
      voltage: 62.1,
      current: 0.0,
      soc: 55,
      soh: 88,
      temp: 64.8,
      faults: ['BMS Thermal Cut-off', 'Over-temperature Warning'],
      cellVoltages: [3.88, 3.89, 3.92, 3.87, 3.88, 3.89, 4.12, 3.88, 3.88, 3.89, 3.90, 3.87, 3.88, 3.89, 3.89, 3.88],
      cellTemps: [61, 62, 63, 62, 64, 63, 71, 62, 61, 62, 63, 62, 64, 63, 61, 62],
      mosfetStatus: 'off',
      lastUpdated: new Date().toISOString()
    },
    aiPredictions: {
      rul: 680,
      failureProbability: 76.4,
      predictedFaultType: 'Thermal Runaway Risk',
      healthRank: 24,
      cellRunawayRisk: true,
      mosfetRisk: true,
      chargerOverheatingRisk: false,
      anomaliesDetected: ['High temperature on cell #7', 'MOSFET gating resistance anomaly']
    }
  },
  {
    id: 'SLR-RAJ-01',
    name: 'Rajasthan Commercial Solar 01',
    type: 'solar',
    status: 'online',
    model: 'VoltInvert-Grid-100K',
    firmware: 'v1.8.8',
    location: { lat: 26.9124, lng: 75.7873, city: 'Jaipur, RJ' },
    owner: 'Tata Power C&I Asset',
    gatewayId: 'GW-JAP-SLR-03',
    telemetry: {
      voltage: 680.5,
      current: 98.4,
      soc: 0,
      soh: 100,
      temp: 42.1,
      activePower: 67.0, // kW
      energyGenerated: 480.5, // kWh today
      faults: [],
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: 'BES-IND-01',
    name: 'Factory BESS Control 01',
    type: 'bess',
    status: 'online',
    model: 'VoltBESS-LiFePO4-250K',
    firmware: 'v3.0.2',
    location: { lat: 28.4595, lng: 77.0266, city: 'Gurugram, HR' },
    owner: 'Adani Logistics Hub',
    gatewayId: 'GW-GUR-BESS-04',
    telemetry: {
      voltage: 412.3,
      current: -96.9, // charging
      soc: 85,
      soh: 97,
      temp: 29.8,
      activePower: -40.0, // kW (charging)
      energyConsumed: 320.4, // kWh today
      faults: [],
      lastUpdated: new Date().toISOString()
    },
    aiPredictions: {
      rul: 4100,
      failureProbability: 0.5,
      healthRank: 99,
      cellRunawayRisk: false,
      mosfetRisk: false,
      chargerOverheatingRisk: false,
      anomaliesDetected: []
    }
  },
  {
    id: 'MTR-IND-01',
    name: 'Industrial Smart Meter 01',
    type: 'meter',
    status: 'online',
    model: 'VoltMeter-DLMS-3Ph',
    firmware: 'v1.4.1',
    location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai, MH' },
    owner: 'Aegis Warehouse Infra',
    gatewayId: 'GW-MUM-DLMS-05',
    telemetry: {
      voltage: 415.2,
      current: 240.8,
      soc: 0,
      soh: 100,
      temp: 27.5,
      activePower: 168.4, // kW load
      reactivePower: 34.2, // kVAR
      powerFactor: 0.98,
      frequency: 50.02, // Hz
      faults: [],
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: 'CHG-NCR-01',
    name: 'DC Charger Noida Hub',
    type: 'charger',
    status: 'online',
    model: 'VoltCharger-DC-120K',
    firmware: 'v1.9.2',
    location: { lat: 28.5355, lng: 77.3910, city: 'Noida, UP' },
    owner: 'Voltava Charge-Network',
    gatewayId: 'GW-NOI-EV-06',
    telemetry: {
      voltage: 452.1,
      current: 192.5, // actively charging EV
      soc: 0,
      soh: 99,
      temp: 48.6,
      activePower: 87.0, // kW
      energyConsumed: 450.8, // kWh dispensed
      faults: [],
      lastUpdated: new Date().toISOString()
    },
    aiPredictions: {
      rul: 3200,
      failureProbability: 4.8,
      healthRank: 88,
      cellRunawayRisk: false,
      mosfetRisk: false,
      chargerOverheatingRisk: false,
      anomaliesDetected: []
    }
  },
  {
    id: 'TLM-INF-01',
    name: 'Telemetry Crawler Cranes',
    type: 'telematics',
    status: 'online',
    model: 'VoltLink-CAN-4G',
    firmware: 'v2.0.1',
    location: { lat: 22.5726, lng: 88.3639, city: 'Kolkata, WB' },
    owner: 'L&T Construction Site',
    gatewayId: 'GW-DEL-TLM-01',
    telemetry: {
      voltage: 24.2, // Starter battery
      current: 12.8, // alternator charging
      soc: 94,
      soh: 94,
      temp: 26.4,
      faults: [],
      lastUpdated: new Date().toISOString()
    }
  }
];

export let gateways: Gateway[] = [
  {
    id: 'GW-DEL-TLM-01',
    name: 'Delhi-NCR Telematics Hub',
    protocol: 'can',
    status: 'online',
    connectionType: 'serial',
    serialPort: '/dev/ttyUSB0',
    baudRate: 250000,
    pollingInterval: 2,
    signalStrength: -68,
    connectedDevices: ['BMS-ER-NCR-01', 'BMS-ER-NCR-03', 'TLM-INF-01'],
    lastSync: new Date().toISOString(),
    packetsTransmitted: 1250,
    packetsFailed: 2
  },
  {
    id: 'GW-PAT-MOD-02',
    name: 'Patna Dehat Microgrid RTU',
    protocol: 'modbus-rtu',
    status: 'online',
    connectionType: 'serial',
    serialPort: 'COM3',
    baudRate: 9600,
    pollingInterval: 5,
    signalStrength: -82,
    connectedDevices: ['BMS-ER-BIH-02'],
    lastSync: new Date().toISOString(),
    packetsTransmitted: 412,
    packetsFailed: 8
  },
  {
    id: 'GW-JAP-SLR-03',
    name: 'Jaipur Solar RTU',
    protocol: 'modbus-tcp',
    status: 'online',
    connectionType: 'tcp',
    ipAddress: '192.168.10.45',
    port: 502,
    pollingInterval: 3,
    signalStrength: -62,
    connectedDevices: ['SLR-RAJ-01'],
    lastSync: new Date().toISOString(),
    packetsTransmitted: 850,
    packetsFailed: 0
  },
  {
    id: 'GW-GUR-BESS-04',
    name: 'Gurugram BESS Gateway',
    protocol: 'dlms',
    status: 'online',
    connectionType: 'tcp',
    ipAddress: '192.168.1.12',
    port: 4005,
    pollingInterval: 2,
    signalStrength: -55,
    connectedDevices: ['BES-IND-01'],
    lastSync: new Date().toISOString(),
    packetsTransmitted: 1420,
    packetsFailed: 1
  },
  {
    id: 'GW-MUM-DLMS-05',
    name: 'Mumbai Aegis smart meter Gateway',
    protocol: 'dlms',
    status: 'online',
    connectionType: 'tcp',
    ipAddress: '10.23.4.156',
    port: 4050,
    pollingInterval: 10,
    signalStrength: -78,
    connectedDevices: ['MTR-IND-01'],
    lastSync: new Date().toISOString(),
    packetsTransmitted: 290,
    packetsFailed: 3
  },
  {
    id: 'GW-NOI-EV-06',
    name: 'Noida EV Charger Gateway',
    protocol: 'ocpp',
    status: 'online',
    connectionType: 'tcp',
    ipAddress: '192.168.20.101',
    port: 8080,
    pollingInterval: 4,
    signalStrength: -70,
    connectedDevices: ['CHG-NCR-01'],
    lastSync: new Date().toISOString(),
    packetsTransmitted: 680,
    packetsFailed: 4
  }
];


export let gridMetrics: GridMetrics = {
  solarPower: 67.0,
  bessPower: -40.0,
  gridImport: 141.4,
  industrialLoad: 168.4,
  gridVoltage: 415.2,
  gridFrequency: 50.02,
  powerFactor: 0.98,
  peakLimit: 150.0, // kW Limit
  savingsINR: 12840.50,
  carbonOffset: 485.6,
  outageBackupPredict: 180,
  isGridDown: false,
};

// Map storing history for each device ID
export const historyMap: Record<string, TelemetryHistoryPoint[]> = {};

// Initialize history with initial mock points
export function initHistory() {
  devices.forEach(d => {
    const hist: TelemetryHistoryPoint[] = [];
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60000);
      hist.push({
        timestamp: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voltage: Number((d.telemetry.voltage + (Math.random() - 0.5) * 5).toFixed(1)),
        current: Number((d.telemetry.current + (Math.random() - 0.5) * 3).toFixed(1)),
        soc: d.telemetry.soc ? Math.max(0, Math.min(100, Math.round(d.telemetry.soc - i * 2))) : 0,
        temp: Number((d.telemetry.temp + (Math.random() - 0.5) * 2).toFixed(1)),
        power: d.telemetry.activePower ? Number((d.telemetry.activePower + (Math.random() - 0.5) * 4).toFixed(1)) : undefined
      });
    }
    historyMap[d.id] = hist;
  });
}
export function simulateStep() {
  // 1. Simulate gateways
  gateways = gateways.map(g => {
    if (g.status === 'offline' || g.status === 'error') {
      return g;
    }
    
    if (g.status === 'connecting') {
      const isOnlineNow = Math.random() < 0.3;
      return {
        ...g,
        status: isOnlineNow ? 'online' : 'connecting',
        lastSync: new Date().toISOString()
      };
    }
    
    const packetsSent = Math.floor(Math.random() * 3) + 1;
    const failedPackets = Math.random() < 0.02 ? 1 : 0;
    let nextSig = g.signalStrength ? g.signalStrength + (Math.floor(Math.random() * 3) - 1) : undefined;
    if (nextSig !== undefined) {
      nextSig = Math.max(-90, Math.min(-40, nextSig));
    }
    
    return {
      ...g,
      packetsTransmitted: g.packetsTransmitted + packetsSent,
      packetsFailed: g.packetsFailed + failedPackets,
      signalStrength: nextSig,
      lastSync: new Date().toISOString()
    };
  });

  // 2. Simulate devices
  devices = devices.map(d => {
    const gw = gateways.find(g => g.id === d.gatewayId);
    const isGwDown = gw && (gw.status === 'offline' || gw.status === 'error');
    
    if (isGwDown) {
      return {
        ...d,
        status: 'offline',
        telemetry: {
          ...d.telemetry,
          faults: ['Gateway Connection Timeout'],
          lastUpdated: new Date().toISOString()
        }
      };
    }
    
    if (d.telemetry.mosfetStatus === 'off') {
      return {
        ...d,
        status: 'offline',
        telemetry: {
          ...d.telemetry,
          faults: ['MOSFET Forced Shutoff'],
          lastUpdated: new Date().toISOString()
        }
      };
    }

    const updatedTelemetry = { ...d.telemetry };
    const updatedLocation = { ...d.location };
    let updatedAi = d.aiPredictions ? { ...d.aiPredictions } : undefined;

    if (d.location.route && d.location.currentRouteIndex !== undefined) {
      const nextIdx = (d.location.currentRouteIndex + 1) % d.location.route.length;
      updatedLocation.currentRouteIndex = nextIdx;
      const coord = d.location.route[nextIdx];
      updatedLocation.lat = Number((coord[0] + (Math.random() - 0.5) * 0.0005).toFixed(6));
      updatedLocation.lng = Number((coord[1] + (Math.random() - 0.5) * 0.0005).toFixed(6));
    }

    // Realtime fluctuation
    if (d.type === 'bms') {
      const isCharging = d.telemetry.current > 0;
      const isDischarging = d.telemetry.current < 0;

      if (isDischarging) {
        updatedTelemetry.soc = Math.max(1, Number((updatedTelemetry.soc - (d.id === 'BMS-ER-NCR-01' ? 0.05 : 0.02)).toFixed(2)));
        updatedTelemetry.voltage = Math.max(42, Number((updatedTelemetry.voltage - 0.02).toFixed(2)));
      } else if (isCharging) {
        updatedTelemetry.soc = Math.min(100, Number((updatedTelemetry.soc + 0.1).toFixed(2)));
        updatedTelemetry.voltage = Math.min(54, Number((updatedTelemetry.voltage + 0.02).toFixed(2)));
      }

      if (updatedTelemetry.cellVoltages) {
        const avg = updatedTelemetry.voltage / 16;
        updatedTelemetry.cellVoltages = updatedTelemetry.cellVoltages.map((_v, i) => {
          if (d.id === 'BMS-ER-BIH-02' && i === 3) {
            return Number((2.9 + Math.random() * 0.05).toFixed(2));
          }
          if (d.id === 'BMS-ER-NCR-03' && i === 6 && d.telemetry.temp > 50) {
            return Number((4.1 + Math.random() * 0.04).toFixed(2));
          }
          return Number((avg + (Math.random() - 0.5) * 0.05).toFixed(2));
        });
      }

      if (updatedTelemetry.cellTemps) {
        updatedTelemetry.cellTemps = updatedTelemetry.cellTemps.map((_t, i) => {
          if (d.id === 'BMS-ER-NCR-03' && i === 6 && d.telemetry.temp > 50) {
            return Math.min(90, Math.round(70 + Math.random() * 2));
          }
          return Math.max(20, Math.round(d.telemetry.temp + (Math.random() - 0.5) * 1.5));
        });
      }

      if (d.status === 'fault') {
        updatedTelemetry.temp = Number((updatedTelemetry.temp + (Math.random() - 0.5) * 0.5).toFixed(1));
      } else {
        updatedTelemetry.temp = Number((32 + Math.sin(Date.now() / 60000) * 3 + Math.random() * 0.4).toFixed(1));
      }
      updatedTelemetry.current = Number((d.telemetry.current + (Math.random() - 0.5) * 1.2).toFixed(1));
    } else if (d.type === 'solar') {
      const hour = new Date().getHours() + (new Date().getMinutes() / 60);
      const solarIntensity = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
      const basePower = d.id === 'SLR-RAJ-01' ? 100 : 50;
      updatedTelemetry.activePower = Number((basePower * solarIntensity * (0.9 + Math.random() * 0.1)).toFixed(1));
      updatedTelemetry.energyGenerated = Number(((updatedTelemetry.energyGenerated || 0) + (updatedTelemetry.activePower / 1800)).toFixed(2));
      updatedTelemetry.voltage = Number((650 + (Math.random() - 0.5) * 15).toFixed(1));
      updatedTelemetry.current = Number((updatedTelemetry.activePower * 1000 / updatedTelemetry.voltage).toFixed(1));
    } else if (d.type === 'bess') {
      if (gridMetrics.gridImport > gridMetrics.peakLimit) {
        updatedTelemetry.activePower = 35.0; 
        updatedTelemetry.soc = Math.max(10, Number((updatedTelemetry.soc - 0.05).toFixed(2)));
      } else {
        updatedTelemetry.activePower = -30.0; 
        updatedTelemetry.soc = Math.min(100, Number((updatedTelemetry.soc + 0.03).toFixed(2)));
      }
      updatedTelemetry.energyConsumed = Number(((updatedTelemetry.energyConsumed || 0) + (Math.abs(updatedTelemetry.activePower) / 1800)).toFixed(2));
      updatedTelemetry.voltage = Number((410 + (Math.random() - 0.5) * 4).toFixed(1));
      updatedTelemetry.current = Number((updatedTelemetry.activePower * 1000 / updatedTelemetry.voltage).toFixed(1));
    } else if (d.type === 'meter') {
      updatedTelemetry.activePower = Number((160 + Math.sin(Date.now() / 30000) * 15 + Math.random() * 5).toFixed(1));
      updatedTelemetry.reactivePower = Number((updatedTelemetry.activePower * 0.2 + Math.random()).toFixed(1));
      updatedTelemetry.current = Number((updatedTelemetry.activePower * 1000 / (1.732 * updatedTelemetry.voltage)).toFixed(1));
      updatedTelemetry.powerFactor = Number((0.97 + Math.random() * 0.02).toFixed(2));
      updatedTelemetry.frequency = Number((49.95 + Math.random() * 0.1).toFixed(2));
    } else if (d.type === 'charger') {
      updatedTelemetry.activePower = Number((80 + Math.sin(Date.now() / 45000) * 20 + Math.random() * 2).toFixed(1));
      updatedTelemetry.energyConsumed = Number(((updatedTelemetry.energyConsumed || 0) + (updatedTelemetry.activePower / 1800)).toFixed(2));
      updatedTelemetry.current = Number((updatedTelemetry.activePower * 1000 / updatedTelemetry.voltage).toFixed(1));
      updatedTelemetry.temp = Number((45 + Math.sin(Date.now() / 60000) * 5 + Math.random()).toFixed(1));
    }

    // Rebuild faults dynamically based on updated telemetry values
    const dynamicFaults: string[] = [];

    // Keep any non-telemetry state faults like OTA updates
    const otaFault = d.telemetry.faults.find(f => f === 'OTA Update Initiated');
    if (otaFault) {
      dynamicFaults.push(otaFault);
    }

    if (d.type === 'bms') {
      if (updatedTelemetry.soc < 20) {
        dynamicFaults.push('Low SoC');
      }
      if (updatedTelemetry.temp > 60) {
        dynamicFaults.push('BMS Thermal Cut-off');
        dynamicFaults.push('Over-temperature Warning');
        // Critical temp shutoff
        updatedTelemetry.mosfetStatus = 'off';
      } else if (updatedTelemetry.temp > 45) {
        dynamicFaults.push('Over-temperature Warning');
      }
      
      if (updatedTelemetry.cellVoltages) {
        if (updatedTelemetry.cellVoltages.some(v => v < 3.0)) {
          dynamicFaults.push('Cell Voltage Under-limit');
        }
        const minCell = Math.min(...updatedTelemetry.cellVoltages);
        const maxCell = Math.max(...updatedTelemetry.cellVoltages);
        if (maxCell - minCell > 0.25) {
          dynamicFaults.push('Voltage Imbalance Warning');
        }
      }
    } else if (d.type === 'solar') {
      if (updatedTelemetry.temp > 50) {
        dynamicFaults.push('Inverter Over-temperature Warning');
      }
    } else if (d.type === 'charger') {
      if (updatedTelemetry.temp > 60) {
        dynamicFaults.push('Charger Over-temperature Alert');
      }
    } else if (d.type === 'meter') {
      if (updatedTelemetry.voltage < 408) {
        dynamicFaults.push('Voltage Sag Warning');
      } else if (updatedTelemetry.voltage > 422) {
        dynamicFaults.push('Voltage Swell Warning');
      }
      if (updatedTelemetry.powerFactor && updatedTelemetry.powerFactor < 0.96) {
        dynamicFaults.push('Low Power Factor Alert');
      }
    } else if (d.type === 'bess') {
      if (updatedTelemetry.soc < 20) {
        dynamicFaults.push('Low SoC');
      }
      if (updatedTelemetry.temp > 45) {
        dynamicFaults.push('BESS Over-temperature Warning');
      }
    }

    updatedTelemetry.faults = dynamicFaults;
    updatedTelemetry.lastUpdated = new Date().toISOString();

    // Push telemetry to historical map
    const hist = historyMap[d.id] || [];
    const newHist = [...hist.slice(1), {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      voltage: updatedTelemetry.voltage,
      current: updatedTelemetry.current,
      soc: updatedTelemetry.soc,
      temp: updatedTelemetry.temp,
      power: updatedTelemetry.activePower
    }];
    historyMap[d.id] = newHist;

    const normalStatus = updatedTelemetry.faults.length > 0 
      ? (updatedTelemetry.faults.some(f => f.includes('Cut-off') || f.includes('Forced Shutoff') || f.includes('Alert') || f.includes('Timeout')) ? 'fault' : 'warning') 
      : 'online';

    // Dynamic AI Prognostic updates
    if (d.aiPredictions && updatedAi) {
      const hasCriticalFaults = updatedTelemetry.faults.some(f => 
        f.includes('Thermal') || f.includes('Cut-off') || f.includes('Warning') || f.includes('Low SoC') || f.includes('Under-limit')
      );
      const isMosfetOk = updatedTelemetry.mosfetStatus ? updatedTelemetry.mosfetStatus === 'on' : true;
      
      if (!hasCriticalFaults && isMosfetOk) {
        // Recovering / Normal operation
        const targetFailProb = d.id === 'BMS-ER-NCR-01' ? 1.2 : d.id === 'CHG-NCR-01' ? 4.8 : 5.0;
        if (updatedAi.failureProbability > targetFailProb) {
          updatedAi.failureProbability = Number(
            Math.max(targetFailProb, updatedAi.failureProbability - 2.5).toFixed(1)
          );
        }
        
        const targetHealth = d.id === 'BMS-ER-NCR-01' ? 94 : d.id === 'CHG-NCR-01' ? 88 : 90;
        if (updatedAi.healthRank < targetHealth) {
          updatedAi.healthRank = Math.min(targetHealth, updatedAi.healthRank + 2);
        }
        
        const targetRul = d.id === 'BMS-ER-NCR-03' ? 1800 : updatedAi.rul;
        if (updatedAi.rul < targetRul) {
          updatedAi.rul = Math.min(targetRul, updatedAi.rul + 50);
        }

        if (updatedAi.failureProbability < 15) {
          updatedAi.cellRunawayRisk = false;
          updatedAi.mosfetRisk = false;
          updatedAi.anomaliesDetected = updatedAi.anomaliesDetected.filter(a => 
            !a.includes('temperature') && !a.includes('High temperature') && !a.includes('MOSFET')
          );
          if (updatedAi.predictedFaultType === 'Thermal Runaway Risk') {
            delete updatedAi.predictedFaultType;
          }
        }
      } else {
        // Elevated risk state
        if (updatedTelemetry.faults.includes('BMS Thermal Cut-off') || updatedTelemetry.temp > 60) {
          updatedAi.failureProbability = Math.min(99.0, Number((updatedAi.failureProbability + 1.5).toFixed(1)));
          updatedAi.healthRank = Math.max(10, updatedAi.healthRank - 2);
          updatedAi.cellRunawayRisk = true;
          updatedAi.mosfetRisk = true;
          if (!updatedAi.anomaliesDetected.includes('High temperature on cell #7')) {
            updatedAi.anomaliesDetected.push('High temperature on cell #7');
          }
          updatedAi.predictedFaultType = 'Thermal Runaway Risk';
        }
      }
    }

    return {
      ...d,
      status: normalStatus,
      location: updatedLocation,
      telemetry: updatedTelemetry,
      aiPredictions: updatedAi
    };
  });

  // Update grid metrics based on simulator values
  const solarCurrent = devices.find(d => d.id === 'SLR-RAJ-01')?.telemetry.activePower || 0;
  const bessCurrent = devices.find(d => d.id === 'BES-IND-01')?.telemetry.activePower || 0;
  const factoryMeterCurrent = devices.find(d => d.id === 'MTR-IND-01')?.telemetry.activePower || 168.4;

  const calculatedGridImport = Math.max(0, Number((factoryMeterCurrent - solarCurrent - bessCurrent).toFixed(1)));
  const savingsSpeed = 0.5 + (solarCurrent > 0 ? solarCurrent * 0.05 : 0) + (bessCurrent > 0 ? 0.8 : 0);

  gridMetrics = {
    ...gridMetrics,
    solarPower: solarCurrent,
    bessPower: bessCurrent,
    gridImport: calculatedGridImport,
    industrialLoad: factoryMeterCurrent,
    savingsINR: Number((gridMetrics.savingsINR + (savingsSpeed / 300)).toFixed(2)),
    carbonOffset: Number((gridMetrics.carbonOffset + (solarCurrent / 3600)).toFixed(4)),
    gridFrequency: Number((49.95 + Math.random() * 0.1).toFixed(2)),
    gridVoltage: Number((415 + (Math.random() - 0.5) * 5).toFixed(1))
  };
}

export function triggerOtaUpdate(id: string) {
  devices = devices.map(d => {
    if (d.id === id) {
      return {
        ...d,
        firmware: d.firmware + ' (Installing OTA...)',
        telemetry: {
          ...d.telemetry,
          faults: [...d.telemetry.faults, 'OTA Update Initiated']
        }
      };
    }
    return d;
  });

  setTimeout(() => {
    devices = devices.map(d => {
      if (d.id === id) {
        const baseVer = d.firmware.split(' ')[0];
        const [major, minor, patch] = baseVer.replace('v', '').split('.').map(Number);
        const nextPatch = patch + 1;
        return {
          ...d,
          firmware: `v${major}.${minor}.${nextPatch}`,
          telemetry: {
            ...d.telemetry,
            faults: d.telemetry.faults.filter(f => f !== 'OTA Update Initiated')
          }
        };
      }
      return d;
    });
  }, 6000);
}

export function toggleMosfet(id: string) {
  let resultingMosfet: 'on' | 'off' = 'on';
  devices = devices.map(d => {
    if (d.id === id && d.telemetry.mosfetStatus) {
      const nextState = d.telemetry.mosfetStatus === 'on' ? 'off' : 'on';
      resultingMosfet = nextState;
      const nextStatus = nextState === 'off' ? 'offline' : 'online';
      const nextFaults = nextState === 'off' 
        ? [...d.telemetry.faults, 'MOSFET Forced Shutoff'] 
        : d.telemetry.faults.filter(f => f !== 'MOSFET Forced Shutoff' && f !== 'BMS Thermal Cut-off' && f !== 'Over-temperature Warning');
      return {
        ...d,
        status: nextStatus,
        telemetry: {
          ...d.telemetry,
          mosfetStatus: nextState,
          faults: nextFaults,
          temp: nextState === 'off' ? 32.0 : d.telemetry.temp
        }
      };
    }
    return d;
  });
  return resultingMosfet;
}

export function addGateway(data: any): Gateway {
  const nextId = `GW-${data.protocol.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
  const newGw: Gateway = {
    id: nextId,
    name: data.name || `New ${data.protocol.toUpperCase()} Gateway`,
    protocol: data.protocol,
    status: 'online',
    connectionType: data.connectionType || 'tcp',
    ipAddress: data.ipAddress,
    port: data.port ? Number(data.port) : undefined,
    serialPort: data.serialPort,
    baudRate: data.baudRate ? Number(data.baudRate) : undefined,
    pollingInterval: data.pollingInterval ? Number(data.pollingInterval) : 5,
    signalStrength: -60 - Math.floor(Math.random() * 20),
    connectedDevices: data.connectedDevices || [],
    lastSync: new Date().toISOString(),
    packetsTransmitted: 0,
    packetsFailed: 0
  };
  
  gateways.push(newGw);
  
  // Link devices
  if (newGw.connectedDevices.length > 0) {
    devices = devices.map(d => {
      if (newGw.connectedDevices.includes(d.id)) {
        return { ...d, gatewayId: newGw.id };
      }
      return d;
    });
  }
  
  return newGw;
}

export function updateGateway(id: string, data: any): Gateway | null {
  const idx = gateways.findIndex(g => g.id === id);
  if (idx === -1) return null;
  
  const existing = gateways[idx];
  const updated: Gateway = {
    ...existing,
    name: data.name !== undefined ? data.name : existing.name,
    protocol: data.protocol !== undefined ? data.protocol : existing.protocol,
    connectionType: data.connectionType !== undefined ? data.connectionType : existing.connectionType,
    ipAddress: data.ipAddress !== undefined ? data.ipAddress : existing.ipAddress,
    port: data.port !== undefined ? Number(data.port) : existing.port,
    serialPort: data.serialPort !== undefined ? data.serialPort : existing.serialPort,
    baudRate: data.baudRate !== undefined ? Number(data.baudRate) : existing.baudRate,
    pollingInterval: data.pollingInterval !== undefined ? Number(data.pollingInterval) : existing.pollingInterval,
    connectedDevices: data.connectedDevices !== undefined ? data.connectedDevices : existing.connectedDevices
  };
  
  gateways[idx] = updated;
  
  // Update device mappings
  if (data.connectedDevices !== undefined) {
    devices = devices.map(d => {
      // If it is in the new list, make sure it has this gatewayId
      if (updated.connectedDevices.includes(d.id)) {
        return { ...d, gatewayId: updated.id };
      }
      // If it had this gatewayId but is no longer in the list, clear it
      if (d.gatewayId === updated.id) {
        return { ...d, gatewayId: undefined };
      }
      return d;
    });
  }
  
  return updated;
}

export function toggleGateway(id: string): Gateway | null {
  const idx = gateways.findIndex(g => g.id === id);
  if (idx === -1) return null;
  
  const existing = gateways[idx];
  let nextStatus: GatewayStatus = 'online';
  if (existing.status === 'online') {
    nextStatus = 'offline';
  } else if (existing.status === 'offline') {
    nextStatus = 'connecting';
  }
  
  gateways[idx] = {
    ...existing,
    status: nextStatus,
    lastSync: new Date().toISOString()
  };
  
  return gateways[idx];
}

export function pingGateway(id: string): string {
  const gw = gateways.find(g => g.id === id);
  if (!gw) return 'Error: Gateway not found';
  
  const ipOrSerial = gw.connectionType === 'tcp' 
    ? `${gw.ipAddress}:${gw.port}` 
    : `${gw.serialPort} @ ${gw.baudRate}bps`;
    
  let output = `Voltava Terminal Diagnostics v1.2.0\n`;
  output += `PING ${gw.name} (${id}) at ${ipOrSerial}...\n`;
  
  if (gw.status === 'offline') {
    output += `Request timed out.\n`;
    output += `Request timed out.\n`;
    output += `Request timed out.\n`;
    output += `--- ${gw.id} ping statistics ---\n`;
    output += `3 packets transmitted, 0 received, 100% packet loss\n`;
    output += `Ping failed. Gateway is OFFLINE.\n`;
    return output;
  }
  
  const rtt1 = 12 + Math.floor(Math.random() * 30);
  const rtt2 = 12 + Math.floor(Math.random() * 30);
  const rtt3 = 12 + Math.floor(Math.random() * 30);
  
  output += `64 bytes response from ${id}: icmp_seq=1 ttl=64 time=${rtt1}ms\n`;
  output += `64 bytes response from ${id}: icmp_seq=2 ttl=64 time=${rtt2}ms\n`;
  output += `64 bytes response from ${id}: icmp_seq=3 ttl=64 time=${rtt3}ms\n`;
  output += `--- ${gw.id} ping statistics ---\n`;
  output += `3 packets transmitted, 3 received, 0% packet loss, time 2004ms\n`;
  output += `rtt min/avg/max = ${Math.min(rtt1, rtt2, rtt3)}/${Math.round((rtt1+rtt2+rtt3)/3)}/${Math.max(rtt1, rtt2, rtt3)} ms\n`;
  output += `Ping successful. Status: ${gw.status.toUpperCase()}\n`;
  return output;
}

export function scanGatewayBus(id: string): string {
  const gw = gateways.find(g => g.id === id);
  if (!gw) return 'Error: Gateway not found';
  
  let output = `Voltava Serial/Network Bus Scanner v1.2.0\n`;
  output += `Scanning bus on ${gw.name} [Protocol: ${gw.protocol.toUpperCase()}]...\n`;
  
  if (gw.status === 'offline') {
    output += `Error: Bus communication error. Gateway is offline.\n`;
    return output;
  }
  
  if (gw.protocol === 'modbus-rtu' || gw.protocol === 'modbus-tcp') {
    output += `Starting Modbus Unit ID Scan (IDs 1 to 16)...\n`;
    for (let i = 1; i <= 8; i++) {
      const isDeviceMatched = gw.connectedDevices.length > 0 && gw.connectedDevices.some(dId => {
        const d = devices.find(dev => dev.id === dId);
        return d && (d.id.includes(`0${i}`) || d.id.includes(`01`) || d.id.includes(`02`) || d.id.includes(`03`));
      });
      const matchingDev = gw.connectedDevices.map(dId => devices.find(dev => dev.id === dId)).find(dev => dev && dev.id);
      
      if (matchingDev && i === 1) {
        output += `[Unit ID ${i}]: Device RESPONDED (Model: ${matchingDev.model}, ID: ${matchingDev.id})\n`;
      } else {
        output += `[Unit ID ${i}]: Request timed out.\n`;
      }
    }
    output += `Scan complete. Found ${gw.connectedDevices.length} responding devices.\n`;
  } else if (gw.protocol === 'dlms') {
    output += `Scanning DLMS/COSEM HDLC Address space...\n`;
    output += `Opening Logical Device Association LN (Logical Name) Referencing...\n`;
    gw.connectedDevices.forEach(dId => {
      const dev = devices.find(d => d.id === dId);
      if (dev) {
        output += `[SAP Address 0x01/0x10]: Connected to ${dev.model} (${dev.id}) OBIS profile active.\n`;
      }
    });
    output += `Scan complete.\n`;
  } else if (gw.protocol === 'ocpp') {
    output += `Listening for OCPP Chargepoint handshakes...\n`;
    gw.connectedDevices.forEach(dId => {
      const dev = devices.find(d => d.id === dId);
      if (dev) {
        output += `[WebSocket OCPP 1.6J]: Connection active for Charge Station ${dev.id}\n`;
      }
    });
    output += `Scan complete.\n`;
  } else if (gw.protocol === 'can') {
    output += `Scanning J1939 CAN network identifier space...\n`;
    output += `PGN Filter active: 61444 (EEC1), 65263 (IC1)\n`;
    gw.connectedDevices.forEach(dId => {
      const dev = devices.find(d => d.id === dId);
      if (dev) {
        output += `[Source Addr 0x${(10 + Math.floor(Math.random() * 20)).toString(16).toUpperCase()}]: Broadcast detected. Name: ${dev.name}\n`;
      }
    });
    output += `Scan complete.\n`;
  }
  
  return output;
}

export function addOrUpdateExternalDevice(id: string, payload: any): void {
  const existingIdx = devices.findIndex(d => d.id === id);

  const updatedTelemetry = {
    voltage: payload.voltage || 0,
    current: payload.current || 0,
    soc: payload.soc || 0,
    soh: payload.soh || 100, // added soh default
    temp: payload.temp || 0,
    faults: payload.faults || [],
    cellVoltages: payload.cellVoltages,
    cellTemps: payload.cellTemps,
    mosfetStatus: payload.mosfetStatus,
    activePower: payload.power,
    lastUpdated: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    // Update existing device
    devices[existingIdx] = {
      ...devices[existingIdx],
      telemetry: {
        ...devices[existingIdx].telemetry,
        ...updatedTelemetry
      },
      status: payload.faults && payload.faults.length > 0 ? 'fault' : 'online'
    };
  } else {
    // Create new device dynamically
    const newDevice = {
      id,
      name: payload.name || `External Device ${id}`,
      type: payload.type || 'bms', // default type
      status: payload.faults && payload.faults.length > 0 ? 'fault' : 'online',
      model: payload.model || 'Dummy-Test-Model',
      firmware: payload.firmware || 'v1.0.0',
      location: payload.location || { lat: 0, lng: 0, city: 'Testing Lab' },
      owner: payload.owner || 'Testing Team',
      telemetry: updatedTelemetry
    };
    devices.push(newDevice as any);
  }

  // Also update history
  const hist = historyMap[id] || [];
  const newHistPoint = {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    voltage: updatedTelemetry.voltage,
    current: updatedTelemetry.current,
    soc: updatedTelemetry.soc,
    temp: updatedTelemetry.temp,
    power: payload.power
  };
  
  if (hist.length >= 10) {
    historyMap[id] = [...hist.slice(1), newHistPoint];
  } else {
    historyMap[id] = [...hist, newHistPoint];
  }
}
