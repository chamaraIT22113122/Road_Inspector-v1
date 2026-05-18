import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, Activity, AlertTriangle, CheckCircle2, 
  TrendingUp, Users, Package, MapPin, ArrowUpRight
} from 'lucide-react';
import styles from './DashboardPage.module.css';

const API_BASE_URL = 'http://localhost:5001/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#ef4444'];
  const pieData = stats ? [
    { name: 'Safe', value: stats.safety_ratio },
    { name: 'Unsafe', value: 100 - stats.safety_ratio }
  ] : [];

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Advanced Research Dashboard 📊</h1>
          <p>Real-time oversight of road inspector AI operations and maintenance metrics</p>
        </div>
        <div className={styles.quickActions}>
           <button className={styles.actionBtn}>Export Report <ArrowUpRight size={14} /></button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Activity size={24} color="#0ea5e9" /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Projects</span>
            <span className={styles.statValue}>{stats?.total_projects || 0}</span>
          </div>
          <div className={styles.statTrend}><TrendingUp size={12} /> +12%</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Package size={24} color="#10b981" /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Asphalt Consumed</span>
            <span className={styles.statValue}>{stats?.total_mass_kg?.toLocaleString() || 0} <small>kg</small></span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><CheckCircle2 size={24} color="#8b5cf6" /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Safety Compliance</span>
            <span className={styles.statValue}>{stats?.safety_ratio || 0}%</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users size={24} color="#f59e0b" /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Avg. AI Confidence</span>
            <span className={styles.statValue}>{stats?.avg_confidence || 0}%</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Project Safety Distribution 🛡️</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.chartLegend}>
              <div><span style={{background: '#10b981'}} /> Safe Repairs</div>
              <div><span style={{background: '#ef4444'}} /> Thermal Risks</div>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Estimation Trends (Real-time) 📈</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.recent_activity?.map((r, i) => ({ 
                name: `P${i+1}`, 
                mass: r.ai_prediction?.predicted_mass_kg || 0 
              })) || []}>
                <defs>
                  <linearGradient id="colorMass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="mass" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMass)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h3>Recent AI Estimations 📍</h3>
        <div className={styles.activityList}>
          {stats?.recent_activity?.map((activity, i) => (
            <div key={i} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {activity.thermal_analysis.is_safe ? <CheckCircle2 size={18} color="#10b981" /> : <AlertTriangle size={18} color="#ef4444" />}
              </div>
              <div className={styles.activityMain}>
                <p className={styles.activityTitle}>{activity.location_name}</p>
                <p className={styles.activitySub}>
                  {activity.ai_prediction?.predicted_mass_kg || 0}kg estimated • {activity.ai_prediction?.resource_allocation?.job_type || 'Patching'}
                </p>
              </div>
              <div className={styles.activityTime}>
                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
