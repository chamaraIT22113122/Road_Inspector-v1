import {
  PieChart, Pie, Cell, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './AnalyticsPage.module.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6'];

export default function AnalyticsPage({ detections = [] }) {
  // 1. Calculate Metrics using ONLY REAL DATA from the YOLOv8 model
  const totalReports = detections.length;
  
  // Calculate total detected regions across all uploaded images
  const totalDefectRegions = detections.reduce((acc, curr) => acc + (curr.totalDefects || 1), 0);
  
  // Calculate average confidence score
  const avgConfidence = totalReports > 0 
    ? (detections.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / totalReports * 100).toFixed(1)
    : 0;

  // 2. Calculate Defect Type Distribution
  const defectCounts = detections.reduce((acc, curr) => {
    const type = curr.type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const defectTypeData = Object.keys(defectCounts).map(name => ({ name, value: defectCounts[name] }));

  // 3. Calculate Severity Distribution
  const severityCounts = detections.reduce((acc, curr) => {
    const severity = curr.severity || 'Minor';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
  const severityData = ['Critical', 'Major', 'Moderate', 'Minor'].map(name => ({
    name,
    value: severityCounts[name] || 0
  }));

  // 4. Calculate Risk Level Distribution
  const riskCounts = detections.reduce((acc, curr) => {
    const risk = curr.riskLevel || 'Low';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {});
  const riskData = ['Dangerous', 'High', 'Medium', 'Low'].map(name => ({
    name,
    value: riskCounts[name] || 0
  }));
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.moduleTag}>Research Dashboard | IT22082756</span>
          <h1 className={styles.title}>AI Road Defect Analytics</h1>
          <p className={styles.subtitle}>Real-time defect classification &amp; safety statistics calculated from YOLOv8 inference</p>
        </div>
      </header>

      {/* Top Metrics Cards */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🔍</div>
          <div className={styles.metricInfo}>
            <p className={styles.mLabel}>Total Scans Analyzed</p>
            <h3 className={styles.mValue}>{totalReports.toLocaleString()}</h3>
            <p className={styles.mSub}>Active session images</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>⚠️</div>
          <div className={styles.metricInfo}>
            <p className={styles.mLabel}>Total Defect Regions</p>
            <h3 className={styles.mValue}>{totalDefectRegions.toLocaleString()}</h3>
            <p className={styles.mSub}>Identified road anomalies</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>🤖</div>
          <div className={styles.metricInfo}>
            <p className={styles.mLabel}>Model Confidence</p>
            <h3 className={styles.mValue}>{avgConfidence}%</h3>
            <p className={styles.mSub}>Average Prediction Certainty</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className={styles.chartsGrid}>
        
        {/* CHART 1: Defect Types */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Defect Classification</h3>
            <p>Distribution of identified defect types</p>
          </div>
          <div className={styles.chartWrapper}>
            {defectTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defectTypeData} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5} dataKey="value"
                  >
                    {defectTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f1424', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No analytics available. Run a detection first.
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Severity Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Severity &amp; Risk Assessment</h3>
            <p>Distribution by severity class</p>
          </div>
          <div className={styles.chartWrapper}>
            {totalReports > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#8895b3" tick={{fontSize: 11}} />
                  <YAxis stroke="#8895b3" tick={{fontSize: 11}} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1424', border: '1px solid rgba(255,255,255,0.1)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                  <Bar dataKey="value" name="Report Count" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No analytics available. Run a detection first.
              </div>
            )}
          </div>
        </div>

        {/* RECENT DETECTIONS TABLE */}
        <div className={`${styles.chartCard} ${styles.colSpan2}`}>
          <div className={styles.cardHeader}>
            <h3>Session Road Defect Logs</h3>
            <p>Real-time audit trail of all detected defects</p>
          </div>
          <div className={styles.tableWrapper}>
            {detections.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Image ID</th>
                    <th>Defect Type</th>
                    <th>Regions</th>
                    <th>Severity</th>
                    <th>Risk Level</th>
                    <th>Surface / Soil</th>
                    <th>Safety Impact</th>
                    <th>Confidence</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {detections.map((row, idx) => (
                    <tr key={`${row.id}-${idx}`}>
                      <td className={styles.idCell}>{row.id}</td>
                      <td style={{ textTransform: 'capitalize' }}>{row.type}</td>
                      <td>{row.totalDefects || 1}</td>
                      <td>
                        <span className={`${styles.badge} ${row.severity === 'Critical' || row.severity === 'Major' ? styles.badgeMajor : styles.badgeMinor}`} style={{ background: row.severity === 'Critical' ? '#ef4444' : row.severity === 'Major' ? '#f97316' : '#3b82f6' }}>
                          {row.severity}
                        </span>
                      </td>
                      <td>{row.riskLevel}</td>
                      <td style={{ textTransform: 'capitalize' }}>{row.surfaceCondition}</td>
                      <td style={{ textTransform: 'capitalize' }}>{row.safetyImpact}</td>
                      <td className={styles.scoreCell}>{((row.confidence || 0) * 100).toFixed(0)}%</td>
                      <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{row.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No scans recorded in the current session. Please upload an image in the Detection tab.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
