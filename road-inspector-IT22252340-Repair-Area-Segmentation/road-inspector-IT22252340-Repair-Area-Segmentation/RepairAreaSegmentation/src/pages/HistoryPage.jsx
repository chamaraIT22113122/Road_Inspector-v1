import React, { useEffect, useState } from 'react';
import styles from './HistoryPage.module.css';
import { getHistory } from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory()
      .then(res => setHistory(res.data))
      .catch(err => console.error('Failed to load history', err));
  }, []);

  return (
    <div className={styles.container}>
      <h2>Analysis History</h2>
      {history.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Location ID</th>
              <th>Repair Area (m²)</th>
              <th>AI Confidence (%)</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => (
              <tr key={item._id}>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>{item.locationID || item.form?.locationID}</td>
                <td>{item.repairArea || item.metrics?.repairArea}</td>
                <td>{item.aiConfidence || item.metrics?.aiConfidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
