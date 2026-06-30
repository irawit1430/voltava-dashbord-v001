import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserPlus, Trash2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AccessControl() {
  const { token, user: currentUser } = useAuth();
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [token]);

  const fetchEmails = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/allowlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load allowed emails');
      const data = await res.json();
      setEmails(data.emails);
    } catch (err: any) {
      setError(err.message || 'Error fetching access list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/allowlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail.trim().toLowerCase() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add email');
      }

      setEmails(data.emails);
      setNewEmail('');
      setSuccess(`Successfully authorized ${newEmail.trim().toLowerCase()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to add email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmail = async (email: string) => {
    if (email === 'anuirawit@gmail.com') {
      setError('Cannot remove the primary admin email');
      return;
    }
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      setError('Cannot remove your own email while logged in');
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke access for ${email}?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/auth/allowlist/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke access');
      }

      setEmails(data.emails);
      setSuccess(`Successfully revoked access for ${email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke access');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <Users size={24} color="var(--accent-green)" />
          <h2 style={styles.title}>Access Control</h2>
        </div>
        <p style={styles.description}>
          Authorize or revoke access to this platform. Only Google email addresses on this list can log in.
        </p>

        {error && (
          <div style={styles.alertError}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.alertSuccess}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleAddEmail} style={styles.form}>
          <input
            type="email"
            placeholder="new.user@gmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={isSubmitting}
            className="input-control"
            style={styles.input}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={styles.addButton}
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </form>

        <div style={styles.listContainer}>
          <h3 style={styles.listTitle}>Authorized Users ({emails.length})</h3>
          
          {isLoading ? (
            <div style={styles.loading}>Loading authorized users...</div>
          ) : (
            <div style={styles.list}>
              {emails.map((email) => {
                const isPrimary = email === 'anuirawit@gmail.com';
                const isCurrent = currentUser?.email.toLowerCase() === email;
                
                return (
                  <div key={email} style={styles.listItem}>
                    <div style={styles.emailContainer}>
                      <span style={styles.emailText}>{email}</span>
                      {isPrimary && (
                        <span style={styles.primaryBadge}>
                          <Shield size={10} />
                          Primary Admin
                        </span>
                      )}
                      {isCurrent && (
                        <span style={styles.currentBadge}>
                          You
                        </span>
                      )}
                    </div>
                    
                    {!isPrimary && !isCurrent && (
                      <button
                        onClick={() => handleDeleteEmail(email)}
                        style={styles.deleteButton}
                        title="Revoke access"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    padding: '1rem 0',
  },
  card: {
    padding: '2rem',
    borderRadius: '12px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    lineHeight: '1.4',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--accent-red)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: 'var(--accent-green)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  input: {
    flex: 1,
    height: '42px',
  },
  addButton: {
    height: '42px',
    padding: '0 1.25rem',
    flexShrink: 0,
  },
  listContainer: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem',
  },
  listTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
  },
  loading: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '1.5rem 0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
  },
  emailContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  emailText: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
  },
  primaryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: 'var(--accent-blue)',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  currentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: 'var(--accent-green)',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
};
