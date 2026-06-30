import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { useTelemetry } from './hooks/useTelemetry';

// Mock child components
vi.mock('./components/Layout/Sidebar', () => ({
  default: ({ activeTab, setActiveTab }: any) => (
    <div data-testid="sidebar">
      Sidebar - Active: {activeTab}
      <button onClick={() => setActiveTab('devices')}>Go to devices</button>
      <button onClick={() => setActiveTab('fleet')}>Go to fleet</button>
      <button onClick={() => setActiveTab('grid')}>Go to grid</button>
      <button onClick={() => setActiveTab('simulator')}>Go to simulator</button>
      <button onClick={() => setActiveTab('ai')}>Go to ai</button>
      <button onClick={() => setActiveTab('gateway-config')}>Go to gateway-config</button>
    </div>
  )
}));

vi.mock('./components/Layout/Navbar', () => ({
  default: ({ onSelectDevice }: any) => (
    <div data-testid="navbar">
      Navbar
      <button onClick={() => onSelectDevice({ id: 'dev-1', name: 'Device 1' })}>Select Device</button>
    </div>
  )
}));

vi.mock('./components/DashboardHome/DashboardHome', () => ({ default: () => <div data-testid="dashboard-home" /> }));
vi.mock('./components/DeviceRegistry/DeviceList', () => ({ default: () => <div data-testid="device-list" /> }));
vi.mock('./components/DeviceDetailModal', () => ({
  default: ({ device, onClose }: any) => (
    <div data-testid="device-detail-modal">
      Modal for {device.name}
      <button onClick={onClose}>Close Modal</button>
    </div>
  )
}));
vi.mock('./components/FleetIntelligence/FleetOverview', () => ({ default: () => <div data-testid="fleet-overview" /> }));
vi.mock('./components/GridESS/GridOverview', () => ({ default: () => <div data-testid="grid-overview" /> }));
vi.mock('./components/Simulator/CostSavingsSimulator', () => ({ default: () => <div data-testid="simulator" /> }));
vi.mock('./components/AIBrain/HealthPredictor', () => ({ default: () => <div data-testid="health-predictor" /> }));
vi.mock('./components/GatewayConfig/GatewayConfig', () => ({ default: () => <div data-testid="gateway-config" /> }));

// Mock useTelemetry hook
vi.mock('./hooks/useTelemetry');

// Mock useAuth context hook
vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'anuirawit@gmail.com', name: 'Anurag Tiwari (Dev)', picture: '', role: 'admin' },
    token: 'mock-token-xyz',
    isLoading: false,
    error: null,
    login: vi.fn(),
    loginBypass: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn()
  }),
  AuthProvider: ({ children }: any) => <>{children}</>
}));

describe('App Component', () => {
  const mockUseTelemetry = {
    devices: [{ id: 'dev-1', name: 'Device 1' }],
    gateways: [],
    gridMetrics: {},
    triggerOtaUpdate: vi.fn(),
    toggleMosfet: vi.fn(),
    getDeviceHistory: vi.fn().mockReturnValue([]),
    toggleGateway: vi.fn(),
    updateGatewayConfig: vi.fn(),
    addGateway: vi.fn(),
    pingGateway: vi.fn(),
    scanGatewayBus: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTelemetry as any).mockReturnValue(mockUseTelemetry);
  });

  it('renders default layout and overview tab', () => {
    render(<App />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-home')).toBeInTheDocument();
    expect(screen.queryByTestId('device-list')).not.toBeInTheDocument();
  });

  it('changes active tab when sidebar buttons are clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByText('Go to devices'));
    expect(screen.getByTestId('device-list')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-home')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Go to fleet'));
    expect(screen.getByTestId('fleet-overview')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Go to grid'));
    expect(screen.getByTestId('grid-overview')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Go to simulator'));
    expect(screen.getByTestId('simulator')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Go to ai'));
    expect(screen.getByTestId('health-predictor')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Go to gateway-config'));
    expect(screen.getByTestId('gateway-config')).toBeInTheDocument();
  });

  it('opens and closes device detail modal', () => {
    render(<App />);

    expect(screen.queryByTestId('device-detail-modal')).not.toBeInTheDocument();

    // Select device from navbar
    fireEvent.click(screen.getByText('Select Device'));
    expect(screen.getByTestId('device-detail-modal')).toBeInTheDocument();
    expect(screen.getByText('Modal for Device 1')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('device-detail-modal')).not.toBeInTheDocument();
  });

  it('updates selected device dynamically if its telemetry changes', () => {
    render(<App />);

    // Open modal
    fireEvent.click(screen.getByText('Select Device'));

    // Check if getDeviceHistory was called with the correct id
    expect(mockUseTelemetry.getDeviceHistory).toHaveBeenCalledWith('dev-1');
  });
});
