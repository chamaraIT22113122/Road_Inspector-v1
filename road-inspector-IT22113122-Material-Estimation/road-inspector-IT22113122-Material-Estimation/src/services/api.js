// api.js — Axios service for the backend AI and training API
// NOTE: MongoDB connection strings must be stored on the server side only.
// Never embed credentials or the MongoDB URI in front-end code.
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';
const SEGMENTATION_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const checkHealth = () => api.get('/health');
export const getHistory = () => api.get('/history');

// Backend endpoints for Road Defect Detection and training support
export const submitDetection = (payload) => api.post('/detect', payload);
export const uploadImageDetection = (formData) => api.post('/detect', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const startTraining = () => api.post('/train');
export const uploadTrainingDataset = (payload) => api.post('/dataset', payload);

// Backend endpoints for Repair Area Segmentation (Port 5000 Express)
export const checkSegmentationHealth = () => axios.get(`${SEGMENTATION_BASE}/health`);
export const getSegmentationConstants = () => axios.get(`${SEGMENTATION_BASE}/constants`);
export const segmentArea = (payload) => axios.post(`${SEGMENTATION_BASE}/predict`, payload);
export const getSegmentationHistory = () => axios.get(`${SEGMENTATION_BASE}/results`);
export const uploadReport = (formData) => axios.post(`${SEGMENTATION_BASE}/uploadReport`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadResult = (payload) => axios.post(`${SEGMENTATION_BASE}/results`, payload);

export default api;
