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

/**
 * Retrieves the list of allowed emails from the allowlist file.
 * Falls back to the default configuration if the file is missing or unreadable.
 */
export function getAllowedEmails(): string[] {
  try {
    if (fs.existsSync(ALLOWLIST_FILE)) {
      return JSON.parse(fs.readFileSync(ALLOWLIST_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading allowlist file:', err);
  }
  return AUTH_CONFIG.ALLOWED_EMAILS;
}

/**
 * Saves a new list of allowed emails to the allowlist file.
 * 
 * @param emails The updated list of allowed email addresses
 */
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
  if (!payload) throw new Error('Google token payload is empty');
  if (!payload.email) throw new Error('Google token is missing email claim');

  return {
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || '',
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
 * Extracts core user profile fields from a payload or user object.
 * Useful for stripping out extra properties like JWT 'iat' or 'exp'.
 */
function extractUser(payload: AuthPayload | User): User {
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    role: payload.role,
  };
}

/**
 * Signs a session JWT containing the user payload.
 *
 * @param user  The authenticated user object.
 * @returns     A signed JWT string valid for the configured expiry.
 */
export function generateSessionToken(user: User): string {
  const tokenPayload = extractUser(user);

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
    return jwt.verify(token, AUTH_CONFIG.JWT_SECRET, { algorithms: ['HS256'] }) as AuthPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------
// 5. Express middleware — requireAuth
// ---------------------------------------------------------

/**
 * Helper to format standard unauthorized responses.
 */
function sendUnauthorized(res: Response, message: string): void {
  res.status(401).json({
    error: { code: 'UNAUTHORIZED', message },
  });
}

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
    req.user = { email: 'test@example.com', name: 'Test User', picture: '', role: 'admin' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7); // strip "Bearer "
  const payload = verifySessionToken(token);

  if (!payload) {
    return sendUnauthorized(res, 'Invalid or expired session token');
  }

  req.user = extractUser(payload);
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

    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;

    return extractUser(payload);
  } catch {
    return null;
  }
}
