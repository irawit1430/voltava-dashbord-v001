import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { isEmailAllowed, saveAllowedEmails, getAllowedEmails, requireAuth, generateSessionToken } from './auth';

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


describe('Auth Module - requireAuth', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: any;
  let jsonMock: any;
  let originalAllowlist: string[];

  beforeEach(() => {
    originalAllowlist = [...getAllowedEmails()];
    saveAllowedEmails(['admin@voltava.com']);

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    req = {
      headers: {}
    };
    res = {
      status: statusMock
    } as any;
    next = vi.fn();
  });

  afterEach(() => {
    saveAllowedEmails(originalAllowlist);
    vi.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', () => {
    requireAuth(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is malformed (no Bearer)', () => {
    req.headers = { authorization: 'Basic dGVzdDp0ZXN0' };
    requireAuth(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid_token_123' };
    requireAuth(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token' }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is valid but email is not allowed', () => {
    const user = { email: 'hacker@evil.com', name: 'Hacker', picture: '', role: 'user' };
    const token = generateSessionToken(user);
    req.headers = { authorization: `Bearer ${token}` };

    requireAuth(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Access revoked. Your email is no longer authorized.' }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.user and call next if token and email are valid', () => {
    const user = { email: 'admin@voltava.com', name: 'Admin', picture: '', role: 'admin' };
    const token = generateSessionToken(user);
    req.headers = { authorization: `Bearer ${token}` };

    requireAuth(req as Request, res as Response, next);

    expect(req.user).toEqual({
      email: 'admin@voltava.com',
      name: 'Admin',
      picture: '',
      role: 'admin'
    });
    expect(next).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });
});
