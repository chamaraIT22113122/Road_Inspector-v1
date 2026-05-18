import React, { useState, useRef } from 'react';
import styles from './ImageUpload.module.css';

const ImageUpload = ({ onImageUpload, isLoading, onImageSelect, result }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("unknown_image.jpg");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (onImageSelect) onImageSelect();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  };

  // Calculate bounding box styles if result exists
  const getBoxStyle = () => {
    if (!result || !result.bounding_box) return null;
    const { x, y, width, height } = result.bounding_box;
    const imgW = imageSize.width || 600;
    const imgH = imageSize.height || 400;
    const boxColor = '#ef4444'; // Red-500
    return {
      left: `${(x / imgW) * 100}%`,
      top: `${(y / imgH) * 100}%`,
      width: `${(width / imgW) * 100}%`,
      height: `${(height / imgH) * 100}%`,
      borderColor: boxColor,
      background: 'rgba(239, 68, 68, 0.15)',
      boxShadow: `0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2)`,
    };
  };


  return (
    <div className={styles.uploadCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerInfo}>
          <h3>IoT Defect Detection Preview</h3>
          <p>Real-time AI Analysis &amp; Visualization</p>
        </div>
        <div className={styles.modelTag}>YOLOv8-NATIVE</div>
      </div>

      <div className={`${styles.dropZone} ${preview ? styles.hasPreview : ''}`} onClick={triggerUpload}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
        {preview ? (
          <div className={styles.previewWrapper}>
            <div className={styles.previewContainer}>
              <img 
                src={result?.annotated_image_url || preview} 
                alt="Road Preview" 
                className={styles.previewImage} 
                ref={imageRef} 
                onLoad={handleImageLoad} 
              />

              {isLoading && <div className={styles.scanningLine} />}
            </div>

            {/* Overlay to change image */}
            {!isLoading && !result && (
              <div className={styles.overlay}>
                <span>Click to change image</span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.uploadIcon}>📸</div>
            <h3>System Waiting for Input</h3>
            <p>Upload road image from IoT array or local storage</p>
            <span className={styles.hint}>Optimized for YOLOv8 visual inference</span>
          </div>
        )}
      </div>

      <div className={styles.actionArea}>
        <button className={styles.scanBtn} disabled={!preview || isLoading} onClick={() => onImageUpload(preview, fileName)}>
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              AI INFERENCE IN PROGRESS...
            </>
          ) : (
            <>
              <span className={styles.btnIcon}>⚡</span>
              START AI DETECTION
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
