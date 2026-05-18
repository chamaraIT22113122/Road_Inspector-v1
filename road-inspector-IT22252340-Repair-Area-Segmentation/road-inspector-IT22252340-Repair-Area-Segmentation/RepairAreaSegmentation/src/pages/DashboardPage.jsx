import styles from './DashboardPage.module.css';

export default function DashboardPage({ segmentationData }) {
  const noData = !segmentationData?.result;
  const { form, result, uploadedImage } = segmentationData || {};

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Latest Repair Area Segmentation insights and field context</p>
        </div>
        <div className={styles.timestamp}>Updated: {result ? new Date(result.timestamp).toLocaleString() : 'No data yet'}</div>
      </header>

      {noData ? (
        <div className={styles.emptyState}>
          <h2>No segmentation run yet</h2>
          <p>Run an analysis in the Repair Area Segmentation module and the latest details will appear here.</p>
        </div>
      ) : (
        <>
          <div className={styles.topCards}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Road Segment</p>
              <h2>{form.locationID}</h2>
              <span className={styles.badge}>{form.roadType}</span>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Predicted Repair Area</p>
              <h2>{result.metrics.repairArea} m²</h2>
              <span className={styles.badge}>AI Confidence {result.metrics.aiConfidence}%</span>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Risk Level</p>
              <h2 className={styles.riskTag}>{result.riskLevel}</h2>
              <span className={styles.badge}>{result.structuralStability}</span>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Severity Score</p>
              <h2>{result.metrics.severityScore} / 100</h2>
              <span className={styles.badge}>{form.severity}</span>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <h3>Segmentation Inputs</h3>
              <div className={styles.detailItem}><span>Total Area</span><strong>{form.totalArea} m²</strong></div>
              <div className={styles.detailItem}><span>Defect Density</span><strong>{(form.defectDensity * 100).toFixed(0)}%</strong></div>
              <div className={styles.detailItem}><span>GPS Coordinates</span><strong>{form.gps}</strong></div>
              <div className={styles.detailItem}><span>Image Source</span><strong>{uploadedImage || 'Default research image'}</strong></div>
            </div>

            <div className={styles.detailCard}>
              <h3>Segmentation Recommendations</h3>
              <p className={styles.recommendation}>{result.recommendation}</p>
              <div className={styles.tagRow}>
                <div className={styles.tag}><span>Predicted Segments</span> {result.metrics.predictedSegments}</div>
                <div className={styles.tag}><span>Confidence Threshold</span> {Math.round(result.metrics.aiConfidence)}%</div>
                <div className={styles.tag}><span>Repair Cost Rate</span> Rs. {AVG_REPAIR_COST_LKR.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const AVG_REPAIR_COST_LKR = 4850.00;