const express = require('express');
const multer = require('multer');
const Report = require('../models/Report');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const Result = require('../models/Result');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Save segmentation result

// Upload PDF report
router.post('/uploadReport', upload.single('pdf'), async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const report = new Report({ filename: originalname, data: buffer, mimeType: mimetype });
    await report.save();
    res.status(201).json({ message: 'Report saved', id: report._id });
  } catch (err) {
    console.error('Error saving PDF report:', err);
    res.status(500).json({ error: 'Failed to save PDF' });
  }
});

// Fetch all results (History)
router.get('/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ timestamp: -1 });
    res.json(results);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

router.post('/results', async (req, res) => {
  // existing result save logic
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (err) {
    console.error('Error saving result:', err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

module.exports = router;
