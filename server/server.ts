import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Don't exit — keep the server alive
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Don't exit — keep the server alive
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

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoints
app.post('/api/devices/ingest', (req, res) => {
  const { id, payload } = req.body;
  if (!id || !payload) {
    return res.status(400).json({ error: 'Missing device id or payload' });
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
  const newGw = addGateway(req.body);
  broadcastTelemetry();
  res.status(201).json(newGw);
});

app.put('/api/gateways/:id', (req, res) => {
  const updated = updateGateway(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Gateway not found' });
  }
  broadcastTelemetry();
  res.json(updated);
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
  const pathname = new URL(reqUrl, 'http://localhost').pathname;
  
  if (pathname !== '/ws' && pathname !== '/') {
    console.log(`Closing connection for unmatched path: ${pathname}`);
    ws.close(1008, 'Unsupported path');
    return;
  }

  console.log('WS Client connected');
  
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
