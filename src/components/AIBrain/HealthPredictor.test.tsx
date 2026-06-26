import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HealthPredictor from './HealthPredictor';
import type { Device } from '../../types';

describe('HealthPredictor Component', () => {
  const mockDevices: Device[] = [
    {
      id: 'dev-1',
      name: 'Healthy Device',
      model: 'MOD-1', firmware: 'v1', type: 'bms', status: 'online', owner: 'Owner 1',
      location: { lat: 0, lng: 0, city: 'City' },
      telemetry: { voltage: 48, current: 10, temp: 35, soc: 80, soh: 100, lastUpdated: '12:00', faults: [] },
      aiPredictions: {
        rul: 5000,
        failureProbability: 5,
        healthRank: 95,
        cellRunawayRisk: false,
        mosfetRisk: false,
        chargerOverheatingRisk: false,
        anomaliesDetected: []
      }
    },
    {
      id: 'dev-2',
      name: 'MOSFET Risk Device',
      model: 'MOD-2', firmware: 'v1', type: 'bms', status: 'warning', owner: 'Owner 2',
      location: { lat: 0, lng: 0, city: 'City' },
      telemetry: { voltage: 48, current: 10, temp: 35, soc: 80, soh: 100, lastUpdated: '12:00', faults: [] },
      aiPredictions: {
        rul: 2000,
        failureProbability: 25,
        healthRank: 60,
        cellRunawayRisk: false,
        mosfetRisk: true,
        chargerOverheatingRisk: false,
        anomaliesDetected: []
      }
    },
    {
      id: 'dev-3',
      name: 'Cell Runaway Device',
      model: 'MOD-3', firmware: 'v1', type: 'bms', status: 'fault', owner: 'Owner 3',
      location: { lat: 0, lng: 0, city: 'City' },
      telemetry: { voltage: 48, current: 10, temp: 35, soc: 80, soh: 100, lastUpdated: '12:00', faults: [] },
      aiPredictions: {
        rul: 100,
        failureProbability: 85,
        healthRank: 20,
        cellRunawayRisk: true,
        mosfetRisk: false,
        chargerOverheatingRisk: false,
        anomaliesDetected: []
      }
    },
    {
      id: 'dev-4',
      name: 'No AI Device',
      model: 'MOD-4', firmware: 'v1', type: 'bms', status: 'online', owner: 'Owner 4',
      location: { lat: 0, lng: 0, city: 'City' },
      telemetry: { voltage: 48, current: 10, temp: 35, soc: 80, soh: 100, lastUpdated: '12:00', faults: [] },
      // No aiPredictions
    }
  ];

  const mockOnInspectDevice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard banner', () => {
    render(<HealthPredictor devices={[]} onInspectDevice={mockOnInspectDevice} />);
    expect(screen.getByText('Voltava AI Energy Brain Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Runs continuous neural network inference on raw IoT telemetry packets/i)).toBeInTheDocument();
  });

  it('renders AI inference logs timeline', () => {
    render(<HealthPredictor devices={[]} onInspectDevice={mockOnInspectDevice} />);
    expect(screen.getByText('AI Inference Logs')).toBeInTheDocument();
    expect(screen.getByText('NCR Express Loader 03')).toBeInTheDocument();
    expect(screen.getByText('Thermal Anomaly')).toBeInTheDocument();
  });

  it('only renders devices that have AI predictions', () => {
    render(<HealthPredictor devices={mockDevices} onInspectDevice={mockOnInspectDevice} />);

    expect(screen.getByText('Healthy Device')).toBeInTheDocument();
    expect(screen.getByText('MOSFET Risk Device')).toBeInTheDocument();
    expect(screen.getByText('Cell Runaway Device')).toBeInTheDocument();

    expect(screen.queryByText('No AI Device')).not.toBeInTheDocument();
  });

  it('displays the correct health flags for each device', () => {
    render(<HealthPredictor devices={mockDevices} onInspectDevice={mockOnInspectDevice} />);

    // Healthy device
    expect(screen.getByText('✓ Healthy')).toBeInTheDocument();

    // MOSFET risk device
    expect(screen.getByText('⚡ MOSFET Warning')).toBeInTheDocument();

    // Cell runaway device
    expect(screen.getByText('🔥 Cell Runaway')).toBeInTheDocument();
  });

  it('displays correct failure probabilities', () => {
    render(<HealthPredictor devices={mockDevices} onInspectDevice={mockOnInspectDevice} />);

    expect(screen.getByText('5.0%')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
  });

  it('calls onInspectDevice when an inspect button is clicked', () => {
    render(<HealthPredictor devices={mockDevices} onInspectDevice={mockOnInspectDevice} />);

    const inspectButtons = screen.getAllByRole('button', { name: /inspect/i });
    expect(inspectButtons).toHaveLength(3);

    fireEvent.click(inspectButtons[0]);
    expect(mockOnInspectDevice).toHaveBeenCalledWith(mockDevices[0]);

    fireEvent.click(inspectButtons[1]);
    expect(mockOnInspectDevice).toHaveBeenCalledWith(mockDevices[1]);
  });
});
