import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from './server';
import { devices } from './simulator';
import type { Device } from './types';

describe('Server API', () => {
  describe('Authentication Middleware', () => {
    it('should return 401 UNAUTHORIZED when Authorization header is missing', async () => {
      const response = await request(app)
        .post('/api/devices/test-id/toggle-mosfet');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' }
      });
    });

    it('should return 401 UNAUTHORIZED when Authorization token is invalid', async () => {
      const response = await request(app)
        .post('/api/devices/test-id/toggle-mosfet')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: { code: 'UNAUTHORIZED', message: 'Invalid API Key' }
      });
    });
  });


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
        .post(`/api/devices/${nonExistentId}/toggle-mosfet`).set('Authorization', 'Bearer default-dev-key');

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
        .post(`/api/devices/${mockDeviceId}/toggle-mosfet`).set('Authorization', 'Bearer default-dev-key');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: {
          code: 'BAD_REQUEST',
          message: `Device with ID ${mockDeviceId} does not support MOSFET operations`
        }
      });
    });
  });

  describe('POST /api/devices/ingest', () => {
    it('should return 400 BAD_REQUEST for missing device id', async () => {
      const response = await request(app)
        .post('/api/devices/ingest').set('Authorization', 'Bearer default-dev-key')
        .send({
          payload: {
            voltage: 230,
            current: 10
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing device id or payload'
      });
    });

    it('should return 400 BAD_REQUEST for missing payload', async () => {
      const response = await request(app)
        .post('/api/devices/ingest').set('Authorization', 'Bearer default-dev-key')
        .send({
          id: 'mock-device-id'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing device id or payload'
      });
    });

    it('should return 400 BAD_REQUEST for invalid id type', async () => {
      const response = await request(app)
        .post('/api/devices/ingest').set('Authorization', 'Bearer default-dev-key')
        .send({
          id: 123,
          payload: {
            voltage: 230
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing device id or payload'
      });
    });

    it('should return 400 BAD_REQUEST for invalid payload type (not an object)', async () => {
      const response = await request(app)
        .post('/api/devices/ingest').set('Authorization', 'Bearer default-dev-key')
        .send({
          id: 'mock-device-id',
          payload: 'invalid-payload'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing device id or payload'
      });
    });

    it('should return 400 BAD_REQUEST for invalid field type in payload', async () => {
      const response = await request(app)
        .post('/api/devices/ingest').set('Authorization', 'Bearer default-dev-key')
        .send({
          id: 'mock-device-id',
          payload: {
            voltage: '230' // Should be a number
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing device id or payload'
      });
    });

    it('should return 400 BAD_REQUEST for invalid faults array', async () => {
      const response = await request(app)
        .post('/api/devices/ingest').set('Authorization', 'Bearer default-dev-key')
        .send({
          id: 'mock-device-id',
          payload: {
            faults: ['fault1', 123] // Should be string[]
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing device id or payload'
      });
    });

    it('should return 200 SUCCESS for valid request', async () => {
      const response = await request(app)
        .post('/api/devices/ingest').set('Authorization', 'Bearer default-dev-key')
        .send({
          id: 'mock-device-id',
          payload: {
            voltage: 230,
            current: 10,
            soc: 80,
            faults: ['warning1']
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Telemetry updated for device mock-device-id'
      });
    });
  });
});

  describe('CORS Configuration', () => {
    let originalOrigins: string | undefined;

    beforeEach(() => {
      originalOrigins = process.env.ALLOWED_ORIGINS;
    });

    afterEach(() => {
      if (originalOrigins === undefined) {
        delete process.env.ALLOWED_ORIGINS;
      } else {
        process.env.ALLOWED_ORIGINS = originalOrigins;
      }
    });

    it('should allow requests from default allowed origins', async () => {
      delete process.env.ALLOWED_ORIGINS;

      const response = await request(app)
        .get('/api/devices')
        .set('Origin', 'http://localhost:5173');

      expect(response.status).not.toBe(500);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should allow requests from custom allowed origins via env', async () => {
      process.env.ALLOWED_ORIGINS = 'https://myapp.com,https://test.com';

      const response = await request(app)
        .get('/api/devices')
        .set('Origin', 'https://test.com');

      expect(response.status).not.toBe(500);
      expect(response.headers['access-control-allow-origin']).toBe('https://test.com');
    });

    it('should reject requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/api/devices')
        .set('Origin', 'http://evil.com');

      expect(response.status).toBe(500);
      expect(response.text).toContain('Not allowed by CORS');
    });
  });
