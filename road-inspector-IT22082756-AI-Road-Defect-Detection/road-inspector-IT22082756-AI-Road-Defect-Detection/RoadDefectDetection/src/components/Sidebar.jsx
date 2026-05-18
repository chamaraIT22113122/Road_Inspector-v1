// Sidebar.jsx — Navigation sidebar component
import styles from './Sidebar.module.css';

const navItems = [
  { icon: '📊', label: 'Dashboard', id: 'dashboard' },
  { icon: '🔍', label: 'Defect Detection', id: 'detection', active: true },
  { icon: '📢', label: 'Citizen Reports', id: 'citizen_reports' },
  { icon: '📈', label: 'Analytics', id: 'analytics' },
  { icon: '📋', label: 'History', id: 'history' },
  { icon: '⚙️', label: 'Settings', id: 'settings' },
];

const teamNav = [
  { icon: '🚧', label: 'Repair Segmentation', id: 'repair' },
  { icon: '🚦', label: 'Traffic Scheduling', id: 'traffic' },
  { icon: '🧪', label: 'Material Estimation', id: 'estimator' },
];

export default function Sidebar({ activePage, onNavigate, dbStatus }) {
  const getStatusColor = () => {
    switch (dbStatus) {
      case 'Connected': return '#4caf50'; // Green
      case 'Local Research Mode': return '#ff9800'; // Orange
      case 'Offline': return '#f44336'; // Red
      default: return '#9e9e9e'; // Grey
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logo}>
          <span>🛣️</span>
        </div>
        <div>
          <h2 className={styles.brandName}>Road Inspector</h2>
          <p className={styles.brandSub}>AI Research Platform</p>
        </div>
      </div>

      {/* Main Nav */}
      <div className={styles.navSection}>
        <p className={styles.navLabel}>MY MODULE</p>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
              {activePage === item.id && <span className={styles.activeDot} />}
            </button>
          ))}
        </nav>
      </div>

      {/* Team Modules */}
      <div className={styles.navSection}>
        <p className={styles.navLabel}>TEAM MODULES</p>
        <nav className={styles.nav}>
          {teamNav.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${styles.teamItem}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Database Status & User Profile */}
      <div className={styles.footerSection}>
        <div className={styles.dbStatusContainer}>
          <span className={styles.dbStatusDot} style={{ backgroundColor: getStatusColor() }} />
          <span className={styles.dbStatusText}>DB: {dbStatus || 'Checking...'}</span>
        </div>
        
        <div className={styles.profile}>
          <div className={styles.avatar}>IT</div>
          <div>
            <p className={styles.profileName}>IT22082756</p>
            <p className={styles.profileRole}>AI Road Defect Detection</p>
          </div>
          <span className={styles.onlineDot} />
        </div>
      </div>
    </aside>
  );
}
