import { render, screen, fireEvent } from '@testing-library/react';
import DeviceList from './DeviceList';
import type { Device } from '../../types';

describe('DeviceList Component', () => {
  const mockDevices: Device[] = [
    {
      id: 'dev-1',
      name: 'Smart BMS Alpha',
      model: 'BMS-100',
      firmware: 'v1.0',
      type: 'bms',
      status: 'online',
      owner: 'Voltava',
      location: { lat: 0, lng: 0, city: 'Delhi' },
      telemetry: {
        voltage: 48,
        current: 10,
        temp: 35,
        soc: 80,
        soh: 100,
        lastUpdated: '12:00',
        faults: [],
      },
    },
    {
      id: 'dev-2',
      name: 'Solar Inverter Beta',
      model: 'SOL-500',
      firmware: 'v1.0',
      type: 'solar',
      status: 'warning',
      owner: 'EcoPower',
      location: { lat: 0, lng: 0, city: 'Mumbai' },
      telemetry: {
        voltage: 220,
        current: 15,
        temp: 50,
        activePower: 3.3,
        soc: 0,
        soh: 100,
        lastUpdated: '12:00',
        faults: ['Overvoltage Warning'],
      },
    },
    {
      id: 'dev-3',
      name: 'BESS Controller Gamma',
      model: 'BES-1000',
      firmware: 'v1.0',
      type: 'bess',
      status: 'fault',
      owner: 'Voltava',
      location: { lat: 0, lng: 0, city: 'Delhi' },
      telemetry: {
        voltage: 400,
        current: 0,
        temp: 75,
        activePower: 0,
        soc: 20,
        soh: 95,
        lastUpdated: '12:00',
        faults: ['Thermal Runaway Protocol'],
      },
    },
  ];

  const mockOnSelectDevice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders device table with all devices initially', () => {
    render(
      <DeviceList devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    expect(screen.getByText('Smart BMS Alpha')).toBeInTheDocument();
    expect(screen.getByText('Solar Inverter Beta')).toBeInTheDocument();
    expect(screen.getByText('BESS Controller Gamma')).toBeInTheDocument();

    expect(
      screen.getByText('Found 3 matching energy assets')
    ).toBeInTheDocument();
  });

  it('filters devices by search term', () => {
    render(
      <DeviceList devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    const searchInput = screen.getByPlaceholderText(
      /Search by ID, name, owner.../i
    );
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    expect(screen.getByText('Smart BMS Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Solar Inverter Beta')).not.toBeInTheDocument();
    expect(
      screen.getByText('Found 1 matching energy assets')
    ).toBeInTheDocument();
  });

  it('filters devices by type', () => {
    render(
      <DeviceList devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    const typeSelect = screen.getAllByRole('combobox')[0]; // First select is for type
    fireEvent.change(typeSelect, { target: { value: 'solar' } });

    expect(screen.queryByText('Smart BMS Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('Solar Inverter Beta')).toBeInTheDocument();
  });

  it('filters devices by status', () => {
    render(
      <DeviceList devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    const statusSelect = screen.getAllByRole('combobox')[1]; // Second select is for status
    fireEvent.change(statusSelect, { target: { value: 'fault' } });

    expect(screen.queryByText('Smart BMS Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('BESS Controller Gamma')).toBeInTheDocument();
  });

  it('calls onSelectDevice when Inspect button is clicked', () => {
    render(
      <DeviceList devices={mockDevices} onSelectDevice={mockOnSelectDevice} />
    );

    const inspectButtons = screen.getAllByRole('button', { name: /inspect/i });
    fireEvent.click(inspectButtons[0]); // Click first device inspect

    expect(mockOnSelectDevice).toHaveBeenCalledWith(mockDevices[0]);
  });
});
