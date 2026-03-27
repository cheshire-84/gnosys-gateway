const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tag: { type: String, required: true },
  url: { type: String, required: true },
  description: String,
  status: { type: String, default: 'UNKNOWN' },
  lastChecked: { type: Date, default: null },
  pingHistory: { type: [Number], default: [] }, // <-- NEW SPARKLINE MEMORY
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);