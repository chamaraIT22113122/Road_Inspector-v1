// SegmentationPage.jsx — Advanced Repair Area Segmentation AI Research Dashboard
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Zap, MapPin, Activity, ShieldCheck, Download, 
  FileText, Maximize2, Layers, Thermometer, 
  CloudRain, Navigation, Info, AlertTriangle, ChevronRight
} from 'lucide-react';
import { uploadReport } from '../services/api';
import dataset from '../dataset/dataset.json';

import styles from './SegmentationPage.module.css';
import roadDefectImg from '../assets/road_defect.png';
import segmentationMaskImg from '../assets/segmentation_mask.png';

// TODO: Integration Note - These images and parameters should be received via props or global state
// once the 'Road Defect Detection' module is integrated. For now, using research mockups.

// --- RESEARCH CONSTANTS ---
const AVG_REPAIR_COST_LKR = 4850.00; // Updated rate
const AI_CONFIDENCE_THRESHOLD = 85.5;

const ROAD_TYPES = [
  { value: 'highway', label: 'Expressway / Highway', factor: 1.2 },
  { value: 'arterial', label: 'Arterial Road', factor: 1.0 },
  { value: 'local', label: 'Local Residential', factor: 0.8 },
];

const DEFAULT_FORM = {
  totalArea: 750,
  defectDensity: 0.35,
  locationID: 'SEC-A2-COL-45',
  roadType: 'arterial',
  severity: 'medium',
  gps: '6.9271° N, 79.8612° E',
};

// --- MOCK DEFECT GENERATOR ---
const generateDefects = (seed) => {
  // Use seed to make it deterministic for the same image
  const s = seed.length;
  const crackCount = 3 + (s % 3);
  const potholeCount = 1 + (s % 2);
  
  const cracks = Array.from({ length: crackCount }).map((_, i) => {
    const startX = 20 + (i * 15) % 60;
    const startY = 20 + (i * 20) % 60;
    return {
      id: `crack-${i}`,
      points: Array.from({ length: 6 }).map((_, j) => ({
        x: startX + j * (3 + Math.sin(j + i) * 2),
        y: startY + j * (5 + Math.cos(j + i) * 3)
      }))
    };
  });

  const potholes = Array.from({ length: potholeCount }).map((_, i) => ({
    id: `pothole-${i}`,
    cx: 30 + (i * 30) % 50,
    cy: 40 + (i * 25) % 40,
    rx: 8 + (i % 5),
    ry: 5 + (i % 3),
    rotation: i * 45
  }));

  return { cracks, potholes };
};

