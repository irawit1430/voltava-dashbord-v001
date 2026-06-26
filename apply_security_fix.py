import os
import re

# 1. Modify server/server.ts
with open('server/server.ts', 'r') as f:
    content = f.read()

middleware = """
// Authentication Middleware
export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const expectedKey = process.env.API_KEY || 'default-dev-key';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' } });
  }

  const token = authHeader.split(' ')[1];
  if (token !== expectedKey) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid API Key' } });
  }

  next();
};

"""

# Insert middleware after app.use(express.json());
content = content.replace("app.use(express.json());", "app.use(express.json());\n" + middleware)

# Apply middleware to sensitive endpoints
content = content.replace("app.post('/api/devices/ingest', (req, res) => {", "app.post('/api/devices/ingest', requireAuth, (req, res) => {")
content = content.replace("app.post('/api/devices/:id/ota', (req, res) => {", "app.post('/api/devices/:id/ota', requireAuth, (req, res) => {")
content = content.replace("app.post('/api/devices/:id/toggle-mosfet', (req, res) => {", "app.post('/api/devices/:id/toggle-mosfet', requireAuth, (req, res) => {")
content = content.replace("app.post('/api/gateways', (req, res) => {", "app.post('/api/gateways', requireAuth, (req, res) => {")
content = content.replace("app.put('/api/gateways/:id', (req, res) => {", "app.put('/api/gateways/:id', requireAuth, (req, res) => {")
content = content.replace("app.post('/api/gateways/:id/toggle', (req, res) => {", "app.post('/api/gateways/:id/toggle', requireAuth, (req, res) => {")
content = content.replace("app.post('/api/gateways/:id/ping', (req, res) => {", "app.post('/api/gateways/:id/ping', requireAuth, (req, res) => {")
content = content.replace("app.post('/api/gateways/:id/scan', (req, res) => {", "app.post('/api/gateways/:id/scan', requireAuth, (req, res) => {")

with open('server/server.ts', 'w') as f:
    f.write(content)

print("Updated server/server.ts")

# 2. Modify src/hooks/useTelemetry.ts
with open('src/hooks/useTelemetry.ts', 'r') as f:
    content = f.read()

# Add API key var at top
api_key_var = "\nconst API_KEY = import.meta.env.VITE_API_KEY || 'default-dev-key';\n"
content = content.replace("export function useTelemetry() {", "export function useTelemetry() {" + api_key_var)

# Add Authorization header to fetch calls
content = content.replace("headers: {\n        'Content-Type': 'application/json'\n      }", "headers: {\n        'Content-Type': 'application/json',\n        'Authorization': `Bearer ${API_KEY}`\n      }")
content = content.replace("headers: { 'Content-Type': 'application/json' }", "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }")

with open('src/hooks/useTelemetry.ts', 'w') as f:
    f.write(content)

print("Updated src/hooks/useTelemetry.ts")


# 3. Modify dummy-device.js
with open('dummy-device.js', 'r') as f:
    content = f.read()

content = content.replace("headers: {\n        'Content-Type': 'application/json'\n      }", "headers: {\n        'Content-Type': 'application/json',\n        'Authorization': 'Bearer default-dev-key'\n      }")

with open('dummy-device.js', 'w') as f:
    f.write(content)

print("Updated dummy-device.js")


# 4. Modify server/server.test.ts
with open('server/server.test.ts', 'r') as f:
    content = f.read()

# Replace post and send methods
content = re.sub(r'\.post\(`(.*?)`\)', r'.post(`\1`).set(\'Authorization\', \'Bearer default-dev-key\')', content)
content = re.sub(r"\.post\('(.*?)'\)", r".post('\1').set('Authorization', 'Bearer default-dev-key')", content)
content = re.sub(r"\.put\('(.*?)'\)", r".put('\1').set('Authorization', 'Bearer default-dev-key')", content)
content = re.sub(r"\.put\(`(.*?)`\)", r".put(`\1`).set('Authorization', 'Bearer default-dev-key')", content)


auth_test = """
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

"""

content = content.replace("describe('Server API', () => {", "describe('Server API', () => {" + auth_test)

with open('server/server.test.ts', 'w') as f:
    f.write(content)

print("Updated server/server.test.ts")
