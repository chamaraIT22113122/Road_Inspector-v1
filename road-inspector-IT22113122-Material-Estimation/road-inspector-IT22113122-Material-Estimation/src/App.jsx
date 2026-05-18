// App.jsx — Root layout with sidebar + page routing
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MaterialEstimationPage from './pages/MaterialEstimationPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DetectionPage from './pages/DetectionPage';
import SegmentationPage from './pages/SegmentationPage';
import TrafficPage from './pages/TrafficPage';
import ReportPage from './pages/ReportPage';
import styles from './App.module.css';

export default function App() {
  const [activePage, setActivePage] = useState('estimator');

  const renderPage = () => {
    switch (activePage) {
      case 'estimator': return <MaterialEstimationPage />;
      case 'dashboard': return <DashboardPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'detection': return <DetectionPage />;
      case 'segmentation': return <SegmentationPage />;
      case 'traffic': return <TrafficPage />;
      case 'reports': return <ReportPage />;
      case 'history':
      case 'settings':
      default:
        return (
          <div className={styles.placeholder}>
            <h2>🚧 {activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ')} Module</h2>
            <p>This module is currently under development for the Road Inspector Research Platform.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className={styles.content}>
        {renderPage()}
      </div>
    </div>
  );
}
