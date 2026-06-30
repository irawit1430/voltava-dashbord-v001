import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, loginBypass, isLoading, error, clearError } = useAuth();

  return (
    <div className="login-page">
      {/* Background effects */}
      <div className="login-bg-grid" />
      <div className="login-particles">
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
        <div className="login-particle" />
      </div>
      <div className="login-glow login-glow--green" />
      <div className="login-glow login-glow--blue" />

      {/* Card */}
      <div className="login-card">
        {/* Loading overlay */}
        {isLoading && (
          <div className="login-spinner-overlay">
            <div className="login-spinner" />
            <span className="login-spinner-text">Verifying credentials…</span>
          </div>
        )}

        {/* Branding */}
        <div className="login-brand">
          <div className="login-logo-area">
            <div className="login-logo-icon">V</div>
            <span className="login-logo-text">
              Voltava <span className="login-logo-accent">EIP</span>
            </span>
          </div>
          <p className="login-tagline">Energy Intelligence Platform</p>
          <p className="login-subtitle">Secure access for authorized personnel only</p>
        </div>

        <div className="login-divider" />

        {/* Error display */}
        {error && (
          <div className="login-error">
            <span className="login-error-icon">⛔</span>
            <div className="login-error-content">
              <p className="login-error-title">
                {error.includes('Access Denied') || error.includes('not authorized')
                  ? 'Access Denied'
                  : 'Authentication Error'}
              </p>
              <p className="login-error-msg">{error}</p>
            </div>
            <button
              className="login-error-dismiss"
              onClick={clearError}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Google Sign-In */}
        <div className="login-google-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="login-google-wrapper">
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div style={{ color: 'var(--accent-red)', padding: '1rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <strong>⚠️ Missing Configuration</strong>
                <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>The Google Client ID is not set. If you are on Render, please ensure <code>VITE_GOOGLE_CLIENT_ID</code> is set in the environment variables and <strong>rebuild your app</strong>.</p>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    login(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                theme="filled_black"
                shape="pill"
                size="large"
                width="380"
                text="signin_with"
              />
            )}
          </div>
          {window.location.hostname === 'localhost' && (
            <button
              onClick={loginBypass}
              className="dev-bypass-btn"
              style={{
                marginTop: '1rem',
                width: '100%',
                maxWidth: '380px',
                padding: '0.75rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '9999px',
                color: 'var(--accent-green)',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
              }}
            >
              🛠️ Developer Bypass (Local Only)
            </button>
          )}
        </div>

        <div className="login-divider" />

        {/* Security badge */}
        <div className="login-security">
          <span className="login-security-text">
            🔒 Protected by Google OAuth 2.0
          </span>
        </div>
      </div>
    </div>
  );
}
