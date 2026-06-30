import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  requireAuth,
  verifyGoogleToken,
  isEmailAllowed,
  generateSessionToken,
  authenticateWs,
  getAllowedEmails,
  saveAllowedEmails,
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal');
  process.exit(0);
});

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

import { 
  devices, 
  gridMetrics, 
  historyMap, 
  initHistory, 
  simulateStep, 
  triggerOtaUpdate, 
  toggleMosfet,
  gateways,
  addGateway,
  updateGateway,
  toggleGateway,
  pingGateway,
  scanGatewayBus,
  addOrUpdateExternalDevice
} from './simulator';

// Initialize history
initHistory();

export const app = express();
const port = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    }
  }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Always allow localhost/127.0.0.1 origins for local development/testing
    if (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
      return callback(null, true);
    }
    
    // Check custom environment allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];
    
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                      origin === 'https://voltava-dashboard.onrender.com';

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('[CORS] Rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // relaxed limit for APIs
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // strict limit for auth
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ---------------------------------------------------------
// Auth Endpoints (public — no requireAuth)
// ---------------------------------------------------------

/**
 * POST /api/auth/google
 * Receives { idToken } from the client, verifies it with Google,
 * checks the email allowlist, and returns a signed session JWT.
 */
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'idToken is required' },
      });
    }

    // Verify with Google
    const googleUser = await verifyGoogleToken(idToken);

    // Check allowlist
    if (!isEmailAllowed(googleUser.email)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Email not authorised for this dashboard',
        },
      });
    }

    // Build user & sign session token
    const user = { ...googleUser, role: 'admin' as const };
    const token = generateSessionToken(user);

    return res.json({ user, token });
  } catch (err: any) {
    console.error('[auth] Google sign-in failed:', err.message);
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Google token verification failed',
      },
    });
  }
});

/**
 * POST /api/auth/bypass
 * Development-only bypass endpoint to sign in a mock user without Google OAuth.
 */
app.post('/api/auth/bypass', (req, res) => {
  // Only allow bypass in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Bypass not allowed in production' },
    });
  }

  const user = {
    email: 'anuirawit@gmail.com',
    name: 'Anurag Tiwari (Dev Bypass)',
    picture: '',
    role: 'admin' as const,
  };
  const token = generateSessionToken(user);
  return res.json({ user, token });
});


/**
 * GET /api/auth/me
 * Returns the currently authenticated user (from JWT).
 */
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/**
 * POST /api/auth/logout
 * Stateless JWT — the client simply discards its token.
 * This endpoint exists for semantic completeness & audit hooks.
 */
app.post('/api/auth/logout', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/allowlist
 * Returns the list of currently authorized Google emails.
 */
app.get('/api/auth/allowlist', requireAuth, (req, res) => {
  res.json({ emails: getAllowedEmails() });
});

/**
 * POST /api/auth/allowlist
 * Adds a new email address to the authorized list.
 */
app.post('/api/auth/allowlist', requireAuth, (req, res) => {
  const { email } = req.body;
  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  const targetEmail = email.trim().toLowerCase();
  const emails = getAllowedEmails();
  if (emails.includes(targetEmail)) {
    return res.status(400).json({ error: 'Email is already authorized' });
  }
  const updatedEmails = [...emails, targetEmail];
  saveAllowedEmails(updatedEmails);
  res.json({ success: true, emails: updatedEmails });
});

/**
 * DELETE /api/auth/allowlist/:email
 * Removes an email address from the authorized list.
 * Safe checks: Cannot delete primary admin (anuirawit@gmail.com) or own logged-in email.
 */
app.delete('/api/auth/allowlist/:email', requireAuth, (req, res) => {
  const targetEmail = req.params.email.trim().toLowerCase();
  const emails = getAllowedEmails();
  if (!emails.includes(targetEmail)) {
    return res.status(404).json({ error: 'Email not found in allowlist' });
  }
  if (targetEmail === 'anuirawit@gmail.com') {
    return res.status(400).json({ error: 'Cannot remove the primary admin email' });
  }
  if (req.user && req.user.email.toLowerCase() === targetEmail) {
    return res.status(400).json({ error: 'Cannot remove your own email while logged in' });
  }
  const updatedEmails = emails.filter(e => e !== targetEmail);
  saveAllowedEmails(updatedEmails);
  res.json({ success: true, emails: updatedEmails });
});

// ---------------------------------------------------------
// Protect all downstream API routes with requireAuth
// ---------------------------------------------------------
app.use('/api/devices', requireAuth);
app.use('/api/gateways', requireAuth);
app.use('/api/grid-metrics', requireAuth);


function isValidPayload(payload: any): boolean {
  if (typeof payload !== 'object' || payload === null) return false;

  if (payload.voltage !== undefined && typeof payload.voltage !== 'number') return false;
  if (payload.current !== undefined && typeof payload.current !== 'number') return false;
  if (payload.soc !== undefined && typeof payload.soc !== 'number') return false;
  if (payload.soh !== undefined && typeof payload.soh !== 'number') return false;
  if (payload.temp !== undefined && typeof payload.temp !== 'number') return false;
  if (payload.power !== undefined && typeof payload.power !== 'number') return false;

  if (payload.faults !== undefined) {
    if (!Array.isArray(payload.faults)) return false;
    if (!payload.faults.every((f: any) => typeof f === 'string')) return false;
  }

  if (payload.cellVoltages !== undefined) {
    if (!Array.isArray(payload.cellVoltages)) return false;
    if (!payload.cellVoltages.every((v: any) => typeof v === 'number')) return false;
  }

  if (payload.cellTemps !== undefined) {
    if (!Array.isArray(payload.cellTemps)) return false;
    if (!payload.cellTemps.every((t: any) => typeof t === 'number')) return false;
  }

  if (payload.mosfetStatus !== undefined) {
    if (payload.mosfetStatus !== 'on' && payload.mosfetStatus !== 'off') return false;
  }

  return true;
}

// API Endpoints
app.post('/api/devices/ingest', (req, res) => {
  const { id, payload } = req.body;
  if (typeof id !== 'string' || !id || !payload || !isValidPayload(payload)) {
    return res.status(400).json({ error: 'Invalid or missing device id or payload' });
  }
  addOrUpdateExternalDevice(id, payload);
  broadcastTelemetry();
  res.json({ success: true, message: `Telemetry updated for device ${id}` });
});

app.get('/api/devices', (req, res) => {
  res.json(devices);
});

app.get('/api/devices/history', (req, res) => {
  res.json(historyMap);
});

app.get('/api/devices/:id', (req, res) => {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Device with ID ${req.params.id} not found`
      }
    });
  }
  res.json(device);
});

app.get('/api/devices/:id/history', (req, res) => {
  const history = historyMap[req.params.id];
  if (!history) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `History for device with ID ${req.params.id} not found`
      }
    });
  }
  res.json(history);
});

app.post('/api/devices/:id/ota', (req, res) => {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Device with ID ${req.params.id} not found`
      }
    });
  }
  triggerOtaUpdate(req.params.id);
  res.json({ success: true, message: 'OTA update initiated' });
});

