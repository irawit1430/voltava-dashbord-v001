import './DashboardHome.css';

export default function VerticalModules() {
  const modules = [
    {
      name: 'Voltava EIP Mobility',
      desc: 'EV OEMs & fleet telemetry (20-50 e-rickshaw pilots in NCR/Bihar)',
      progress: '78%',
      color: 'var(--accent-green)',
      count: '3 Fleets',
    },
    {
      name: 'Voltava EIP Grid',
      desc: 'Solar plants & smart meters peak management (DLMS/IEC 62056)',
      progress: '42%',
      color: 'var(--accent-blue)',
      count: '2 Sites',
    },
    {
      name: 'Voltava EIP ESS',
      desc: 'Homes & Factory BESS storage monitoring & optimization',
      progress: '65%',
      color: 'var(--accent-cyan)',
      count: '1 BESS',
    },
    {
      name: 'Voltava EIP Infra',
      desc: 'Excavators, cranes telematics & construction mixers',
      progress: '10%',
      color: 'var(--accent-orange)',
      count: '1 Machine',
    },
  ];

  return (
    <>
      <div className="modules-header">
        <h3>Voltava EIP Vertical Modules</h3>
      </div>
      <div className="modules-grid">
        {modules.map((mod, i) => (
          <div key={i} className="glass-panel module-card">
            <div className="module-meta">
              <h4 className="module-name">{mod.name}</h4>
              <span className="module-status" style={{ color: mod.color }}>
                {mod.count}
              </span>
            </div>
            <p className="module-desc">{mod.desc}</p>
            <div className="progress-wrap">
              <div className="progress-label">
                <span>Deployment readiness</span>
                <span>{mod.progress}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: mod.progress, backgroundColor: mod.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