export default function SegmentationPage({ onAnalysisComplete }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [defects, setDefects] = useState({ cracks: [], potholes: [] });
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'side-by-side'
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(16/9);
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = e.target;
    setAspectRatio(naturalWidth / naturalHeight);
    setImgDims({ width: clientWidth, height: clientHeight });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track image dimensions for accurate SVG anchoring
  useEffect(() => {
    const handleResize = () => {
      const img = document.getElementById('base-road-image');
      if (img) {
        setImgDims({ width: img.clientWidth, height: img.clientHeight });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
        setUploadedImage(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);

    // Simulate AI Processing
    setTimeout(() => {
      const newResult = {
        timestamp: new Date().toISOString(),
        metrics: {
          predictedSegments: Math.floor(form.totalArea * form.defectDensity * 1.5),
          repairArea: (form.totalArea * form.defectDensity * 1.08).toFixed(2),
          aiConfidence: (AI_CONFIDENCE_THRESHOLD + Math.random() * 10).toFixed(1),
          severityScore: (form.defectDensity * 100).toFixed(1),
        },
        riskLevel: form.defectDensity > 0.6 ? 'Critical' : form.defectDensity > 0.3 ? 'Elevated' : 'Low',
        structuralStability: form.defectDensity < 0.5 ? 'Stable' : 'Sub-base Failure Risk',
        recommendation: form.defectDensity > 0.6 
          ? 'Immediate full resurfacing required. Structural integrity compromised. Deep base repair needed.' 
          : 'Localized patch repair and crack sealing recommended. Surface milling might be required.'
      };

      setResult(newResult);
      setDefects(generateDefects(uploadedImage || 'default'));

      if (typeof onAnalysisComplete === 'function') {
        onAnalysisComplete({ form, result: newResult, uploadedImage });
      }
      setIsProcessing(false);
    }, 2500);
  };

  const exportPDF = () => {
    const element = document.getElementById('report-content');
    html2canvas(element, { scale: 2, backgroundColor: '#05070a' }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Road_Inspector_Report_${form.locationID}.pdf`);
    });
  };

  // Generate PDF and upload to backend
  const handleExportAndUpload = async () => {
    const element = document.getElementById('report-content');
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#05070a' });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    // Get Blob from jsPDF
    const blob = pdf.output('blob');
    const formData = new FormData();
    formData.append('pdf', blob, `Road_Inspector_Report_${form.locationID}.pdf`);
    try {
      await uploadReport(formData);
      // Optionally show success message
    } catch (err) {
      console.error('PDF upload failed', err);
    }
    // Also trigger download for user
    pdf.save(`Road_Inspector_Report_${form.locationID}.pdf`);
  };

  const radarData = [
    { subject: 'Pixel Accuracy', A: 98 },
    { subject: 'Edge Sharpness', A: 92 },
    { subject: 'Noise Ratio', A: 85 },
    { subject: 'Structural Depth', A: 78 },
    { subject: 'Material Sync', A: 94 },
  ];

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.titleGroup}>
            <h1>Repair Area Segmentation AI</h1>
            <p>Pixel-level defect isolation and repair area estimation using AI</p>
          </div>
          <div className={styles.headerStatus}>
            <div className={styles.statusBadge}>
              <span className={styles.pulseDot} />
              Backend Online
            </div>
            <div className={styles.timestamp}>{currentTime}</div>
            <div className={styles.iconBtn}><Zap size={18} /></div>
          </div>
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        {/* Left Panel: Input Configuration */}
        <aside className={styles.inputPanel}>
          <div className={styles.cardHeader}>
            <Layers size={20} className={styles.accentIcon} />
            <div>
              <h3>Segmentation Parameters</h3>
              <p className={styles.note}>Details should come from Road Defect Detection module</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleRunAnalysis}>
            <div className={styles.formSection}>
              <label>Total Road Area (m²)</label>
              <div className={styles.inputWithUnit}>
                <input 
                  type="range" name="totalArea" min="10" max="5000" step="10"
                  value={form.totalArea} onChange={handleChange} 
                />
                <span className={styles.unitBadge}>{form.totalArea} m²</span>
              </div>
            </div>

            <div className={styles.formSection}>
              <label>Defect Density (%)</label>
              <div className={styles.inputWithUnit}>
                <input 
                  type="range" name="defectDensity" min="0" max="1" step="0.01"
                  value={form.defectDensity} onChange={handleChange} 
                />
                <span className={styles.unitBadge}>{(form.defectDensity * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Road Segment ID</label>
                <div className={styles.inputWrapper}>
                  <MapPin size={14} className={styles.inputIcon} />
                  <input type="text" name="locationID" value={form.locationID} onChange={handleChange} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Road Type</label>
                <select name="roadType" value={form.roadType} onChange={handleChange}>
                  {ROAD_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Damage Severity</label>
                <div className={styles.severityToggle}>
                  {['low', 'medium', 'high'].map(sev => (
                    <button 
                      key={sev} type="button" 
                      className={form.severity === sev ? styles.activeSev : ''}
                      onClick={() => setForm(p => ({ ...p, severity: sev }))}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>GPS Coordinates</label>
              <div className={styles.inputWrapper}>
                <Navigation size={14} className={styles.inputIcon} />
                <input type="text" name="gps" value={form.gps} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.uploadBox}>
              <label htmlFor="imageInput" className={styles.uploadLabel}>
                <FileText size={24} />
                <p>{uploadedImage ? `✓ ${uploadedImage}` : 'Upload Road Image'}</p>
                <span>RAW / JPEG / TIFF / PNG supported</span>
              </label>
              <input 
                id="imageInput"
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isProcessing}>
              {isProcessing ? (
                <div className={styles.loader}>
                  <div className={styles.spin} />
                  Running AI Analysis...
                </div>
              ) : (
                <>Analyze Segmentation <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          {/* Dataset Gallery Section */}
          <div className={styles.gallerySection}>
            <div className={styles.cardHeader}>
              <Layers size={18} className={styles.accentIcon} />
              <h4>Dataset Gallery</h4>
            </div>
            <div className={styles.galleryGrid}>
              {dataset.map((item, idx) => (
                <div 
                  key={idx} 
                  className={styles.galleryItem}
                  onClick={() => {
                    setImagePreview(item.image);
                    setUploadedImage(item.image.split('/').pop());
                  }}
                >
                  <img src={item.image} alt={`Sample ${idx}`} />
                  <div className={styles.galleryOverlay}>
                    <span>Select</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Panel: Visualization & Results */}
        <main className={styles.resultsPanel} id="report-content">
          <div className={styles.vizHeader}>
            <div className={styles.vizTabs}>
              <button className={viewMode === 'overlay' ? styles.activeTab : ''} onClick={() => setViewMode('overlay')}>AI Overlay</button>
              <button className={viewMode === 'side' ? styles.activeTab : ''} onClick={() => setViewMode('side')}>Side-by-Side</button>
            </div>
            <div className={styles.vizActions}>
              <button className={styles.iconBtn}><Maximize2 size={16} /></button>
            </div>
          </div>

          <div className={styles.visualizationArea}>
            <div 
              className={styles.mainImageWrapper}
              style={{ aspectRatio: aspectRatio }}
            >
              <img 
                id="base-road-image"
                src={imagePreview || roadDefectImg} 
                alt="Road Defect" 
                className={styles.baseImage}
                onLoad={handleImageLoad}
              />
              {viewMode === 'overlay' && result && (
                <svg 
                  className={styles.overlaySvg}
                  viewBox={`0 0 ${imgDims.width} ${imgDims.height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <filter id="crack-glow">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="pothole-glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Render Cracks */}
                  {defects.cracks.map((crack) => (
                    <polyline
                      key={crack.id}
                      points={crack.points.map(p => `${(p.x * imgDims.width) / 100},${(p.y * imgDims.height) / 100}`).join(' ')}
                      className={styles.crackPath}
                      filter="url(#crack-glow)"
                    />
                  ))}

                  {/* Render Potholes */}
                  {defects.potholes.map((p) => (
                    <ellipse
                      key={p.id}
                      cx={(p.cx * imgDims.width) / 100}
                      cy={(p.cy * imgDims.height) / 100}
                      rx={(p.rx * imgDims.width) / 100}
                      ry={(p.ry * imgDims.height) / 100}
                      transform={`rotate(${p.rotation}, ${(p.cx * imgDims.width) / 100}, ${(p.cy * imgDims.height) / 100})`}
                      className={styles.potholeOutline}
                      filter="url(#pothole-glow)"
                    />
                  ))}
                </svg>
              )}
              {isProcessing && (
                <div className={styles.scanningLine} />
              )}
              <div className={styles.aiLabel}>
                {uploadedImage ? `USER UPLOAD: ${uploadedImage}` : 'AI RESEARCH VIEW: PIXEL_MASK_V4'}
              </div>
            </div>
            {viewMode === 'side' && result && (
              <div className={styles.sideImageContainer}>
                <svg 
                  className={styles.sideSvg}
                  viewBox={`0 0 ${imgDims.width} ${imgDims.height}`}
                  width="100%"
                  height="100%"
                >
                  <rect width="100%" height="100%" fill="#0a0c10" />
                  {/* Same rendering logic for side-by-side mask view */}
                  {defects.cracks.map((crack) => (
                    <polyline
                      key={crack.id}
                      points={crack.points.map(p => `${(p.x * imgDims.width) / 100},${(p.y * imgDims.height) / 100}`).join(' ')}
                      stroke="var(--danger)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  ))}
                  {defects.potholes.map((p) => (
                    <ellipse
                      key={p.id}
                      cx={(p.cx * imgDims.width) / 100}
                      cy={(p.cy * imgDims.height) / 100}
                      rx={(p.rx * imgDims.width) / 100}
                      ry={(p.ry * imgDims.height) / 100}
                      transform={`rotate(${p.rotation}, ${(p.cx * imgDims.width) / 100}, ${(p.cy * imgDims.height) / 100})`}
                      fill="rgba(6, 182, 212, 0.4)"
                      stroke="var(--accent-light)"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
                <div className={styles.aiLabel}>SEGMENTATION MASK</div>
              </div>
            )}
          </div>

          {/* AI Analytics Cards */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.mIcon}><Maximize2 size={20} /></div>
              <div className={styles.mContent}>
                <span className={styles.mLabel}>Repair Area</span>
                <span className={styles.mValue}>{result ? result.metrics.repairArea : '--'} <sup>m²</sup></span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.mIcon}><ShieldCheck size={20} /></div>
              <div className={styles.mContent}>
                <span className={styles.mLabel}>AI Confidence</span>
                <span className={styles.mValue}>{result ? result.metrics.aiConfidence : '--'} <sup>%</sup></span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.mIcon}><Activity size={20} /></div>
              <div className={styles.mContent}>
                <span className={styles.mLabel}>Severity Score</span>
                <span className={styles.mValue}>{result ? result.metrics.severityScore : '--'} <sup>/100</sup></span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.mIcon}><Thermometer size={20} /></div>
              <div className={styles.mContent}>
                <span className={styles.mLabel}>Risk Level</span>
                <span className={`${styles.mValue} ${result ? styles[result.riskLevel.toLowerCase()] : ''}`}>
                  {result ? result.riskLevel : '--'}
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                className={styles.advancedAnalytics}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={styles.analysisRow}>
                  <div className={styles.chartSection}>
                    <h4>Scientific Quality Metrics</h4>
                    <div className={styles.radarContainer}>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Radar name="AI" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className={styles.infoSection}>
                    <div className={styles.stabilityBox}>
                      <div className={styles.stabilityHeader}>
                        <ShieldCheck size={18} />
                        <h4>Structural Analysis & Repair Recommendation</h4>
                      </div>
                      <p className={styles.stabilityStatus}>Current Status: <strong>{result.structuralStability}</strong></p>
                      <div className={styles.recommendationBanner}>
                        <Info size={16} />
                        <p>{result.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button className={styles.secondaryBtn} onClick={handleExportAndUpload}>
                      <Download size={16} /> Export PDF & Upload
                    </button>
                    <button className={styles.primaryBtn}>
                      <Activity size={16} /> Send to Material Estimation
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

