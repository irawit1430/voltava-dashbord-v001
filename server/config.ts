// ---------------------------------------------------------
// Voltava EIP Dashboard — Centralized Configuration
// ---------------------------------------------------------
// All auth-related settings live here so they can be tuned
// per-environment via process.env without touching code.
// ---------------------------------------------------------

import dotenv from 'dotenv';
dotenv.config();

/**
 * Authentication & authorization configuration.
 *
 * GOOGLE_CLIENT_ID  – OAuth 2.0 client ID used to verify Google ID tokens.
 * JWT_SECRET        – HMAC key for signing / verifying session JWTs.
 * JWT_EXPIRY        – How long a session token stays valid (ms-style string).
 * ALLOWED_EMAILS    – Comma-separated allowlist of emails that may log in.
 */
export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'voltava-dev-secret-change-in-production-' + Date.now(),
  JWT_EXPIRY: '7d',
  ALLOWED_EMAILS: (
    process.env.ALLOWED_EMAILS || 'anuirawit@gmail.com'
  )
    .split(',')
    .map((e) => e.trim().toLowerCase()),
};

// ── Startup warnings ────────────────────────────────────
if (!AUTH_CONFIG.GOOGLE_CLIENT_ID) {
  console.warn(
    '[config] ⚠  GOOGLE_CLIENT_ID is empty — Google token verification will fail in production.',
  );
}

if (!process.env.JWT_SECRET) {
  console.warn(
    '[config] ⚠  JWT_SECRET is using a default value — set a strong secret in production.',
  );
}
