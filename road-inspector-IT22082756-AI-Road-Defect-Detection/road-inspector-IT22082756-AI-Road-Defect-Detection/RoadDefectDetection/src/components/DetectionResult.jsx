import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './DetectionResult.module.css';

const DetectionResult = ({ result, imagePreview }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConfidenceInfo, setShowConfidenceInfo] = useState(false);
  const [reportStatus, setReportStatus] = useState('');
  const reportRef = useRef(null);

  if (!result) return null;

  if (!result.defect_detected) {
    return (
      <div className={styles.resultCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.sectionLabel}>AI Detection Report</p>
            <h3>Road Defect Detection</h3>
          </div>
          <span className={styles.statusBadge} style={{ background: 'var(--success)' }}>Clear</span>
        </div>
        <div className={styles.summaryBlock} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
          <div className={styles.summaryTitle} style={{ color: '#10b981' }}>Detection Result</div>
          <p><strong>Defect Detected:</strong> No</p>
          <p>{result.message}</p>
        </div>
        
        <div className={styles.grid}>
          <div className={styles.item}>
            <label>Image Name</label>
            <span className={styles.value}>{result.image_name || 'upload.jpg'}</span>
          </div>
          <div className={styles.item}>
            <label>Detection Method</label>
            <span className={styles.value}>{result.detection_method}</span>
          </div>
          <div className={styles.item}>
            <label>Model File Used</label>
            <span className={styles.value}>{result.model_file}</span>
          </div>
          <div className={styles.item}>
            <label>Timestamp</label>
            <span className={styles.value}>{new Date(result.timestamp || Date.now()).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  const confidenceLabel = `${(result.confidence * 100).toFixed(0)}%`;
  
  // Custom styled risk color
  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return '#ef4444'; // Red
      case 'major': return '#f97316'; // Orange
      case 'moderate': return '#3b82f6'; // Blue
      default: return '#10b981'; // Green
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'dangerous': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const generateReportPdf = async () => {
    if (!reportRef.current) return;
    setReportStatus('Generating report...');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    await pdf.html(reportRef.current, {
      callback: () => {
        pdf.save(`RoadDefectReport_${result.image_id || 'AI'}.pdf`);
        setReportStatus('PDF report downloaded.');
        setTimeout(() => setReportStatus(''), 3000);
      },
      html2canvas: {
        scale: 2,
        backgroundColor: '#0f1424',
        useCORS: true,
      },
      x: 20,
      y: 20,
      margin: [20, 20, 20, 20],
    });
  };

  const downloadJsonReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `RoadDefect_JSON_${result.image_id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setReportStatus('JSON report downloaded.');
    setTimeout(() => setReportStatus(''), 3000);
  };

  return (
    <>
      <div className={styles.resultCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.sectionLabel}>AI Detection &amp; Classification Report</p>
            <h3>Road Defect Detection</h3>
          </div>
          <span className={styles.statusBadge} style={{ background: getSeverityColor(result.severity), color: '#fff', borderColor: 'transparent' }}>
            {result.severity} Severity
          </span>
        </div>

        <div className={styles.grid}>
          {/* Visual Output */}
          {result.annotated_image_url && (
            <div className={styles.itemFull} style={{ textAlign: 'center', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.2)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'left' }}>Visual Output (Segmented Overlay / Bounding Boxes)</label>
              <img 
                src={result.annotated_image_url} 
                alt="YOLOv8 Segmentation Overlay" 
                style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', maxH: '280px', objectFit: 'contain' }} 
              />
            </div>
          )}

          {/* 1. Defect Detection Result */}
          <div className={styles.item}>
            <label>Defect Detected</label>
            <span className={styles.value} style={{ color: '#ef4444' }}>Yes</span>
          </div>

          <div className={styles.item}>
            <label>Defect Type</label>
            <span className={styles.value} style={{ textTransform: 'capitalize' }}>{result.defect_type}</span>
          </div>

          <div className={styles.item}>
            <label>Number of Defects</label>
            <span className={styles.value}>{result.total_defects || 1} defect region(s)</span>
          </div>

          <div className={styles.item} style={{ position: 'relative' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Confidence Score
              <button
                onClick={() => setShowConfidenceInfo(v => !v)}
                style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.35)',
                  color: '#93c5fd',
                  borderRadius: '999px',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
                title="What does this score mean?"
              >?</button>
            </label>
            <span className={styles.value}>{confidenceLabel}</span>

            {showConfidenceInfo && (
              <div className={styles.confidencePanel}>
                <div className={styles.confidencePanelHeader}>
                  <span>📊 Confidence Score Guide</span>
                  <button className={styles.confidenceClose} onClick={() => setShowConfidenceInfo(false)}>✕</button>
                </div>
                <p className={styles.confidenceIntro}>
                  The confidence score shows <strong>how certain the AI model is</strong> about each detected defect.
                </p>
                <p className={styles.confidenceExample}>
                  Example: <strong>crack (0.81)</strong> means the AI is <strong>81% confident</strong> it detected a crack.
                </p>
                <div className={styles.confidenceGuide}>
                  <div className={styles.guideRow} style={{ '--dot': '#10b981' }}>
                    <span className={styles.guideDot} />
                    <span className={styles.guideRange}>0.90 – 1.00</span>
                    <span className={styles.guideLabel}>Very High Confidence</span>
                  </div>
                  <div className={styles.guideRow} style={{ '--dot': '#3b82f6' }}>
                    <span className={styles.guideDot} />
                    <span className={styles.guideRange}>0.75 – 0.89</span>
                    <span className={styles.guideLabel}>High Confidence</span>
                  </div>
                  <div className={styles.guideRow} style={{ '--dot': '#f59e0b' }}>
                    <span className={styles.guideDot} />
                    <span className={styles.guideRange}>0.50 – 0.74</span>
                    <span className={styles.guideLabel}>Medium Confidence</span>
                  </div>
                  <div className={styles.guideRow} style={{ '--dot': '#f97316' }}>
                    <span className={styles.guideDot} />
                    <span className={styles.guideRange}>0.30 – 0.49</span>
                    <span className={styles.guideLabel}>Low Confidence</span>
                  </div>
                  <div className={styles.guideRow} style={{ '--dot': '#ef4444' }}>
                    <span className={styles.guideDot} />
                    <span className={styles.guideRange}>Below 0.30</span>
                    <span className={styles.guideLabel}>Very Low — usually ignored</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Damage Severity */}
          <div className={styles.item}>
            <label>Damage Severity</label>
            <span className={styles.value} style={{ color: getSeverityColor(result.severity) }}>{result.severity}</span>
          </div>

          {/* 3. Accident Risk Level */}
          <div className={styles.item}>
            <label>Accident Risk Level</label>
            <span className={styles.value} style={{ color: getRiskColor(result.risk_level) }}>{result.risk_level}</span>
          </div>

          {/* 4. Road Surface / Soil Condition */}
          <div className={styles.item}>
            <label>Surface / Soil Condition</label>
            <span className={styles.value} style={{ textTransform: 'capitalize' }}>{result.surface_condition}</span>
          </div>

          {/* 5. Road Safety Impact */}
          <div className={styles.item}>
            <label>Road Safety Impact</label>
            <span className={styles.value} style={{ textTransform: 'capitalize', color: '#f59e0b' }}>{result.safety_impact}</span>
          </div>

          {/* 6. Recommended Action */}
          <div className={styles.itemFull}>
            <label>Recommended Action</label>
            <div className={styles.boxInfo} style={{ borderLeft: `4px solid ${getSeverityColor(result.severity)}`, display: 'block', padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.02)' }}>
              <span className={styles.value} style={{ textTransform: 'capitalize', color: '#fff', fontSize: '1rem' }}>{result.recommended_action}</span>
            </div>
          </div>
        </div>

        {/* 8. Report Details */}
        <div className={styles.summaryBlock}>
          <div className={styles.summaryTitle}>Report Metadata</div>
          <div className={styles.boxInfo} style={{ gridTemplateColumns: '1fr 1fr', fontSize: '0.85rem' }}>
            <div><strong>Image Name:</strong> {result.image_name}</div>
            <div><strong>Date / Time:</strong> {new Date(result.timestamp || Date.now()).toLocaleString()}</div>
            <div><strong>Detection Method:</strong> {result.detection_method}</div>
            <div><strong>Model File Used:</strong> {result.model_file}</div>
          </div>
        </div>

        {reportStatus && <div className={styles.reportStatus} style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', marginBottom: '15px', border: '1px solid #10b981' }}>{reportStatus}</div>}

        <div className={styles.actionRow} style={{ flexWrap: 'wrap', gap: '10px' }}>
          <button className={styles.reportBtn} onClick={generateReportPdf} style={{ flex: '1 1 auto' }}>
            📄 Download PDF Report
          </button>
          <button className={styles.reportBtn} onClick={downloadJsonReport} style={{ flex: '1 1 auto', background: 'var(--surface)', color: 'var(--text)' }}>
            📊 Download JSON Data
          </button>
          <button className={styles.explainBtn} onClick={() => setShowExplanation(true)} style={{ flex: '1 1 auto' }}>
            🔎 View Scientific Logic
          </button>
        </div>
      </div>

      {showExplanation && (
        <div className={styles.modalOverlay} onClick={() => setShowExplanation(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.sectionLabel}>Scientific Inference Model</p>
                <h4>Hybrid AI + Computer Vision Pipeline</h4>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowExplanation(false)}>✕</button>
            </div>
            <div className={styles.modalContent} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <p><strong>Primary Model Architecture:</strong> YOLOv8 (You Only Look Once) Object Detector trained on Google Colab (`best.pt`).</p>
              <p><strong>Segmentation Methodology:</strong> A localized segmenter applies a Bilateral filter to smooth gravel grain noise while maintaining edge boundaries. Grayscale pixel values are thresholded using Adaptive Gaussian Thresholding to yield dynamic polygon masks.</p>
              <p><strong>Surface Feature Assessment:</strong> Grayscale crop standard deviation ($\sigma$) and average intensity ($I_{avg}$) analyze surface moisture, aggregate composition, and edge alignment locally.</p>
              <p><strong>Impact &amp; Risk Classification:</strong> Derived directly from bounding box size ratio, shape ratio (aspect bounding), and predicted confidences, establishing deterministic classifications based purely on physical variables in the image.</p>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Ref */}
      <div className={styles.reportTemplate} ref={reportRef}>
        <div className={styles.reportHeader}>
          <div className={styles.reportLogo}>🛣️</div>
          <div className={styles.reportTitleGroup}>
            <h2>ROAD INSPECTOR</h2>
            <p>Artificial Intelligence Road Defect Detection &amp; Assessment Report</p>
          </div>
        </div>

        <div className={styles.reportSection}>
          <h3>Overview Summary</h3>
          <p>{result.message}</p>
        </div>

        <div className={styles.reportImageArea}>
          {(result.annotated_image_url || imagePreview) && <img src={result.annotated_image_url || imagePreview} alt="Segmented road defect visual output" />}
        </div>

        <div className={styles.reportSectionRow}>
          <div className={styles.reportField}><strong>Defect Detected:</strong> Yes</div>
          <div className={styles.reportField}><strong>Defect Type:</strong> {result.defect_type}</div>
        </div>
        <div className={styles.reportSectionRow}>
          <div className={styles.reportField}><strong>Confidence Score:</strong> {confidenceLabel}</div>
          <div className={styles.reportField}><strong>Detected Regions:</strong> {result.total_defects || 1}</div>
        </div>
        <div className={styles.reportSectionRow}>
          <div className={styles.reportField}><strong>Damage Severity:</strong> {result.severity}</div>
          <div className={styles.reportField}><strong>Accident Risk Level:</strong> {result.risk_level}</div>
        </div>
        <div className={styles.reportSectionRow}>
          <div className={styles.reportField}><strong>Surface &amp; Soil Condition:</strong> {result.surface_condition}</div>
          <div className={styles.reportField}><strong>Road Safety Impact:</strong> {result.safety_impact}</div>
        </div>
        <div className={styles.reportSectionRow}>
          <div className={styles.reportField}><strong>Recommended Action:</strong> {result.recommended_action}</div>
          <div className={styles.reportField}><strong>Timestamp:</strong> {new Date(result.timestamp || Date.now()).toLocaleString()}</div>
        </div>

        <div className={styles.reportSection}>
          <h3>Model Configuration</h3>
          <p><strong>Detection Method:</strong> {result.detection_method}</p>
          <p><strong>Model Weights File:</strong> {result.model_file}</p>
          <p><strong>Image File Source:</strong> {result.image_name}</p>
        </div>

        <footer className={styles.reportFooter}>
          <p>Road Inspector AI Research Platform — Visual Defect Detection &amp; Safety Audit Report</p>
        </footer>
      </div>
    </>
  );
};

export default DetectionResult;
