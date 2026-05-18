// server.js – entry point for the Repair Area Segmentation backend
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || '';
if (!mongoUri) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

mongoose
  .connect(mongoUri, { dbName: process.env.MONGODB_DB || 'roadinspector' })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
