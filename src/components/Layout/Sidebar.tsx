import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Truck, 
  Zap, 
  Brain, 
  Calculator, 
  Layers, 
  Settings,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, category: 'General' },
    { id: 'devices', name: 'Device Registry', icon: Cpu, category: 'General' },
    { id: 'fleet', name: 'Fleet Mobility', icon: Truck, category: 'Modules' },
    { id: 'grid', name: 'Grid & Solar', icon: Zap, category: 'Modules' },
    { id: 'simulator', name: 'BESS Simulator', icon: Calculator, category: 'Optimization' },
    { id: 'ai', name: 'AI Energy Brain', icon: Brain, category: 'Optimization' },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>V</div>
        <div>
          <h1 style={styles.logoText}>VOLTAVA</h1>
          <span style={styles.logoSubtitle}>Energy Intelligence</span>
        </div>
      </div>

      {/* Subscription Status Pin */}
      <div style={styles.subBanner}>
        <ShieldCheck size={14} color="#10b981" />
        <span style={styles.subText}>EIP Enterprise v1.2</span>
      </div>

      {/* Navigation Groups */}
      <nav style={styles.nav}>
        {['General', 'Modules', 'Optimization'].map((category) => {
          const items = menuItems.filter(item => item.category === category);
          return (
            <div key={category} style={styles.navGroup}>
              <h2 style={styles.groupHeader}>{category}</h2>
              <ul style={styles.list}>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        style={{
                          ...styles.navButton,
                          ...(isActive ? styles.navButtonActive : {}),
                        }}
                      >
                        <Icon 
                          size={18} 
                          color={isActive ? '#10b981' : '#9ca3af'} 
                          style={styles.buttonIcon} 
                        />
                        <span style={isActive ? styles.textActive : styles.textInactive}>
                          {item.name}
                        </span>
                        {isActive && <div style={styles.activeIndicator} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={styles.footer}>
        <div style={styles.footerLink}>
          <Layers size={14} />
          <span>India Vision 2031</span>
        </div>
        <button 
          onClick={() => setActiveTab('gateway-config')}
          style={{
            ...styles.footerLink,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            color: activeTab === 'gateway-config' ? 'var(--text-primary)' : 'var(--text-muted)',
            backgroundColor: activeTab === 'gateway-config' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Settings size={14} color={activeTab === 'gateway-config' ? '#10b981' : '#9ca3af'} />
          <span style={{ fontWeight: activeTab === 'gateway-config' ? 600 : 500 }}>Gateway Config</span>
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '1.5rem 1rem',
    flexShrink: 0,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    paddingLeft: '0.5rem',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-green)',
    color: '#060913',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.25rem',
    fontFamily: 'var(--font-title)',
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
    letterSpacing: '0.05em',
    lineHeight: '1.1',
  },
  logoSubtitle: {
    fontSize: '0.65rem',
    color: 'var(--accent-green)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 600,
  },
  subBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    marginBottom: '1.5rem',
    marginLeft: '0.5rem',
    marginRight: '0.5rem',
  },
  subText: {
    fontSize: '0.7rem',
    color: 'var(--accent-green)',
    fontWeight: 600,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  groupHeader: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    fontWeight: 700,
    paddingLeft: '0.75rem',
    marginBottom: '0.2rem',
  },
  list: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '0.65rem 0.75rem',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    position: 'relative',
    color: 'var(--text-secondary)',
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-primary)',
  },
  buttonIcon: {
    marginRight: '0.75rem',
    flexShrink: 0,
  },
  textActive: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  textInactive: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: '3px',
    backgroundColor: 'var(--accent-green)',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 8px var(--accent-green)',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  footerLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    padding: '0.25rem 0.5rem',
  },
};
