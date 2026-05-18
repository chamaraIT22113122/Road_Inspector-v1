import React from 'react';
import styles from './Workflow.module.css';

const steps = [
  { id: 1, label: 'Road Image', icon: '📸' },
  { id: 2, label: 'AI Defect Detection', icon: '🤖' },
  { id: 3, label: 'Defect Classification', icon: '🏷️' },
  { id: 4, label: 'Severity Classification', icon: '⚠️' },
  { id: 5, label: 'Repair Area Estimation', icon: '📏' }
];

const Workflow = ({ currentStep = 0 }) => {
  return (
    <div className={styles.workflowContainer}>
      <div className={styles.workflowLine}></div>
      {steps.map((step, index) => (
        <div 
          key={step.id} 
          className={`${styles.step} ${index <= currentStep ? styles.active : ''}`}
        >
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>{step.icon}</span>
          </div>
          <span className={styles.label}>{step.label}</span>
          {index < steps.length - 1 && (
            <div className={styles.arrow}>→</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Workflow;
