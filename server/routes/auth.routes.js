const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth'); // <-- Imported the lock

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gateway_fallback_secret_change_me';

router.get('/status', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ setupRequired: count === 0 });
  } catch (err) { res.status(500).json({ error: "Database Link Severed" }); }
});

router.post('/setup', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(403).json({ error: "System already initialized" });

    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Credentials required" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: "Master Authority Established" });
  } catch (err) { res.status(500).json({ error: "Initialization Failed" }); }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid Credentials" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ error: "Invalid Credentials" });

    const token = jwt.sign({ _id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, username: user.username });
  } catch (err) { res.status(500).json({ error: "Authentication Error" }); }
});

// --- NEW: ACCESS CONTROL ROUTES (SECURED) ---

// Get all admins
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Don't send passwords to frontend
    res.json(users);
  } catch (err) { res.status(500).json({ error: "Failed to fetch users" }); }
});

// Provision new admin
router.post('/users', verifyToken, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Credentials required" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Admin provisioned" });
  } catch (err) { res.status(500).json({ error: "Failed to provision admin (Duplicate name?)" }); }
});

// Revoke admin access
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count <= 1) return res.status(400).json({ error: "Cannot delete the final Master Admin." });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin privileges revoked." });
  } catch (err) { res.status(500).json({ error: "Revocation failed" }); }
});

module.exports = router;