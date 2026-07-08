import { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import './HealthScoreWidget.css';

interface HealthScoreData {
  score: number;
  status: 'Healthy' | 'Warning' | 'Critical';
  reasoning: string;
  actionable_recommendations: string[];
}

export default function HealthScoreWidget() {
  const { getSystemHealthScore } = useTelemetry();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSystemHealthScore();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-score-widget glass-panel" style={{ padding: '1.5rem' }}>
      <div className="panel-header">
        <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
          <Activity style={{ color: 'var(--accent-green)' }} />
          Agentic System Health
        </h3>
        <button 
          onClick={runAudit} 
          disabled={loading}
          className="run-audit-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? <Loader2 className="animate-spin-slow" size={16} /> : <ShieldAlert size={16} />}
          {loading ? 'Auditing...' : 'Run Audit'}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="health-data-container" style={{ marginTop: '1rem' }}>
          <div className="score-overview" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={`score-circle ${data.status.toLowerCase()}`}>
              <span style={{ fontSize: '2.25rem', fontWeight: 700 }}>{data.score}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>/100</span>
            </div>
            <div className="status-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {data.status === 'Healthy' && <CheckCircle style={{ color: 'var(--accent-green)' }} />}
                {data.status === 'Warning' && <AlertTriangle style={{ color: 'var(--accent-orange)' }} />}
                {data.status === 'Critical' && <ShieldAlert style={{ color: 'var(--accent-red)' }} />}
                <span className={`status-text-${data.status.toLowerCase()}`} style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                  {data.status}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>{data.reasoning}</p>
            </div>
          </div>
          
          {data.actionable_recommendations && data.actionable_recommendations.length > 0 && (
            <div className="recommendations-box">
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', opacity: 0.9 }}>AI Recommendations:</h4>
              <ul style={{ fontSize: '0.875rem', opacity: 0.8, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.actionable_recommendations.map((rec, i) => (
                  <li style={{ listStyleType: 'disc' }} key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="empty-state" style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.875rem', marginTop: '2rem', marginBottom: '1rem' }}>
          Click "Run Audit" to analyze the current system state using Gemini AI.
        </div>
      )}
    </div>
  );
}
