require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Modular Routes
const serviceRoutes = require('./routes/service.routes');
const systemRoutes = require('./routes/system.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// Mount Routes (Order is critical here!)
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', systemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Gateway API: Online (Port ${PORT})`));