import { render, screen, fireEvent } from '@testing-library/react';
import GatewayConfig from './GatewayConfig';
import type { Gateway, Device } from '../../types';

describe('GatewayConfig Component', () => {
  const mockDevices: Device[] = [
    {
      id: 'dev-1',
      name: 'Device 1',
      model: 'Model A',
      firmware: 'v1.0',
      type: 'bms',
      status: 'online',
      owner: 'O1',
      location: { lat: 0, lng: 0, city: 'C1' },
      telemetry: {
        voltage: 12,
        current: 1,
        temp: 25,
        soc: 100,
        soh: 100,
        lastUpdated: '12:00',
        faults: [],
      },
    },
  ];

  const mockGateways: Gateway[] = [
    {
      id: 'gw-1',
      name: 'Main Factory Gateway',
      status: 'online',
      protocol: 'modbus-tcp',
      connectionType: 'tcp',
      ipAddress: '192.168.1.100',
      port: 502,
      pollingInterval: 5,
      connectedDevices: ['dev-1'],
      lastSync: '12:00',
      packetsTransmitted: 100,
      packetsFailed: 0,
    },
    {
      id: 'gw-2',
      name: 'Solar Array Gateway',
      status: 'offline',
      protocol: 'modbus-rtu',
      connectionType: 'serial',
      serialPort: '/dev/ttyUSB0',
      baudRate: 9600,
      pollingInterval: 10,
      connectedDevices: [],
      lastSync: '12:00',
      packetsTransmitted: 100,
      packetsFailed: 0,
    },
  ];

  const mockHooks = {
    onToggleGateway: vi.fn().mockResolvedValue(true),
    onUpdateConfig: vi.fn().mockResolvedValue(true),
    onAddGateway: vi.fn().mockResolvedValue(true),
    onPing: vi.fn().mockResolvedValue('Ping success'),
    onScan: vi.fn().mockResolvedValue('Scan success'),
    toggleGateway: vi.fn().mockResolvedValue(true),
    updateGatewayConfig: vi.fn().mockResolvedValue(true),
    addGateway: vi.fn().mockResolvedValue(true),
    pingGateway: vi.fn().mockResolvedValue('Ping success'),
    scanGatewayBus: vi.fn().mockResolvedValue('Scan success'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gateway list', () => {
    render(
      <GatewayConfig
        gateways={mockGateways}
        devices={mockDevices}
        {...mockHooks}
      />
    );

    expect(screen.getAllByText('Main Factory Gateway')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Solar Array Gateway')[0]).toBeInTheDocument();
  });

  it('shows gateway details when selected', () => {
    render(
      <GatewayConfig
        gateways={mockGateways}
        devices={mockDevices}
        {...mockHooks}
      />
    );

    // Select the first gateway
    fireEvent.click(screen.getAllByText('Main Factory Gateway')[0]);

    // Check if details are shown
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('502')).toBeInTheDocument();
    expect(screen.getAllByText('Modbus TCP')[0]).toBeInTheDocument();

    // Check if connected device is shown
    expect(screen.getByText('Device 1')).toBeInTheDocument();
  });
});
