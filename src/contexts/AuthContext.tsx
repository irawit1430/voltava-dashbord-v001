import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (googleIdToken: string) => Promise<void>;
  loginBypass: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: check localStorage for saved token and validate it
  useEffect(() => {
    const savedToken = localStorage.getItem('voltava_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${savedToken}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('voltava_token');
          setToken(null);
          setUser(null);
          return null;
        }
        if (!res.ok) throw new Error('Failed to validate session');
        return res.json();
      })
      .then(data => {
        if (data) {
          setUser(data.user);
          setToken(savedToken);
        }
      })
      .catch(err => {
        console.error('Auth validation error:', err);
        localStorage.removeItem('voltava_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (googleIdToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: googleIdToken }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => null);
        setError(data?.message || 'Access Denied — Your email is not authorized to access this platform.');
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const data = await res.json();
      localStorage.setItem('voltava_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to the authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginBypass = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error('Bypass login failed');
      }
      const data = await res.json();
      localStorage.setItem('voltava_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error('Bypass login error:', err);
      setError('Unable to bypass authentication.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('voltava_token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, loginBypass, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
