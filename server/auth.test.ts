import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isEmailAllowed, saveAllowedEmails, getAllowedEmails, generateSessionToken } from './auth';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from './config.js';

describe('Auth Module - isEmailAllowed', () => {
  let originalAllowlist: string[];

  beforeEach(() => {
    // Store original allowlist to restore it after each test
    originalAllowlist = [...getAllowedEmails()];
    // Set a controlled allowlist for testing
    saveAllowedEmails(['admin@voltava.com', 'user.name@example.org']);
  });

  afterEach(() => {
    // Restore the original allowlist
    saveAllowedEmails(originalAllowlist);
  });

  it('should return true for an exact match', () => {
    expect(isEmailAllowed('admin@voltava.com')).toBe(true);
  });

  it('should return true for a case-insensitive match', () => {
    expect(isEmailAllowed('ADMIN@VOLTAVA.COM')).toBe(true);
    expect(isEmailAllowed('User.Name@Example.Org')).toBe(true);
  });

  it('should return true for emails with leading and trailing whitespace', () => {
    expect(isEmailAllowed('  admin@voltava.com  ')).toBe(true);
    expect(isEmailAllowed('\tuser.name@example.org\n')).toBe(true);
  });

  it('should return false for emails not in the allowlist', () => {
    expect(isEmailAllowed('hacker@evil.com')).toBe(false);
    expect(isEmailAllowed('admin@voltava.co')).toBe(false); // typo
  });

  it('should return false for an empty string', () => {
    expect(isEmailAllowed('')).toBe(false);
  });

  it('should return false for a whitespace-only string', () => {
    expect(isEmailAllowed('   ')).toBe(false);
  });
});


describe('Auth Module - generateSessionToken', () => {
  it('should generate a valid JWT token returning a string', () => {
    const user = {
      email: 'admin@voltava.com',
      name: 'Admin User',
      picture: 'https://example.com/pic.jpg',
      role: 'admin' as const,
    };
    const token = generateSessionToken(user);
    expect(typeof token).toBe('string');
  });

  it('should correctly decode to match input User fields and strip extra properties', () => {
    const user = {
      email: 'admin@voltava.com',
      name: 'Admin User',
      picture: 'https://example.com/pic.jpg',
      role: 'admin' as const,
      extraField: 'shouldBeStripped' // extra field
    } as any; // Cast as any to test extraction logic

    const token = generateSessionToken(user);

    // Verify using the secret
    const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as any;

    expect(decoded.email).toBe('admin@voltava.com');
    expect(decoded.name).toBe('Admin User');
    expect(decoded.picture).toBe('https://example.com/pic.jpg');
    expect(decoded.role).toBe('admin');

    // Ensure extra field is stripped
    expect(decoded.extraField).toBeUndefined();

    // Ensure standard JWT claims are present
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });
});
