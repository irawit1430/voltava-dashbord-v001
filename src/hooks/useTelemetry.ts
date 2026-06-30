import { useState, useEffect, useRef, useContext } from 'react';
import type { Device, GridMetrics, TelemetryHistoryPoint, Gateway } from '../types';
import { AuthContext } from '../contexts/AuthContext';

export function useTelemetry() {
  const authContext = useContext(AuthContext);
  const [devices, setDevices] = useState<Device[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [gridMetrics, setGridMetrics] = useState<GridMetrics>({
    solarPower: 0,
    bessPower: 0,
    gridImport: 0,
    industrialLoad: 0,
    gridVoltage: 415,
    gridFrequency: 50,
    powerFactor: 1.0,
    peakLimit: 150.0,
    savingsINR: 0,
    carbonOffset: 0,
    outageBackupPredict: 0,
    isGridDown: false,
  });

  const historyRef = useRef<Record<string, TelemetryHistoryPoint[]>>({});
  const wsRef = useRef<WebSocket | null>(null);

  // Authenticated fetch helper — adds Bearer token and handles 401
  const authFetch = (url: string, options?: RequestInit): Promise<Response> => {
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> || {}),
    };
    if (authContext?.token) {
      headers['Authorization'] = `Bearer ${authContext.token}`;
    }

    return fetch(url, { ...options, headers }).then(res => {
      if (res.status === 401) {
        authContext?.logout();
      }
      return res;
    });
  };

  // Fetch initial state & history from the REST API
  useEffect(() => {
    if (!authContext?.token) return;

    // 1. Fetch initial devices
    authFetch('/api/devices')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch devices');
        return res.json();
      })
      .then((data: Device[]) => {
        setDevices(data);
      })
      .catch(err => console.error('Error fetching devices:', err));

    // 2. Fetch initial grid metrics
    authFetch('/api/grid-metrics')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch grid metrics');
        return res.json();
      })
      .then((data: GridMetrics) => {
        setGridMetrics(data);
      })
      .catch(err => console.error('Error fetching grid metrics:', err));

    // 3. Fetch initial telemetry history mapping
    authFetch('/api/devices/history')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
      })
      .then((data: Record<string, TelemetryHistoryPoint[]>) => {
        historyRef.current = data;
      })
      .catch(err => console.error('Error fetching history:', err));

    // 4. Fetch initial gateways
    authFetch('/api/gateways')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch gateways');
        return res.json();
      })
      .then((data: Gateway[]) => {
        setGateways(data);
      })
      .catch(err => console.error('Error fetching gateways:', err));
  }, [authContext?.token]);

  // Establish real-time WebSocket connection
  useEffect(() => {
    if (!authContext?.token) return;

    let active = true;

    function connectWs() {
      if (!active) return;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsBase = window.location.port !== '' && window.location.port !== '5000'
        ? `${wsProtocol}//${window.location.hostname}:5000/ws`
        : `${wsProtocol}//${window.location.host}/ws`;
      const wsUrl = `${wsBase}?token=${authContext?.token}`;
      console.log(`Connecting to WebSocket at: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection opened successfully!');
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data.substring(0, 100));
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'TELEMETRY_UPDATE') {
            const { 
              devices: updatedDevices, 
              gridMetrics: updatedGridMetrics,
              gateways: updatedGateways
            } = message.data;
            setDevices(updatedDevices);
            setGridMetrics(updatedGridMetrics);
            if (updatedGateways) {
              setGateways(updatedGateways);
            }

            // Update local history cache in real-time
            updatedDevices.forEach((d: Device) => {
              const hist = historyRef.current[d.id] || [];
              const lastPoint = hist[hist.length - 1];
              const newTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const newPoint: TelemetryHistoryPoint = {
                timestamp: newTimestamp,
                voltage: d.telemetry.voltage,
                current: d.telemetry.current,
                soc: d.telemetry.soc || 0,
                temp: d.telemetry.temp,
                power: d.telemetry.activePower
              };

              // Avoid duplicates and limit history to the last 10 points
              if (!lastPoint || lastPoint.timestamp !== newTimestamp) {
                historyRef.current[d.id] = [...hist.slice(-9), newPoint];
              } else {
                historyRef.current[d.id] = [...hist.slice(0, -1), newPoint];
              }
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting in 3s...');
        wsRef.current = null;
        if (active) {
          setTimeout(connectWs, 3000);
        }
      };
    }

    connectWs();

    return () => {
      active = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [authContext?.token]);

  // Remote Actions
  const triggerOtaUpdate = (id: string) => {
    // Optimistic frontend update
    setDevices(prev => prev.map(d => {
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
    }));

    // Trigger on server
    authFetch(`/api/devices/${id}/ota`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to trigger OTA update');
        return res.json();
      })
      .catch(err => {
        console.error('Error triggering OTA update:', err);
        // Revert UI changes on error by fetching current devices list
        authFetch('/api/devices')
          .then(res => res.json())
          .then(data => setDevices(data));
      });
  };

  const toggleMosfet = (id: string) => {
    // Optimistic UI update
    setDevices(prev => prev.map(d => {
      if (d.id === id && d.telemetry.mosfetStatus) {
        const nextState = d.telemetry.mosfetStatus === 'on' ? 'off' : 'on';
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
    }));

    // Trigger on server
    authFetch(`/api/devices/${id}/toggle-mosfet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to toggle MOSFET');
        return res.json();
      })
      .catch(err => {
        console.error('Error toggling MOSFET:', err);
        // Revert UI changes on error by fetching current devices list
        authFetch('/api/devices')
          .then(res => res.json())
          .then(data => setDevices(data));
      });
  };

  const getDeviceHistory = (id: string) => {
    return historyRef.current[id] || [];
  };

  const toggleGateway = (id: string) => {
    // Optimistic state update
    setGateways(prev => prev.map(g => {
      if (g.id === id) {
        let nextStatus = g.status;
        if (g.status === 'online') nextStatus = 'offline';
        else if (g.status === 'offline') nextStatus = 'connecting';
        return { ...g, status: nextStatus };
      }
      return g;
    }));

    return authFetch(`/api/gateways/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to toggle gateway');
        return res.json();
      })
      .catch(err => {
        console.error('Error toggling gateway:', err);
        // revert by refetching
        authFetch('/api/gateways')
          .then(res => res.json())
          .then(data => setGateways(data));
      });
  };

  const updateGatewayConfig = (id: string, updatedData: any) => {
    // Optimistic update
    setGateways(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, ...updatedData };
      }
      return g;
    }));

    return authFetch(`/api/gateways/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error((errorData && errorData.error) || 'Failed to update gateway config');
        }
        return res.json();
      })
      .catch(err => {
        console.error('Error updating gateway config:', err);
        // revert
        authFetch('/api/gateways')
          .then(res => res.json())
          .then(data => setGateways(data));
        throw err;
      });
  };

  const addGateway = (newGwData: any) => {
    return authFetch('/api/gateways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGwData)
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error((errorData && errorData.error) || 'Failed to add gateway');
        }
        return res.json();
      })
      .then(newGw => {
        setGateways(prev => [...prev, newGw]);
        return newGw;
      })
      .catch(err => {
        console.error('Error adding gateway:', err);
        throw err;
      });
  };

  const pingGateway = (id: string): Promise<string> => {
    return authFetch(`/api/gateways/${id}/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to ping gateway');
        return res.json();
      })
      .then(data => data.output)
      .catch(err => {
        console.error('Error pinging gateway:', err);
        return `Error: Failed to ping gateway. ${err.message}`;
      });
  };

  const scanGatewayBus = (id: string): Promise<string> => {
    return authFetch(`/api/gateways/${id}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to scan gateway bus');
        return res.json();
      })
      .then(data => data.output)
      .catch(err => {
        console.error('Error scanning gateway bus:', err);
        return `Error: Failed to scan gateway. ${err.message}`;
      });
  };

  return {
    devices,
    gateways,
    gridMetrics,
    triggerOtaUpdate,
    toggleMosfet,
    getDeviceHistory,
    setGridMetrics,
    toggleGateway,
    updateGatewayConfig,
    addGateway,
    pingGateway,
    scanGatewayBus
  };
}
