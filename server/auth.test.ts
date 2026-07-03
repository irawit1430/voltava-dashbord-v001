import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isEmailAllowed, saveAllowedEmails, getAllowedEmails } from './auth';

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
