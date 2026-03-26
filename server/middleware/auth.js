const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access Denied: Terminal Locked" });

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'gateway_fallback_secret_change_me';
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or Expired Token" });
  }
};

module.exports = verifyToken;
