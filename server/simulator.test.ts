import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { simulateStep, devices, gateways, gridMetrics, historyMap } from './simulator';
import type { Device, Gateway } from './types';

describe('simulateStep', () => {
  let originalDevices: Device[];
  let originalGateways: Gateway[];
  let originalGridMetrics: any;
  let originalHistoryMap: any;

  beforeEach(() => {
    // Save original state
    originalDevices = JSON.parse(JSON.stringify(devices));
    originalGateways = JSON.parse(JSON.stringify(gateways));
    originalGridMetrics = JSON.parse(JSON.stringify(gridMetrics));
    originalHistoryMap = JSON.parse(JSON.stringify(historyMap));

    // Clear and prepare fresh state
    devices.length = 0;
    gateways.length = 0;
    for (const key of Object.keys(historyMap)) delete historyMap[key];

    // Make random deterministic (return 0.5)
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // Fix Date.now to avoid flaky time-based logic (noon on Jan 1)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    // Restore original state
    devices.length = 0;
    devices.push(...originalDevices);
    gateways.length = 0;
    gateways.push(...originalGateways);
    Object.assign(gridMetrics, originalGridMetrics);

    for (const key of Object.keys(historyMap)) delete historyMap[key];
    for (const key of Object.keys(originalHistoryMap)) historyMap[key] = originalHistoryMap[key];

    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Gateways simulation', () => {
    it('should not update offline or error gateways', () => {
      gateways.push(
        { id: 'gw-1', name: 'GW 1', status: 'offline', connectionType: 'tcp', protocol: 'modbus-tcp', packetsTransmitted: 0, packetsFailed: 0, connectedDevices: [], lastSync: '', pollingInterval: 5 },
        { id: 'gw-2', name: 'GW 2', status: 'error', connectionType: 'tcp', protocol: 'modbus-tcp', packetsTransmitted: 0, packetsFailed: 0, connectedDevices: [], lastSync: '', pollingInterval: 5 }
      );

      simulateStep();

      expect(gateways[0].status).toBe('offline');
      expect(gateways[1].status).toBe('error');
    });

    it('should transition connecting gateways based on random probability', () => {
      gateways.push({
        id: 'gw-1', name: 'GW 1', status: 'connecting', connectionType: 'tcp', protocol: 'modbus-tcp',
        packetsTransmitted: 0, packetsFailed: 0, connectedDevices: [], lastSync: '', pollingInterval: 5
      });

      // Math.random() is 0.5, isOnlineNow will be false (0.5 < 0.3 is false)
      simulateStep();
      expect(gateways[0].status).toBe('connecting');

      // Force Math.random() to return < 0.3
      vi.spyOn(Math, 'random').mockReturnValue(0.2);
      simulateStep();
      expect(gateways[0].status).toBe('online');
      expect(gateways[0].lastSync).toBeDefined();
    });

    it('should update packets and signal strength for online gateways', () => {
      gateways.push({
        id: 'gw-1', name: 'GW 1', status: 'online', connectionType: 'tcp', protocol: 'modbus-tcp',
        packetsTransmitted: 10, packetsFailed: 1, signalStrength: -60, connectedDevices: [], lastSync: '', pollingInterval: 5
      });

      simulateStep();

      // Packets sent: floor(0.5 * 3) + 1 = 2
      // Failed packets: 0.5 < 0.02 = false (0)
      // Signal diff: floor(0.5 * 3) - 1 = 0
      expect(gateways[0].packetsTransmitted).toBe(12);
      expect(gateways[0].packetsFailed).toBe(1);
      expect(gateways[0].signalStrength).toBe(-60);
      expect(gateways[0].lastSync).toBeDefined();
    });
  });

  describe('Devices simulation', () => {
    it('should set device offline if gateway is down', () => {
      gateways.push({
        id: 'gw-1', name: 'GW 1', status: 'offline', connectionType: 'tcp', protocol: 'modbus-tcp',
        packetsTransmitted: 0, packetsFailed: 0, connectedDevices: [], lastSync: '', pollingInterval: 5
      });

      devices.push({
        id: 'dev-1', type: 'meter', status: 'online', gatewayId: 'gw-1', name: 'Meter 1',
        model: 'M-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 230, current: 10, soc: 0, soh: 100, temp: 30, faults: [], lastUpdated: '' }
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'dev-1')!;
      expect(dev.status).toBe('offline');
      expect(dev.telemetry.faults).toContain('Gateway Connection Timeout');
    });

    it('should set device offline if mosfet is off', () => {
      devices.push({
        id: 'dev-2', type: 'bms', status: 'online', name: 'BMS 1',
        model: 'B-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 50, current: 10, soc: 80, soh: 100, temp: 30, mosfetStatus: 'off', faults: [], lastUpdated: '' }
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'dev-2')!;
      expect(dev.status).toBe('offline');
      expect(dev.telemetry.faults).toContain('MOSFET Forced Shutoff');
    });

    it('should update location if route is defined', () => {
      devices.push({
        id: 'dev-3', type: 'telematics', status: 'online', name: 'Telematics 1',
        model: 'T-1', firmware: 'v1.0', owner: 'Test',
        location: {
          lat: 0, lng: 0, city: 'Test',
          route: [[10.0, 20.0], [10.1, 20.1], [10.2, 20.2]],
          currentRouteIndex: 0
        },
        telemetry: { voltage: 12, current: 1, soc: 100, soh: 100, temp: 30, faults: [], lastUpdated: '' }
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'dev-3')!;
      expect(dev.location.currentRouteIndex).toBe(1);
      expect(dev.location.lat).toBe(10.1); // offset is (0.5 - 0.5) * 0.0005 = 0
      expect(dev.location.lng).toBe(20.1);
    });

    it('should correctly simulate a BMS charging', () => {
      devices.push({
        id: 'dev-bms-charge', type: 'bms', status: 'online', name: 'BMS',
        model: 'B-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 50.0, current: 10.0, soc: 80.0, soh: 100, temp: 30, faults: [], lastUpdated: '' } // current > 0 means charging
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'dev-bms-charge')!;
      // Charging: soc + 0.1, voltage + 0.02
      expect(dev.telemetry.soc).toBe(80.1);
      expect(dev.telemetry.voltage).toBe(50.02);
    });

    it('should correctly simulate a BMS discharging', () => {
      devices.push({
        id: 'BMS-ER-NCR-01', type: 'bms', status: 'online', name: 'BMS',
        model: 'B-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 50.0, current: -10.0, soc: 80.0, soh: 100, temp: 30, faults: [], lastUpdated: '' } // current < 0 means discharging
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'BMS-ER-NCR-01')!;
      // Discharging (BMS-ER-NCR-01): soc - 0.05, voltage - 0.02
      expect(dev.telemetry.soc).toBe(79.95);
      expect(dev.telemetry.voltage).toBe(49.98);
    });

    it('should correctly simulate solar generation', () => {
      devices.push({
        id: 'SLR-RAJ-01', type: 'solar', status: 'online', name: 'Solar',
        model: 'S-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 650, current: 0, soc: 0, soh: 100, temp: 40, activePower: 0, energyGenerated: 100, faults: [], lastUpdated: '' }
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'SLR-RAJ-01')!;
      // Time is 12:00 UTC. Date uses UTC here for fake timers, or local time?
      // Math.random is 0.5, so 0.9 + 0.05 = 0.95
      // Base power = 100
      // 100 * intensity * 0.95 = 95
      expect(dev.telemetry.activePower).toBeCloseTo(95.0, 1);
    });

    it('should handle AI predictions risk recovery', () => {
      devices.push({
        id: 'BMS-ER-NCR-03', type: 'bms', status: 'online', name: 'BMS',
        model: 'B-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 50, current: 0, soc: 80, soh: 100, temp: 30, mosfetStatus: 'on', faults: [], lastUpdated: '' },
        aiPredictions: {
          rul: 1000,
          failureProbability: 20,
          healthRank: 80,
          cellRunawayRisk: true,
          mosfetRisk: true,
          chargerOverheatingRisk: false,
          anomaliesDetected: ['High temperature on cell #7']
        }
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'BMS-ER-NCR-03')!;
      const ai = dev.aiPredictions!;
      // Recovering state
      expect(ai.failureProbability).toBe(17.5); // 20 - 2.5
      expect(ai.healthRank).toBe(82); // 80 + 2
      expect(ai.rul).toBe(1050); // 1000 + 50
    });

    it('should handle AI predictions risk elevation due to faults', () => {
      devices.push({
        id: 'dev-ai-fault', type: 'bms', status: 'fault', name: 'BMS',
        model: 'B-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 50, current: 0, soc: 80, soh: 100, temp: 65, mosfetStatus: 'on', faults: [], lastUpdated: '' },
        aiPredictions: {
          rul: 1000,
          failureProbability: 20,
          healthRank: 80,
          cellRunawayRisk: false,
          mosfetRisk: false,
          chargerOverheatingRisk: false,
          anomaliesDetected: []
        }
      });

      simulateStep();

      const dev = devices.find(d => d.id === 'dev-ai-fault')!;
      const ai = dev.aiPredictions!;
      // Elevated risk state due to temp > 60
      expect(ai.failureProbability).toBe(21.5); // 20 + 1.5
      expect(ai.healthRank).toBe(78); // 80 - 2
      expect(ai.cellRunawayRisk).toBe(true);
      expect(ai.predictedFaultType).toBe('Thermal Runaway Risk');
      expect(ai.anomaliesDetected).toContain('High temperature on cell #7');
      expect(dev.telemetry.faults).toContain('BMS Thermal Cut-off');
      expect(dev.telemetry.mosfetStatus).toBe('off'); // critical temp shutoff
    });
  });

  describe('Grid Metrics simulation', () => {
    it('should update grid metrics correctly', () => {
      devices.push({
        id: 'SLR-RAJ-01', type: 'solar', status: 'online', name: 'Solar',
        model: 'S-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 650, current: 0, soc: 0, soh: 100, temp: 40, activePower: 50, faults: [], lastUpdated: '' }
      });
      devices.push({
        id: 'BES-IND-01', type: 'bess', status: 'online', name: 'BESS',
        model: 'B-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 410, current: 0, soc: 50, soh: 100, temp: 30, activePower: 20, faults: [], lastUpdated: '' }
      });
      devices.push({
        id: 'MTR-IND-01', type: 'meter', status: 'online', name: 'Meter',
        model: 'M-1', firmware: 'v1.0', owner: 'Test', location: { lat: 0, lng: 0, city: 'Test' },
        telemetry: { voltage: 415, current: 0, soc: 0, soh: 100, temp: 30, activePower: 150, faults: [], lastUpdated: '' }
      });

      gridMetrics.savingsINR = 100;
      gridMetrics.carbonOffset = 10;
      gridMetrics.peakLimit = 150;

      simulateStep();

      // Expected new active powers:
      // Solar (SLR-RAJ-01): 100 * 1 * 0.95 = 95
      // Meter (MTR-IND-01): 160 + sin(Date.now() / 30000) * 15 + Math.random() * 5
      // Date is noon Jan 1st 2024 -> 1704110400000 / 30000 = 56803680. sin(56803680) = -0.58... wait, it varies based on system time zone!
      // To be safe, just check they updated and gridImport is calculated right based on the NEW values.

      const newSolarPower = devices.find(d => d.id === 'SLR-RAJ-01')!.telemetry.activePower!;
      const newBessPower = devices.find(d => d.id === 'BES-IND-01')!.telemetry.activePower!;
      const newMeterPower = devices.find(d => d.id === 'MTR-IND-01')!.telemetry.activePower!;

      expect(gridMetrics.solarPower).toBe(newSolarPower);
      expect(gridMetrics.bessPower).toBe(newBessPower);
      expect(gridMetrics.industrialLoad).toBe(newMeterPower);

      const calculatedImport = Math.max(0, Number((newMeterPower - newSolarPower - newBessPower).toFixed(1)));
      expect(gridMetrics.gridImport).toBe(calculatedImport);
    });
  });
});