app.post('/api/devices/:id/toggle-mosfet', (req, res) => {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Device with ID ${req.params.id} not found`
      }
    });
  }
  if (!device.telemetry.mosfetStatus) {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: `Device with ID ${req.params.id} does not support MOSFET operations`
      }
    });
  }
  const status = toggleMosfet(req.params.id);
  res.json({ success: true, mosfetStatus: status });
});

app.get('/api/grid-metrics', (req, res) => {
  res.json(gridMetrics);
});

// Gateway Endpoints
app.get('/api/gateways', (req, res) => {
  res.json(gateways);
});

app.post('/api/gateways', (req, res) => {
  try {
    const newGw = addGateway(req.body);
    broadcastTelemetry();
    res.status(201).json(newGw);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/gateways/:id', (req, res) => {
  try {
    const updated = updateGateway(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Gateway not found' });
    }
    broadcastTelemetry();
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/gateways/:id/toggle', (req, res) => {
  const updated = toggleGateway(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Gateway not found' });
  }
  broadcastTelemetry();
  res.json(updated);
});

app.post('/api/gateways/:id/ping', (req, res) => {
  const output = pingGateway(req.params.id);
  res.json({ output });
});

app.post('/api/gateways/:id/scan', (req, res) => {
  const output = scanGatewayBus(req.params.id);
  res.json({ output });
});

// Serve static assets in production if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not Found');
    }
  });
}

// Create HTTP Server
const server = createServer(app);

// Create WebSocket Server directly attached to the HTTP server
const wss = new WebSocketServer({ server });

// Handle errors on the WebSocketServer itself
wss.on('error', (err) => {
  console.error('WebSocketServer error:', err);
});

// WS Connection handler
wss.on('connection', (ws, request) => {
  const reqUrl = request.url || '';
  const parsed = new URL(reqUrl, 'http://localhost');
  const pathname = parsed.pathname;
  
  if (pathname !== '/ws' && pathname !== '/') {
    console.log(`Closing connection for unmatched path: ${pathname}`);
    ws.close(1008, 'Unsupported path');
    return;
  }

  // Authenticate WebSocket connection via query-param token
  const wsUser = authenticateWs(reqUrl);
  if (!wsUser) {
    console.log('WS connection rejected — invalid or missing token');
    ws.close(1008, 'Unauthorized');
    return;
  }

  console.log(`WS Client connected: ${wsUser.email}`);
  
  // Send immediate initial data state
  ws.send(JSON.stringify({
    type: 'TELEMETRY_UPDATE',
    data: {
      devices,
      gridMetrics,
      gateways
    }
  }));

  ws.on('error', (err) => {
    console.error('WS Client connection error:', err);
  });

  ws.on('close', () => {
    console.log('WS Client disconnected');
  });
});

// Broadcast state to all connected WS clients
function broadcastTelemetry() {
  let payload: string;
  try {
    payload = JSON.stringify({
      type: 'TELEMETRY_UPDATE',
      data: {
        devices,
        gridMetrics,
        gateways
      }
    });
  } catch (err) {
    console.error('Failed to serialize telemetry payload:', err);
    return;
  }

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload, (err) => {
          if (err) {
            console.error('WS send callback error:', err);
          }
        });
      } catch (err) {
        console.error('WS send threw:', err);
      }
    }
  });
}

// Start simulation loop (every 2 seconds)
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    try {
      simulateStep();
    } catch (err) {
      console.error('simulateStep() threw:', err);
    }
    try {
      broadcastTelemetry();
    } catch (err) {
      console.error('broadcastTelemetry() threw:', err);
    }
  }, 2000);

  // Boot server
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
