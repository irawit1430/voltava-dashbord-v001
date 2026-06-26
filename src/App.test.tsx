import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';
import { useTelemetry } from './hooks/useTelemetry';

// Mock the hook
vi.mock('./hooks/useTelemetry');

describe('App Component', () => {
  const mockDevices = [
    {
      id: 'dev-1',
      name: 'Test Device 1',
      type: 'bms',
      status: 'online',
      model: 'Model X',
      firmware: '1.0.0',
      location: { lat: 0, lng: 0, city: 'Test City' },
      owner: 'Test Owner',
      telemetry: {
        voltage: 12,
        current: 5,
        soc: 100,
        soh: 100,
        temp: 25,
        faults: [],
        lastUpdated: new Date().toISOString()
      }
    }
  ];

  const mockGateways = [];

  const mockGridMetrics = {
    solarPower: 10,
    bessPower: 5,
    gridImport: 2,
    industrialLoad: 15,
    gridVoltage: 220,
    gridFrequency: 50,
    powerFactor: 0.99,
    peakLimit: 100,
    savingsINR: 1000,
    carbonOffset: 50,
    outageBackupPredict: 120,
    isGridDown: false,
  };

  const mockUseTelemetry = {
    devices: mockDevices,
    gateways: mockGateways,
    gridMetrics: mockGridMetrics,
    triggerOtaUpdate: vi.fn(),
    toggleMosfet: vi.fn(),
    getDeviceHistory: vi.fn().mockReturnValue([]),
    toggleGateway: vi.fn(),
    updateGatewayConfig: vi.fn(),
    addGateway: vi.fn(),
    pingGateway: vi.fn(),
    scanGatewayBus: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useTelemetry).mockReturnValue(mockUseTelemetry as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Sidebar, Navbar, and default Overview tab', () => {
    render(<App />);

    // Sidebar brand
    expect(screen.getByText('VOLTAVA')).toBeInTheDocument();

    // Navbar default title for overview
    expect(screen.getByText('Executive Overview')).toBeInTheDocument();
  });

  it('navigates to Device Registry tab when clicked', () => {
    render(<App />);

    // Find sidebar button
    const deviceRegistryBtn = screen.getByText('Device Registry').closest('button');
    if (deviceRegistryBtn) {
      fireEvent.click(deviceRegistryBtn);
    }

    // The main heading should change
    expect(screen.getByRole('heading', { name: 'Device Registry' })).toBeInTheDocument();
  });

  it('navigates to Fleet Mobility tab when clicked', () => {
    render(<App />);

    const fleetBtn = screen.getByText('Fleet Mobility').closest('button');
    if (fleetBtn) {
      fireEvent.click(fleetBtn);
    }

    expect(screen.getByRole('heading', { name: 'Voltava EIP Mobility' })).toBeInTheDocument();
  });

  it('navigates to Gateway Config tab when clicked', () => {
    render(<App />);

    const gatewayBtn = screen.getByText('Gateway Config').closest('button');
    if (gatewayBtn) {
      fireEvent.click(gatewayBtn);
    }

    expect(screen.getByRole('heading', { name: 'Gateway Configuration' })).toBeInTheDocument();
  });

  it('opens and closes DeviceDetailModal when a device is selected and dismissed', () => {
    render(<App />);

    // Navigate to Device Registry
    const deviceRegistryBtn = screen.getByText('Device Registry').closest('button');
    if (deviceRegistryBtn) fireEvent.click(deviceRegistryBtn);

    // Check if device is in the list
    expect(screen.getByText('Test Device 1')).toBeInTheDocument();

    // Click on Inspect button for the device
    const inspectBtn = screen.getByText(/Inspect/i).closest('button');
    if (inspectBtn) {
      fireEvent.click(inspectBtn);
    }

    // Modal should appear
    expect(screen.getByRole('heading', { name: 'Test Device 1' })).toBeInTheDocument();

    // Close the modal
    // Find by X icon or similar if class is not modal-close
    const buttons = Array.from(document.querySelectorAll('button'));
    const modalBtn = buttons.find(b => b.querySelector('.lucide-x'));
    if (modalBtn) fireEvent.click(modalBtn);

    // Check for modal not to be in document using queryByRole
    // If there are multiple Device 1s (one in list, one in modal), we check if the heading for the modal is gone
    expect(screen.queryByRole('heading', { name: 'Test Device 1' })).not.toBeInTheDocument();
  });
});
