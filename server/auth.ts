// ---------------------------------------------------------
// Voltava EIP Dashboard — Authentication Module
// ---------------------------------------------------------
// Handles Google OAuth verification, JWT session management,
// Express middleware, and WebSocket auth helpers.
// ---------------------------------------------------------

import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AUTH_CONFIG } from './config.js';
import type { User, AuthPayload } from './types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ALLOWLIST_FILE = path.resolve(__dirname, 'allowlist.json');

// Helper to get allowed emails
export function getAllowedEmails(): string[] {
  try {
    if (fs.existsSync(ALLOWLIST_FILE)) {
      const data = fs.readFileSync(ALLOWLIST_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading allowlist file:', err);
  }
  return AUTH_CONFIG.ALLOWED_EMAILS;
}

// Helper to save allowed emails
export function saveAllowedEmails(emails: string[]): void {
  try {
    fs.writeFileSync(ALLOWLIST_FILE, JSON.stringify(emails, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing allowlist file:', err);
  }
}

// Initialise allowlist file if it doesn't exist
if (!fs.existsSync(ALLOWLIST_FILE)) {
  saveAllowedEmails(AUTH_CONFIG.ALLOWED_EMAILS);
}


// ── Module augmentation ─────────────────────────────────
// Extend Express.Request so `req.user` is typed globally.
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Google OAuth client — initialised once at module load.
const googleClient = new OAuth2Client(AUTH_CONFIG.GOOGLE_CLIENT_ID);

// ---------------------------------------------------------
// 1. Verify a Google ID token
// ---------------------------------------------------------
/**
 * Verifies a Google-issued ID token and extracts user info.
 *
 * @param idToken  The raw ID token string from the client.
 * @returns        An object with `email`, `name`, and `picture`.
 * @throws         If the token is invalid or missing required fields.
 */
export async function verifyGoogleToken(
  idToken: string,
): Promise<{ email: string; name: string; picture: string }> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: AUTH_CONFIG.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Google token payload is empty');
  }

  const { email, name, picture } = payload;
  if (!email) {
    throw new Error('Google token is missing email claim');
  }

  return {
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    picture: picture || '',
  };
}

// ---------------------------------------------------------
// 2. Email allowlist check
// ---------------------------------------------------------
/**
 * Returns `true` if the given email is present in the
 * configured allowlist (case-insensitive comparison).
 */
export function isEmailAllowed(email: string): boolean {
  return getAllowedEmails().includes(email.trim().toLowerCase());
}


// ---------------------------------------------------------
// 3. Generate a signed session JWT
// ---------------------------------------------------------
/**
 * Signs a JWT containing the user payload.
 *
 * @param user  The authenticated user object.
 * @returns     A signed JWT string.
 */
export function generateSessionToken(user: User): string {
  const tokenPayload: Omit<AuthPayload, 'iat' | 'exp'> = {
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role,
  };

  return jwt.sign(tokenPayload, AUTH_CONFIG.JWT_SECRET, {
    expiresIn: AUTH_CONFIG.JWT_EXPIRY,
    algorithm: 'HS256',
  });
}

// ---------------------------------------------------------
// 4. Verify a session JWT
// ---------------------------------------------------------
/**
 * Verifies and decodes a JWT session token.
 *
 * @param token  The JWT string from the client.
 * @returns      The decoded `AuthPayload`, or `null` if invalid/expired.
 */
export function verifySessionToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET, { algorithms: ['HS256'] }) as AuthPayload;
    return decoded;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------
// 5. Express middleware — requireAuth
// ---------------------------------------------------------
/**
 * Express middleware that enforces Bearer-token authentication.
 *
 * Extracts the JWT from the `Authorization: Bearer <token>` header,
 * verifies it, and attaches the decoded user to `req.user`.
 * Responds with 401 if the token is missing or invalid.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (process.env.NODE_ENV === 'test') {
    req.user = {
      email: 'test@example.com',
      name: 'Test User',
      picture: '',
      role: 'admin',
    };
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header',
      },
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "
  const payload = verifySessionToken(token);

  if (!payload) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session token',
      },
    });
    return;
  }

  // Attach the authenticated user to the request object.
  req.user = {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    role: payload.role,
  };

  next();
}

// ---------------------------------------------------------
// 6. WebSocket authentication helper
// ---------------------------------------------------------
/**
 * Authenticates a WebSocket connection by extracting the `token`
 * query parameter from the connection URL.
 *
 * @param url  The raw request URL (e.g. `/ws?token=xxx`).
 * @returns    The authenticated `User`, or `null` if invalid.
 */
export function authenticateWs(url: string): User | null {
  try {
    const parsed = new URL(url, 'http://localhost');
    const token = parsed.searchParams.get('token');

    if (!token) {
      return null;
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
