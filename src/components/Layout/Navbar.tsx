import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MapPin,
  Wifi,
  User,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';

import type { Device } from '../../types';
import './Navbar.css';

export interface AppNotification {
  id: string;
  deviceId: string;
  deviceName: string;
  status: 'fault' | 'warning' | 'resolved';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousDevicesRef = useRef<Device[]>([]);

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const warningCount = devices.filter((d) => d.status === 'warning').length;
  const faultCount = devices.filter((d) => d.status === 'fault').length;

  // Sync devices changes to notifications
  useEffect(() => {
    const prevDevices = previousDevicesRef.current;

    if (prevDevices.length === 0 && devices.length > 0) {
      // Initial load, populate existing faults/warnings as notifications
      const initialAlerts = devices.filter(
        (d) => d.status === 'fault' || d.status === 'warning'
      );
      const initialNotifs: AppNotification[] = initialAlerts.map((device) => ({
        id: crypto.randomUUID(),
        deviceId: device.id,
        deviceName: device.name,
        status: device.status as 'fault' | 'warning',
        message:
          device.telemetry.faults && device.telemetry.faults.length > 0
            ? device.telemetry.faults.join(', ')
            : `Device is in ${device.status} state.`,
        timestamp: new Date(),
        isRead: false,
      }));
      setNotifications(initialNotifs);
    } else if (prevDevices.length > 0 && devices.length > 0) {
      // Compare state changes
      const newNotifications: AppNotification[] = [];

      devices.forEach((currentDevice) => {
        const prevDevice = prevDevices.find((d) => d.id === currentDevice.id);

        if (prevDevice) {
          // Check for new fault or warning
          if (
            (currentDevice.status === 'fault' ||
              currentDevice.status === 'warning') &&
            prevDevice.status !== 'fault' &&
            prevDevice.status !== 'warning'
          ) {
            newNotifications.push({
              id: crypto.randomUUID(),
              deviceId: currentDevice.id,
              deviceName: currentDevice.name,
              status: currentDevice.status as 'fault' | 'warning',
              message:
                currentDevice.telemetry.faults &&
                currentDevice.telemetry.faults.length > 0
                  ? currentDevice.telemetry.faults.join(', ')
                  : `Device entered ${currentDevice.status} state.`,
              timestamp: new Date(),
              isRead: false,
            });
          }
          // Check for resolution (was fault/warning, now online)
          else if (
            (prevDevice.status === 'fault' ||
              prevDevice.status === 'warning') &&
            currentDevice.status === 'online'
          ) {
            newNotifications.push({
              id: crypto.randomUUID(),
              deviceId: currentDevice.id,
              deviceName: currentDevice.name,
              status: 'resolved',
              message: `Device is back online and functioning normally.`,
              timestamp: new Date(),
              isRead: false,
            });
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev]);
      }
    }

    previousDevicesRef.current = devices;
  }, [devices]);

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

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown Panel */}
          {isOpen && (
            <div
              className="popover glass-panel notification-popover"
              role="dialog"
              aria-label="System Notifications"
            >
              <div className="popover-header">
                <h3 className="popover-title">System Notifications</h3>
                <div className="popover-actions">
                  {unreadCount > 0 && (
                    <button className="text-btn" onClick={handleMarkAllAsRead}>
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button className="text-btn" onClick={handleClearAll}>
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="popover-list" role="list">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon-wrap">
                      <span style={{ fontSize: '1.25rem' }}>✅</span>
                    </div>
                    <p className="empty-text">All systems operational</p>
                    <p className="empty-sub-text">
                      No active alerts or recent events.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isFault = notif.status === 'fault';
                    const isWarning = notif.status === 'warning';
                    const isResolved = notif.status === 'resolved';

                    return (
                      <div
                        key={notif.id}
                        className={`notification-item notification-item-hover ${
                          isFault
                            ? 'notification-item-fault'
                            : isWarning
                              ? 'notification-item-warning'
                              : 'notification-item-resolved'
                        } ${!notif.isRead ? 'notification-unread' : ''}`}
                        onClick={() => {
                          handleMarkAsRead(notif.id);
                          // Only open modal if it's an active device in the current list
                          const deviceToSelect = devices.find(
                            (d) => d.id === notif.deviceId
                          );
                          if (deviceToSelect) {
                            onSelectDevice(deviceToSelect);
                            setIsOpen(false);
                          }
                        }}
                        aria-label={`View details for ${notif.deviceName}`}
                        role="listitem"
                      >
                        <div className="notification-icon-wrap">
                          {isFault && (
                            <AlertTriangle
                              size={16}
                              color="var(--accent-red)"
                              className="animate-pulse"
                            />
                          )}
                          {isWarning && (
                            <AlertTriangle
                              size={16}
                              color="var(--accent-orange)"
                            />
                          )}
                          {isResolved && (
                            <CheckCircle2
                              size={16}
                              color="var(--accent-green)"
                            />
                          )}
                        </div>
                        <div className="notification-content">
                          <div className="notification-meta">
                            <span className="device-name">
                              {notif.deviceName}
                            </span>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <span
                                className={`badge ${
                                  isFault
                                    ? 'badge-fault'
                                    : isWarning
                                      ? 'badge-warning'
                                      : 'badge-online'
                                } inline-badge`}
                              >
                                {notif.status}
                              </span>
                              {!notif.isRead && <div className="unread-dot" />}
                            </div>
                          </div>
                          <p className="device-fault-msg">{notif.message}</p>
                          <div className="notification-footer">
                            <span className="device-id-text">
                              {notif.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              • {notif.deviceId.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                        <button
                          className="dismiss-btn"
                          onClick={(e) => handleDismiss(notif.id, e)}
                          aria-label="Dismiss notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
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
