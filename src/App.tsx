import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import DashboardHome from './components/DashboardHome/DashboardHome';
import DeviceList from './components/DeviceRegistry/DeviceList';
import DeviceDetailModal from './components/DeviceDetailModal';
import FleetOverview from './components/FleetIntelligence/FleetOverview';
import GridOverview from './components/GridESS/GridOverview';
import CostSavingsSimulator from './components/Simulator/CostSavingsSimulator';
import HealthPredictor from './components/AIBrain/HealthPredictor';
import GatewayConfig from './components/GatewayConfig/GatewayConfig';
import AccessControl from './components/Auth/AccessControl';
import { useTelemetry } from './hooks/useTelemetry';
import type { Device } from './types';

function App() {
  const { user, isLoading } = useAuth();

  // Force new build hash to bypass CDN cache
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Invoke our telemetry simulation engine
  const { 
    devices, 
    gateways,
    gridMetrics, 
    triggerOtaUpdate, 
    toggleMosfet, 
    getDeviceHistory,
    toggleGateway,
    updateGatewayConfig,
    addGateway,
    pingGateway,
    scanGatewayBus
  } = useTelemetry();

  // Find dynamic version of selected device for real-time modal updates
  const activeSelectedDevice = selectedDevice 
    ? devices.find(d => d.id === selectedDevice.id) || selectedDevice 
    : null;

  // Auth loading state
  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" />
        <span className="app-loading-text">Initializing Voltava EIP…</span>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Navbar */}
        <Navbar 
          activeTab={activeTab} 
          devices={devices} 
          onSelectDevice={(device) => setSelectedDevice(device)} 
        />

        {/* Tab Routing Body */}
        <div className="content-body">
          {activeTab === 'overview' && (
            <DashboardHome 
              devices={devices} 
              gridMetrics={gridMetrics} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'devices' && (
            <DeviceList 
              devices={devices} 
              onSelectDevice={(device) => setSelectedDevice(device)} 
            />
          )}

          {activeTab === 'fleet' && (
            <FleetOverview 
              devices={devices} 
              onInspectDevice={(device) => setSelectedDevice(device)} 
            />
          )}

          {activeTab === 'grid' && (
            <GridOverview gridMetrics={gridMetrics} />
          )}

          {activeTab === 'simulator' && (
            <CostSavingsSimulator />
          )}

          {activeTab === 'ai' && (
            <HealthPredictor 
              devices={devices} 
              onInspectDevice={(device) => setSelectedDevice(device)} 
            />
          )}

          {activeTab === 'gateway-config' && (
            <GatewayConfig 
              gateways={gateways}
              devices={devices}
              toggleGateway={toggleGateway}
              updateGatewayConfig={updateGatewayConfig}
              addGateway={addGateway}
              pingGateway={pingGateway}
              scanGatewayBus={scanGatewayBus}
            />
          )}

          {activeTab === 'access-control' && (
            <AccessControl />
          )}
        </div>
      </main>

      {/* Realtime Inspector Overlay */}
      {activeSelectedDevice && (
        <DeviceDetailModal
          device={activeSelectedDevice}
          history={getDeviceHistory(activeSelectedDevice.id)}
          onClose={() => setSelectedDevice(null)}
          onTriggerOta={triggerOtaUpdate}
          onToggleMosfet={toggleMosfet}
          onPingGateway={pingGateway}
        />
      )}
    </div>
  );
}

export default App;
