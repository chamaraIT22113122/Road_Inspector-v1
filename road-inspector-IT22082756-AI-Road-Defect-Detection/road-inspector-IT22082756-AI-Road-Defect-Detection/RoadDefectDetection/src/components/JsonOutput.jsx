import React from 'react';
import styles from './JsonOutput.module.css';

const JsonOutput = ({ json }) => {
  if (!json) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    alert('JSON copied to clipboard!');
  };

  return (
    <div className={styles.jsonCard}>
      <div className={styles.cardHeader}>
        <h3>System JSON Output</h3>
        <button className={styles.copyBtn} onClick={copyToClipboard}>
          📋 Copy JSON
        </button>
      </div>
      <p className={styles.subtitle}>Handover data for Repair Area Estimation Module</p>
      
      <div className={styles.codeBlock}>
        <pre>{JSON.stringify(json, null, 2)}</pre>
      </div>
    </div>
  );
};

export default JsonOutput;
