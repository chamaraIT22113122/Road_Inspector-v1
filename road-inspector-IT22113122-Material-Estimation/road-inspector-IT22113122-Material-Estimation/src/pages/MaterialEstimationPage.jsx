import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import {
  FlaskConical, Thermometer, Droplets, Maximize2, Activity,
  History as HistoryIcon, Send, AlertTriangle, CheckCircle2,
  Package, Truck, Clock, Wrench, Users, Shield, Cpu, Coins, Receipt,
  TrendingUp, ExternalLink, BookOpen, Info, Zap, Trash2
} from 'lucide-react';

import styles from './MaterialEstimationPage.module.css';

const API_BASE_URL = 'http://localhost:5001/api';

const DEFAULT_FORM = {
  length: 10,
  width: 3.5,
  depth: 0.05,
  ambient_temp: 30,
  surface_moisture: 5,
  defect_type: 'pothole',
  location_name: 'Colombo-Galle Main Road (Sector 4)'
};

export default function MaterialEstimationPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    fetchHistory();
    checkHealth();
    return () => clearInterval(timer);
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setDbStatus(response.data.database === 'Connected' ? 'Connected 🟢' : 'Offline 🔴');
    } catch (err) {
      setDbStatus('Error ⚠️');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this research record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/history/delete/${id}`);
      fetchHistory(); // Refresh table
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Error deleting record");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, form);
      setResult(response.data);
      fetchHistory(); // Refresh history after prediction
    } catch (err) {
      setError(err.response?.data?.error || "Connection failed. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = result?.ai_prediction ? [
    { name: 'AI Prediction', mass: result.ai_prediction.predicted_mass_kg || 0 },
    { name: 'Physics Calc', mass: result.ai_prediction.physics_mass_kg || 0 }
  ] : [];

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.titleGroup}>
            <h1>Material Estimation AI 🧠🏗️</h1>
            <p>Advanced bitumen mass prediction and thermal safety analysis grounded in RDA Sri Lanka Standards</p>
          </div>
          <div className={styles.headerStatus}>
            <div className={styles.statusBadge}>
              <span className={styles.pulseDot} />
              AI Engines Ready 🚀
            </div>
            <div className={`${styles.statusBadge} ${dbStatus.includes('Connected') ? '' : styles.statusOffline}`}>
              DB: {dbStatus}
            </div>
            <div className={styles.timestamp}>🕒 {currentTime}</div>
          </div>
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        {/* Left: Input Form */}
        <aside className={styles.inputPanel}>
          <div className={styles.cardHeader}>
            <FlaskConical size={20} className={styles.accentIcon} />
            <div>
              <h3>Estimation Parameters 🛠️</h3>
              <p className={styles.note}>Configure site conditions for AI processing</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Location Name</label>
              <div className={styles.inputWrapper}>
                <Maximize2 size={16} className={styles.inputIcon} />
                <input
                  type="text" name="location_name"
                  value={form.location_name} onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Length (m)</label>
                <div className={styles.inputWrapper}>
                  <Maximize2 size={16} className={styles.inputIcon} />
                  <input
                    type="number" name="length" step="0.1"
                    value={form.length} onChange={handleChange}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Width (m)</label>
                <div className={styles.inputWrapper}>
                  <Maximize2 size={16} className={styles.inputIcon} />
                  <input
                    type="number" name="width" step="0.1"
                    value={form.width} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Defect Type 🩹</label>
              <div className={styles.inputWrapper}>
                <AlertTriangle size={16} className={styles.inputIcon} />
                <select name="defect_type" value={form.defect_type} onChange={handleChange}>
                  <option value="pothole">Pothole 🕳️</option>
                  <option value="crack">Cracks 裂</option>
                  <option value="erosion">Surface Erosion 🌊</option>
                  <option value="rutting">Rutting 🚜</option>
                  <option value="wear">Road Surface Wear 🛣️</option>
                  <option value="other">Other Defects ❓</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Repair Depth (m) 📏</label>
              <div className={styles.inputWrapper}>
                <Activity size={16} className={styles.inputIcon} />
                <input
                  type="number" name="depth" step="0.005"
                  value={form.depth} onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Ambient Temp (°C)</label>
              <div className={styles.inputWrapper}>
                <Thermometer size={16} className={styles.inputIcon} />
                <input
                  type="number" name="ambient_temp"
                  value={form.ambient_temp} onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Surface Moisture (%)</label>
              <div className={styles.inputWrapper}>
                <Droplets size={16} className={styles.inputIcon} />
                <input
                  type="number" name="surface_moisture"
                  value={form.surface_moisture} onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <span>⏳ Calculating...</span>
              ) : (
                <>
                  <Send size={18} /> Run AI Estimation 🪄
                </>
              )}
            </button>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                <AlertTriangle size={14} style={{ marginRight: '5px' }} /> {error}
              </div>
            )}
          </form>
        </aside>

        {/* Right: Results */}
        <main className={styles.resultsPanel}>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              >
                <p>Configure parameters and run estimation to see AI results</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {/* Metrics Grid */}
                <div className={styles.researchHeader}>
                  <div className={styles.modelBadge}>
                    <Shield size={14} /> {result.module}
                  </div>
                  <div className={styles.modelBadge} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent)' }}>
                    <Cpu size={14} /> {result.model_architecture}
                  </div>
                </div>
                {/* Metrics Grid */}
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.mIcon}><Package size={24} /></div>
                    <div className={styles.mContent}>
                      <span className={styles.mLabel}>📦 Predicted Mass</span>
                      <span className={styles.mValue}>
                        {result?.ai_prediction?.predicted_mass_kg || 0}
                        <span className={styles.mUnit}>kg</span>
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.mIcon}><Truck size={24} /></div>
                    <div className={styles.mContent}>
                      <span className={styles.mLabel}>Bitumen Grade</span>
                      <span className={styles.mValue} style={{ fontSize: '1.2rem' }}>
                        {result?.ai_prediction?.bitumen_grade || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.mIcon}><Clock size={24} /></div>
                    <div className={styles.mContent}>
                      <span className={styles.mLabel}>Est. Labor Time</span>
                      <span className={styles.mValue}>
                        {result?.ai_prediction?.resource_allocation?.estimated_time_mins || 0}
                        <span className={styles.mUnit}>mins</span>
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.mIcon}><Wrench size={24} /></div>
                    <div className={styles.mContent}>
                      <span className={styles.mLabel}>Job Profile</span>
                      <span className={styles.mValue} style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
                        {result?.ai_prediction?.resource_allocation?.job_type || 'Standard Repair'}
                      </span>
                      <span className={styles.mUnit} style={{ marginLeft: 0, fontSize: '0.7rem', color: 'var(--accent)' }}>
                        👥 {(result?.ai_prediction?.resource_allocation?.workforce?.engineers || 0) + (result?.ai_prediction?.resource_allocation?.workforce?.operators || 0) + (result?.ai_prediction?.resource_allocation?.workforce?.laborers || 0)} Total Personnel
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.mIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Coins size={24} /></div>
                    <div className={styles.mContent}>
                      <span className={styles.mLabel}>💸 Total Project Cost</span>
                      <span className={styles.mValue} style={{ color: '#10b981' }}>
                        {result?.ai_prediction?.resource_allocation?.cost_analysis?.total_estimated_cost?.toLocaleString() || 0}
                        <span className={styles.mUnit}>LKR</span>
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard} style={{ background: 'rgba(249, 115, 22, 0.05)', borderColor: 'rgba(249, 115, 22, 0.2)' }}>
                    <div className={styles.mIcon} style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}><Zap size={24} /></div>
                    <div className={styles.mContent}>
                      <span className={styles.mLabel} style={{ color: '#fb923c' }}>💡 Smart Recommendation</span>
                      <span className={styles.mValue} style={{ fontSize: '1rem', color: '#f97316', marginTop: '4px' }}>
                        {result?.ai_prediction?.resource_allocation?.ai_recommendation?.material || 'HMA Pen 60/70'}
                      </span>
                      <span className={styles.mUnit} style={{ marginLeft: 0, fontSize: '0.7rem', opacity: 0.8 }}>
                        {result?.ai_prediction?.resource_allocation?.ai_recommendation?.logic}
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.mIcon}><CheckCircle2 size={24} /></div>
                    <div className={styles.mContent}>
                      <span className={styles.mLabel}>🎯 AI Confidence</span>
                      <span className={styles.mValue}>
                        {result?.thermal_analysis?.confidence_pct || 0}
                        <span className={styles.mUnit}>%</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analysis Section */}
                <div className={styles.analysisSection}>
                  <div className={styles.analysisRow}>
                    <div className={styles.chartContainer}>
                      <h4>Prediction Validation (AI vs Physics)</h4>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                          <YAxis tick={{ fill: '#94a3b8' }} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                          />
                          <Bar dataKey="mass" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={60} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className={styles.recommendationBox}>
                      <div className={styles.recHeader}>
                        {result?.thermal_analysis?.is_safe ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        <h4>Thermal Safety Analysis</h4>
                      </div>
                      <div className={styles.recContent}>
                        {result?.thermal_analysis?.recommendation || 'No analysis available'}
                        {result?.thermal_analysis?.application_temp_range && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            Application Temp: {result.thermal_analysis.application_temp_range}
                          </div>
                        )}
                      </div>
                      {result?.thermal_analysis?.issues?.length > 0 && (
                        <div className={styles.issuesList}>
                          {result.thermal_analysis.issues.map((issue, i) => (
                            <div key={i} className={styles.issueItem}>
                              <AlertTriangle size={16} />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                          <span className={styles.mLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14} /> Project Head Count</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>Total: {(result?.ai_prediction?.resource_allocation?.workforce?.engineers || 0) + (result?.ai_prediction?.resource_allocation?.workforce?.operators || 0) + (result?.ai_prediction?.resource_allocation?.workforce?.laborers || 0)} Units</span>
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '10px' }}>
                            <div className={styles.wfStat}>
                              <div className={styles.wfVal}>{result?.ai_prediction?.resource_allocation?.workforce?.engineers || 0}</div>
                              <div className={styles.wfLabel}>Engineers</div>
                            </div>
                            <div className={styles.wfStat}>
                              <div className={styles.wfVal}>{result?.ai_prediction?.resource_allocation?.workforce?.operators || 0}</div>
                              <div className={styles.wfLabel}>Operators</div>
                            </div>
                            <div className={styles.wfStat} style={{ border: '1px solid rgba(249, 115, 22, 0.3)', background: 'rgba(249, 115, 22, 0.05)' }}>
                              <div className={styles.wfVal} style={{ color: '#f97316' }}>{result?.ai_prediction?.resource_allocation?.workforce?.laborers || 0}</div>
                              <div className={styles.wfLabel} style={{ color: '#fb923c' }}>Laborers</div>
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                          <span className={styles.mLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Cpu size={14} /> Machinery & Equipment
                          </span>
                          <div style={{ fontSize: '0.9rem', marginTop: '8px', color: 'var(--accent-light)', fontWeight: '600' }}>
                            {result?.ai_prediction?.resource_allocation?.equipment || 'Manual Tools'}
                          </div>
                          <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.6 }}>
                            Ref: RDA Highway Schedule of Rates (HSR)
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown Sub-Section */}
                      <div className={styles.costBreakdown}>
                        <div className={styles.costItem}>
                          <div className={styles.costLabel}><Receipt size={14} /> Material Cost (Bitumix Ref)</div>
                          <div className={styles.costValue}>Rs. {result?.ai_prediction?.resource_allocation?.cost_analysis?.material_cost?.toLocaleString()}</div>
                        </div>
                        <div className={styles.costItem}>
                          <div className={styles.costLabel}><Users size={14} /> Labor & Workforce Cost</div>
                          <div className={styles.costValue}>Rs. {result?.ai_prediction?.resource_allocation?.cost_analysis?.labor_cost?.toLocaleString()}</div>
                        </div>
                        <div className={styles.costItem} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '4px' }}>
                          <div className={styles.costLabel} style={{ color: 'var(--accent)', fontWeight: '700' }}><TrendingUp size={14} /> Total Estimated Investment</div>
                          <div className={styles.costValue} style={{ color: 'var(--accent)', fontWeight: '800' }}>Rs. {result?.ai_prediction?.resource_allocation?.cost_analysis?.total_estimated_cost?.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Research Dataset & Standards Section */}
                <div className={styles.researchDatasetSection}>
                  <div className={styles.sectionHeader}>
                    <BookOpen size={20} />
                    <h3>Technical Standards & Research Data Sheet (RDA / SSCM)</h3>
                  </div>
                  
                  <div className={styles.researchGrid}>
                    <div className={styles.researchTableWrapper}>
                      <h4>Material Application Standards 🧪</h4>
                      <table className={styles.miniTable}>
                        <thead>
                          <tr>
                            <th>Material Type</th>
                            <th>Optimal Temp</th>
                            <th>Primary Use Case</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result?.research_dataset?.materials?.map((m, i) => (
                            <tr key={i}>
                              <td>{m.name}</td>
                              <td><span className={styles.tempBadge}>{m.temp}</span></td>
                              <td>{m.use}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.guidelinesBox}>
                      <h4>Engineering Guidelines 📐</h4>
                      <div className={styles.guidelinesList}>
                        {result?.research_dataset?.guidelines?.map((g, i) => (
                          <div key={i} className={styles.guideItem}>
                            <div className={styles.guideTop}>
                              <strong>{g.topic}:</strong> <span>{g.value}</span>
                            </div>
                            <p>{g.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.referenceFooter}>
                    <div className={styles.refTitle}><Info size={14} /> Data Sources & Reference Links:</div>
                    <div className={styles.linkGroup}>
                      {result?.research_dataset?.links?.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.refLink}>
                          {link.label} <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* History */}
                <div className={styles.historySection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Estimation History 📜</h3>
                    <button onClick={() => { fetchHistory(); checkHealth(); }} className={styles.iconBtn}>
                      <HistoryIcon size={18} /> Refresh 🔄
                    </button>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Date/Time</th>
                          <th>Location 📍</th>
                          <th>Dimensions (L×W×D)</th>
                          <th>Defect Type</th>
                          <th>Mass (kg)</th>
                          <th>Workforce 👥</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((entry, idx) => (
                          <tr key={idx}>
                            <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </td>
                            <td><strong>{entry.location_name || 'N/A'}</strong></td>
                            <td>
                              <span style={{ fontSize: '0.8rem' }}>
                                {entry.inputs?.length_m}m × {entry.inputs?.width_m}m × {entry.inputs?.depth_m}m
                              </span>
                            </td>
                            <td>
                              <span className={styles.typeBadge} style={{ textTransform: 'capitalize' }}>
                                {entry.ai_prediction?.resource_allocation?.job_type || 'Patching'}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-light)' }}>
                              {entry.ai_prediction?.predicted_mass_kg || 0} kg
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem' }}>
                                <span>{(entry.ai_prediction?.resource_allocation?.workforce?.engineers || 0) + (entry.ai_prediction?.resource_allocation?.workforce?.operators || 0) + (entry.ai_prediction?.resource_allocation?.workforce?.laborers || 0)} Total</span>
                                <span style={{ opacity: 0.6 }}>{entry.ai_prediction?.resource_allocation?.workforce?.laborers || 0} Laborers</span>
                              </div>
                            </td>
                            <td className={entry.thermal_analysis?.is_safe ? styles.statusOk : styles.statusWarn}>
                              {entry.thermal_analysis?.is_safe ? '✅ Safe' : '⚠️ Risk'}
                            </td>
                            <td>
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(entry._id)}
                                title="Delete Record"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
