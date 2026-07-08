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
    <div className="health-score-widget glass-panel p-6">
      <div className="widget-header flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="text-emerald-400" />
          Agentic System Health
        </h3>
        <button 
          onClick={runAudit} 
          disabled={loading}
          className="run-audit-btn flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
          {loading ? 'Auditing...' : 'Run Audit'}
        </button>
      </div>

      {error && (
        <div className="error-message text-red-400 mb-4 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="health-data-container mt-4">
          <div className="score-overview flex items-center gap-6 mb-6">
            <div className={`score-circle ${data.status.toLowerCase()}`}>
              <span className="text-4xl font-bold">{data.score}</span>
              <span className="text-xs opacity-70">/100</span>
            </div>
            <div className="status-details">
              <div className="flex items-center gap-2 mb-1">
                {data.status === 'Healthy' && <CheckCircle className="text-emerald-400" />}
                {data.status === 'Warning' && <AlertTriangle className="text-amber-400" />}
                {data.status === 'Critical' && <ShieldAlert className="text-red-400" />}
                <span className={`text-lg font-semibold status-text-${data.status.toLowerCase()}`}>
                  {data.status}
                </span>
              </div>
              <p className="text-sm opacity-80 mt-2">{data.reasoning}</p>
            </div>
          </div>
          
          {data.actionable_recommendations && data.actionable_recommendations.length > 0 && (
            <div className="recommendations-box">
              <h4 className="text-sm font-semibold mb-2 opacity-90">AI Recommendations:</h4>
              <ul className="text-sm space-y-2 opacity-80 list-disc pl-4">
                {data.actionable_recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="empty-state text-center opacity-60 text-sm mt-8 mb-4">
          Click "Run Audit" to analyze the current system state using Gemini AI.
        </div>
      )}
    </div>
  );
}
