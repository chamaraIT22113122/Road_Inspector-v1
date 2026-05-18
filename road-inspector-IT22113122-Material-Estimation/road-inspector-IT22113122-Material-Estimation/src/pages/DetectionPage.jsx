import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Workflow from '../components/Workflow';
import ImageUpload from '../components/ImageUpload';
import DetectionResult from '../components/DetectionResult';
import { submitDetection, uploadImageDetection, checkHealth } from '../services/api';
import styles from './DetectionPage.module.css';

// Road Defect Detection Module - IT22082756
// This module analyzes road images to identify defects, severity, surface types, soil types, and accident risks.

const statusTextMap = {
  0: 'Upload a road image to begin the AI detection workflow.',
  1: 'Analyzing road surface...',
  2: 'Running YOLOv8 detection...',
  3: 'Classifying defect severity...',
  4: 'Finalizing AI report...',
};

const DetectionPage = ({ onDetection, dbStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState(statusTextMap[0]);

  // Reset state when a new image is selected
  const handleNewImageSelected = () => {
    setResult(null);
    setWorkflowStep(0);
    setStatusMessage(statusTextMap[0]);
  };

  const setStage = (step) => {
    setWorkflowStep(step);
    setStatusMessage(statusTextMap[step] || statusTextMap[0]);
  };

  const handleImageAnalysis = async (image, customFileName) => {
    if (image === currentImage && result) {
      return;
    }

    setCurrentImage(image);
    setResult(null);
    setIsLoading(true);
    setStage(1);

    try {
      setStage(2);
      
      // Convert base64 to Blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'upload.jpg');
      
      setStage(3);
      
      const apiResponse = await uploadImageDetection(formData);
      const data = apiResponse.data;
      
      setStage(4);
      
      if (data.success) {
        const detections = data.detections || [];
        
        if (detections.length === 0) {
          const resultObj = {
            image_id: `IMG_${Date.now().toString().slice(-4)}`,
            defect_detected: false,
            message: "No road defect detected in this image.",
            annotated_image_url: data.annotated_image_url ? `http://localhost:8000${data.annotated_image_url}` : null,
            image_name: customFileName || "upload.jpg",
            detection_method: data.detection_method || "YOLOv8-trained model",
            model_file: data.model_file || "models/best.pt"
          };
          setResult(resultObj);
          if (onDetection) {
            onDetection(resultObj);
          }
        } else {
          const primaryDefect = detections[0];
          
          const resultObj = {
            image_id: `IMG_${Date.now().toString().slice(-4)}`,
            defect_detected: true,
            defect_type: primaryDefect.class,
            severity: primaryDefect.severity,
            risk_level: primaryDefect.risk_level,
            surface_condition: primaryDefect.surface_condition,
            safety_impact: primaryDefect.safety_impact,
            recommended_action: primaryDefect.recommended_action,
            confidence: primaryDefect.confidence,
            total_defects: detections.length,
            image_name: customFileName || "upload.jpg",
            detection_method: data.detection_method || "YOLOv8-trained model",
            model_file: data.model_file || "models/best.pt",
            message: `${detections.length} defect(s) detected. Primary defect: ${primaryDefect.class} (${(primaryDefect.confidence*100).toFixed(0)}% conf). Action: ${primaryDefect.recommended_action}.`,
            annotated_image_url: data.annotated_image_url ? `http://localhost:8000${data.annotated_image_url}` : null,
            all_detections: detections
          };
          
          setResult(resultObj);
          if (onDetection) {
            onDetection(resultObj);
          }
        }
      } else {
        setResult({
          defect_detected: false,
          message: "Error processing image: " + data.message
        });
      }
    } catch (err) {
      console.error("Detection failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.moduleTag}>Module IT22082756</span>
          <h1 className={styles.title}>AI-Based Road Defect Detection</h1>
          <p className={styles.subtitle}>
            Stage 1: Visual Identification, Soil Classification & Risk Assessment
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>System Status</span>
            <span className={styles.statValue}>Online</span>
          </div>
        </div>
      </header>

      {/* Workflow Visualization */}
      <Workflow currentStep={workflowStep} />

      {dbStatus === 'Local Research Mode' && (
        <div className={styles.dbWarningBanner}>
          ⚠️ Running in Local Prototype Mode. Detection results are active but will not be saved to MongoDB Atlas due to IP restrictions.
        </div>
      )}
      
      {dbStatus === 'Offline' && (
        <div className={styles.dbWarningBanner}>
          ⚠️ Database Offline. The backend is unreachable. UI may not be able to store results.
        </div>
      )}

      <div className={styles.statusBanner}>{statusMessage}</div>

      <div className={styles.mainGrid}>
        {/* Left Column: Input */}
        <div className={styles.inputSection}>
          <ImageUpload 
            onImageUpload={handleImageAnalysis} 
            isLoading={isLoading} 
            onImageSelect={handleNewImageSelected}
            result={result}
          />
        </div>

        {/* Right Column: Output */}
        <div className={styles.outputSection}>
          {result ? (
            <div className={styles.resultsWrapper}>
              <DetectionResult result={result} imagePreview={currentImage} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🤖</div>
              <h3>Waiting for Analysis</h3>
              <p>Upload a road image to begin the AI detection workflow.</p>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2024 AI & IoT-Based Road Defect Detection System | Research Module by IT22082756</p>
      </footer>
    </motion.div>
  );
};

export default DetectionPage;
