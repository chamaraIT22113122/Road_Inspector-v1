// api.js — Axios service for the backend AI and training API
// NOTE: MongoDB connection strings must be stored on the server side only.
// Never embed credentials or the MongoDB URI in front-end code.
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

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

export default api;
