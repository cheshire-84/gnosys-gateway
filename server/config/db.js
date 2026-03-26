const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gnosys_gateway');
    console.log('MongoDB: Online (Gateway)');
  } catch (err) {
    console.error('MongoDB Error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;