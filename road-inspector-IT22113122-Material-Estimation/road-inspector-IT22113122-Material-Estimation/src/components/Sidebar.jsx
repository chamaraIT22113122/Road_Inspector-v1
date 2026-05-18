// Sidebar.jsx — Navigation sidebar component
import { 
  LayoutDashboard, Search, Megaphone, BarChart3, 
  History as HistoryIcon, Settings, Hammer, TrafficCone, FlaskConical,
  ShieldAlert, Activity
} from 'lucide-react';
import styles from './Sidebar.module.css';

const myModules = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard 📊', id: 'dashboard' },
  { icon: <FlaskConical size={18} />, label: 'Material Estimation 🧪', id: 'estimator' },
  { icon: <BarChart3 size={18} />, label: 'Analytics 📈', id: 'analytics' },
  { icon: <HistoryIcon size={18} />, label: 'History 📜', id: 'history' },
  { icon: <Settings size={18} />, label: 'Settings ⚙️', id: 'settings' },
];

const teamModules = [
  { icon: <Hammer size={18} />, label: 'Repair Segmentation 🛠️', id: 'segmentation' },
  { icon: <TrafficCone size={18} />, label: 'Traffic Scheduling 🚦', id: 'traffic' },
  { icon: <Search size={18} />, label: 'Defect Detection 🔍', id: 'detection' },
  { icon: <Megaphone size={18} />, label: 'Citizen Reports 📢', id: 'reports' },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logo}>
          <ShieldAlert size={24} color="white" />
        </div>
        <div>
          <h2 className={styles.brandName}>Road Inspector</h2>
          <p className={styles.brandSub}>AI Research Platform</p>
        </div>
      </div>

      {/* My Modules */}
      <div className={styles.navSection}>
        <p className={styles.navLabel}>MY MODULE</p>
        <nav className={styles.nav}>
          {myModules.map((item) => (
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
          {teamModules.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${styles.teamItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
              {activePage === item.id && <span className={styles.activeDot} />}
            </button>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className={styles.profile}>
        <div className={styles.avatar}>IT</div>
        <div>
          <p className={styles.profileName}>IT22113122</p>
          <p className={styles.profileRole}>Research Analyst</p>
        </div>
        <span className={styles.onlineDot} />
      </div>
    </aside>
  );
}
