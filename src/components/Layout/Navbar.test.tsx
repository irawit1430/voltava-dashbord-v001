import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import type { Device } from '../../types';

describe('Navbar Component', () => {
  const mockDevices: Device[] = [
    {
      id: 'dev-1',
      name: 'Device 1',
      model: 'Model A', firmware: 'v1.0',
      type: 'bms',
      status: 'online',
      owner: 'Owner A',
      location: { lat: 0, lng: 0, city: 'City A' },
      telemetry: { voltage: 12, current: 1, temp: 25, soc: 100, soh: 100, lastUpdated: '12:00', faults: [] }
    },
    {
      id: 'dev-2',
      name: 'Device 2',
      model: 'Model B', firmware: 'v1.0',
      type: 'bms',
      status: 'warning',
      owner: 'Owner B',
      location: { lat: 0, lng: 0, city: 'City B' },
      telemetry: { voltage: 12, current: 1, temp: 45, soc: 80, soh: 95, lastUpdated: '12:00', faults: ['High Temp Warning'] }
    },
    {
      id: 'dev-3',
      name: 'Device 3',
      model: 'Model C', firmware: 'v1.0',
      type: 'solar',
      status: 'fault',
      owner: 'Owner C',
      location: { lat: 0, lng: 0, city: 'City C' },
      telemetry: { voltage: 0, current: 0, temp: 65, activePower: 0, soc: 0, soh: 100, lastUpdated: '12:00', faults: ['Inverter Failure'] }
    }
  ];

  const mockOnSelectDevice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct page title based on activeTab', () => {
    const { rerender } = render(
      <Navbar activeTab="overview" devices={[]} onSelectDevice={mockOnSelectDevice} />
    );
    expect(screen.getByText('Executive Overview')).toBeInTheDocument();

    rerender(<Navbar activeTab="devices" devices={[]} onSelectDevice={mockOnSelectDevice} />);
    expect(screen.getByText('Device Registry')).toBeInTheDocument();
  });

  it('displays correct status counts', () => {
    render(
      <Navbar activeTab="overview" devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    expect(screen.getByText('1 Online')).toBeInTheDocument();
    expect(screen.getByText('1 Alert')).toBeInTheDocument();
    expect(screen.getByText('1 Fault')).toBeInTheDocument();
  });

  it('opens notifications dropdown when bell icon is clicked', () => {
    render(
      <Navbar activeTab="overview" devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    const bellButton = screen.getByRole('button', { name: /view notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByRole('dialog', { name: /system notifications/i })).toBeInTheDocument();
    expect(screen.getByText('System Notifications')).toBeInTheDocument();
  });

  it('calls onSelectDevice when a notification is clicked', () => {
    render(
      <Navbar activeTab="overview" devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    const bellButton = screen.getByRole('button', { name: /view notifications/i });
    fireEvent.click(bellButton);

    const faultNotification = screen.getByRole('listitem', { name: /view details for device 3/i });
    fireEvent.click(faultNotification);

    expect(mockOnSelectDevice).toHaveBeenCalledWith(mockDevices[2]);

    // Dropdown should close after selecting a device
    expect(screen.queryByRole('dialog', { name: /system notifications/i })).not.toBeInTheDocument();
  });
});
