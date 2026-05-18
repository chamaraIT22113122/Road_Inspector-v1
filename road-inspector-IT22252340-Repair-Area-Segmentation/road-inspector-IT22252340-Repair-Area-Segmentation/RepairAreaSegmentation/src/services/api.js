// api.js — Axios service for the Flask AI backend
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const checkHealth = () => api.get('/health');

export const getConstants = () => api.get('/constants');

export const segmentArea = (payload) => api.post('/predict', payload);

export const getHistory = () => api.get('/results');
export const uploadReport = (formData) => api.post('/uploadReport', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadResult = (payload) => api.post('/results', payload);

export default api;
