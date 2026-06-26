import React, { useState, useEffect, useRef } from 'react';
import { Bell, MapPin, Wifi, User, AlertTriangle } from 'lucide-react';
import type { Device } from '../../types';
import './Navbar.css';

interface NavbarProps {
  activeTab: string;
  devices: Device[];
  onSelectDevice: (device: Device) => void;
}

export default function Navbar({
  activeTab,
  devices,
  onSelectDevice,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const warningCount = devices.filter((d) => d.status === 'warning').length;
  const faultCount = devices.filter((d) => d.status === 'fault').length;

  const warningDevices = devices.filter((d) => d.status === 'warning');
  const faultDevices = devices.filter((d) => d.status === 'fault');
  const alertDevices = [...faultDevices, ...warningDevices];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Executive Overview';
      case 'devices':
        return 'Device Registry';
      case 'fleet':
        return 'Voltava EIP Mobility';
      case 'grid':
        return 'Grid & Solar Intelligence';
      case 'simulator':
        return 'BESS Optimization Simulator';
      case 'ai':
        return 'AI Predictive Energy Brain';
      case 'gateway-config':
        return 'Gateway Configuration';
      default:
        return 'Voltava EIP';
    }
  };

  return (
    <header className="navbar glass-panel">
      {/* Title */}
      <div>
        <h2 className="page-title">{getPageTitle()}</h2>
        <p className="subtitle">India National Energy Asset Operations</p>
      </div>

      {/* Center Metrics (Status Badges) */}
      <div className="navbar-metrics">
        <div className="status-group">
          <div className="pulse-dot online" />
          <span className="status-label">{onlineCount} Online</span>
        </div>

        {warningCount > 0 && (
          <div className="status-group">
            <AlertTriangle size={14} color="var(--accent-orange)" />
            <span className="status-label status-label-warning">
              {warningCount} Alert{warningCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {faultCount > 0 && (
          <div className="status-group">
            <AlertTriangle
              size={14}
              color="var(--accent-red)"
              className="animate-pulse"
            />
            <span className="status-label status-label-fault">
              {faultCount} Fault{faultCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="divider" />

        <div className="mqtt-status">
          <Wifi size={14} color="#10b981" />
          <span className="mqtt-label">MQTT: Connected</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="right-controls">
        {/* Command Center Selector */}
        <div className="location-badge">
          <MapPin size={14} color="var(--accent-blue)" />
          <span className="location-text">NCR HQ, India</span>
        </div>

        {/* Notifications */}
        <div
          style={{ position: 'relative' }}
          ref={dropdownRef}
          onKeyDown={handleKeyDown}
        >
          <button
            className={`navbar-btn ${isOpen ? 'active' : ''}`}
            aria-label="View notifications"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            <Bell
              size={18}
              color={isOpen ? 'var(--text-primary)' : 'var(--text-secondary)'}
            />
            {alertDevices.length > 0 && (
              <span className="notification-badge">{alertDevices.length}</span>
            )}
          </button>

          {/* Popover Dropdown Panel */}
          {isOpen && (
            <div
              className="popover glass-panel"
              role="dialog"
              aria-label="System Notifications"
            >
              <div className="popover-header">
                <h3 className="popover-title">System Notifications</h3>
                {alertDevices.length > 0 && (
                  <span className="popover-badge-count">
                    {alertDevices.length} Alert
                    {alertDevices.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="popover-list" role="list">
                {alertDevices.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon-wrap">
                      <span style={{ fontSize: '1.25rem' }}>✅</span>
                    </div>
                    <p className="empty-text">All systems operational</p>
                    <p className="empty-sub-text">
                      No active alerts or hardware faults detected.
                    </p>
                  </div>
                ) : (
                  alertDevices.map((device) => {
                    const isFault = device.status === 'fault';
                    return (
                      <button
                        key={device.id}
                        className={`notification-item notification-item-hover ${isFault ? 'notification-item-fault' : 'notification-item-warning'}`}
                        onClick={() => {
                          onSelectDevice(device);
                          setIsOpen(false);
                        }}
                        aria-label={`View details for ${device.name}`}
                        role="listitem"
                      >
                        <div className="notification-icon-wrap">
                          <AlertTriangle
                            size={16}
                            color={
                              isFault
                                ? 'var(--accent-red)'
                                : 'var(--accent-orange)'
                            }
                            className={isFault ? 'animate-pulse' : ''}
                          />
                        </div>
                        <div className="notification-content">
                          <div className="notification-meta">
                            <span className="device-name">{device.name}</span>
                            <span
                              className={`badge ${isFault ? 'badge-fault' : 'badge-warning'} inline-badge`}
                            >
                              {device.status}
                            </span>
                          </div>
                          <p className="device-fault-msg">
                            {device.telemetry.faults &&
                            device.telemetry.faults.length > 0
                              ? device.telemetry.faults.join(', ')
                              : `Device is in ${device.status} state.`}
                          </p>
                          <span className="device-id-text">
                            {device.id} • NCR HQ
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {alertDevices.length > 0 && (
                <div className="popover-footer">
                  Click on an alert to inspect in Realtime Overlay
                </div>
              )}
            </div>
          )}
        </div>

        <div className="divider" />

        {/* User profile */}
        <div className="profile">
          <div className="avatar">
            <User size={16} color="#060913" />
          </div>
          <div className="navbar-profile-text">
            <span className="user-name">Anurag Tiwari</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
