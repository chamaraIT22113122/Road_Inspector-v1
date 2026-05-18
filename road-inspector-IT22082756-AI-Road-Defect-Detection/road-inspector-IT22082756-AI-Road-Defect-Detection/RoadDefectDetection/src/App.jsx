import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DetectionPage from './pages/DetectionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CitizenReportsPage from './pages/CitizenReportsPage';
import { checkHealth } from './services/api';
import styles from './App.module.css';

export default function App() {
  const [activePage, setActivePage] = useState('detection');
  const [detections, setDetections] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    checkHealth()
      .then((res) => {
        setDbStatus(res.data.dbConnected ? 'Connected' : 'Local Research Mode');
      })
      .catch(() => {
        setDbStatus('Offline');
      });
  }, []);

  const handleDetection = (newResult) => {
    // Check if a real defect was detected
    if (!newResult.defect_detected) return;
    
    const resultWithDate = {
      ...newResult,
      id: newResult.image_id,
      type: newResult.defect_type,
      severity: newResult.severity,
      riskLevel: newResult.risk_level,
      surfaceCondition: newResult.surface_condition,
      safetyImpact: newResult.safety_impact,
      recommendedAction: newResult.recommended_action,
      confidence: newResult.confidence,
      totalDefects: newResult.total_defects,
      date: new Date().toLocaleString(),
    };
    setDetections((prev) => [resultWithDate, ...prev]);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'detection':
        return <DetectionPage onDetection={handleDetection} dbStatus={dbStatus} />;
      case 'analytics':
        return <AnalyticsPage detections={detections} />;
      case 'citizen_reports':
        return <CitizenReportsPage />;
      default:
        return (
          <div className={styles.placeholder}>
            <h2>🚧 Coming Soon</h2>
            <p>This module is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} dbStatus={dbStatus} />
      <div className={styles.content}>{renderPage()}</div>
    </div>
  );
}
