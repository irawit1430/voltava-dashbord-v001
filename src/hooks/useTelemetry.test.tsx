import { renderHook, waitFor } from '@testing-library/react';
import { useTelemetry } from './useTelemetry';
import { AuthContext } from '../contexts/AuthContext';

describe('useTelemetry Hook', () => {
  const mockDevices = [{ id: 'dev-1', name: 'Device 1' }];
  const mockGridMetrics = { totalLoad: 100, gridFreq: 50 };
  const mockGateways = [{ id: 'gw-1', name: 'Gateway 1' }];
  const mockHistory = { 'dev-1': [{ timestamp: '12:00', voltage: 12 }] };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global fetch
    global.fetch = vi.fn((url) => {
      if (url === '/api/devices') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDevices)
        });
      }
      if (url === '/api/grid-metrics') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGridMetrics)
        });
      }
      if (url === '/api/devices/history') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHistory)
        });
      }
      if (url === '/api/gateways') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGateways)
        });
      }
      return Promise.reject(new Error('not found'));
    }) as any;

    // Mock WebSocket correctly as a constructor
    global.WebSocket = class {
      onopen = vi.fn();
      onmessage = vi.fn();
      onerror = vi.fn();
      onclose = vi.fn();
      close = vi.fn();
      constructor(_url: string) {
        // Mock constructor logic if needed
      }
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches initial data on mount', async () => {
    const wrapper = ({ children }: any) => (
      <AuthContext.Provider value={{
        user: null,
        token: 'mock-token-xyz',
        isLoading: false,
        error: null,
        login: vi.fn(),
        loginBypass: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn()
      }}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useTelemetry(), { wrapper });

    // Wait for the fetch promises to resolve and state to update
    await waitFor(() => {
      expect(result.current.devices).toEqual(mockDevices);
    });
    await waitFor(() => {
      expect(result.current.gateways).toEqual(mockGateways);
    });
    await waitFor(() => {
      expect(result.current.gridMetrics).toEqual(mockGridMetrics);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/devices', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('/api/grid-metrics', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('/api/devices/history', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('/api/gateways', expect.any(Object));
  });
});
