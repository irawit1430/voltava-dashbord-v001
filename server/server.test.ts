import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from './server';
import { devices } from './simulator';
import type { Device } from './types';

describe('Server API', () => {
  describe('POST /api/devices/:id/toggle-mosfet', () => {
    let originalDevices: Device[];

    beforeEach(() => {
      // Create a shallow copy of original devices to restore after test
      originalDevices = [...devices];
    });

    afterEach(() => {
      // Restore original devices state
      devices.length = 0;
      devices.push(...originalDevices);
    });

    it('should return 404 NOT_FOUND for a non-existent device ID', async () => {
      const nonExistentId = 'non-existent-device-id-123';
      const response = await request(app)
        .post(`/api/devices/${nonExistentId}/toggle-mosfet`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: `Device with ID ${nonExistentId} not found`
        }
      });
    });

    it('should return 400 BAD_REQUEST for a device that does not support MOSFET operations', async () => {
      const mockDeviceId = 'mock-device-no-mosfet';

      // Add a mock device that doesn't have mosfetStatus
      devices.push({
        id: mockDeviceId,
        type: 'inverter', // Make sure this is a valid type if TypeScript complains, inverter is usually one
        name: 'Mock Device without MOSFET',
        status: 'online',
        telemetry: {
          voltage: 230,
          current: 10,
          power: 2300,
          energy: 100,
          frequency: 50,
          temperature: 30,
          timestamp: new Date().toISOString(),
          // Explicitly omit mosfetStatus or set to undefined
        }
      } as Device);

      const response = await request(app)
        .post(`/api/devices/${mockDeviceId}/toggle-mosfet`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: {
          code: 'BAD_REQUEST',
          message: `Device with ID ${mockDeviceId} does not support MOSFET operations`
        }
      });
    });
  });
});
