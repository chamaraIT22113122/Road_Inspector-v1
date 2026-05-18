const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  image: { type: String, required: true }, // path or URL to the original image
  mask: { type: String, required: true }, // path or URL to the mask image
  metrics: {
    repairArea: { type: String },
    aiConfidence: { type: String },
    severityScore: { type: String },
    riskLevel: { type: String },
    structuralStability: { type: String },
    recommendation: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
