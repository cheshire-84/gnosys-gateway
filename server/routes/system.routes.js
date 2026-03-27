const express = require('express');
const os = require('os');
const osUtils = require('os-utils');
const disk = require('diskusage');
const Parser = require('rss-parser');

const router = express.Router();

// --- IN-MEMORY CACHE FOR RSS ---
let cachedRSS = [];
let lastFetchTime = 0;

router.get('/stats', (req, res) => {
  osUtils.cpuUsage((v) => {
    try {
      // Ensure cross-platform compatibility just like GPass
      const pathToCheck = os.platform() === 'win32' ? 'c:' : '/';
      const diskInfo = disk.checkSync(pathToCheck);
      
      res.json({
        cpu: (v * 100).toFixed(1),
        mem: (100 - (os.freemem() / os.totalmem() * 100)).toFixed(1),
        disk: (100 - (diskInfo.available / diskInfo.total * 100)).toFixed(1),
        uptime: Math.floor(os.uptime() / 3600)
      });
    } catch (err) {
      res.status(500).json({ error: "Telemetry failure" });
    }
  });
});

// --- EXTERNAL RELAY PROXIES ---

router.get('/rss', async (req, res) => {
  try {
    const now = Date.now();
    
    // Serve from RAM if less than 5 minutes have passed
    if (now - lastFetchTime < 300000 && cachedRSS.length > 0) {
      return res.json(cachedRSS);
    }

    const customParser = new Parser({ timeout: 5000 });
    const feed = await customParser.parseURL('https://hnrss.org/frontpage');
    
    // Update the Cache
    cachedRSS = feed.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate
    }));
    lastFetchTime = now;
    
    res.json(cachedRSS);
  } catch (err) {
    console.error("RSS Error:", err.message);
    // If rate-limited, serve the stale cache rather than crashing the UI
    if (cachedRSS.length > 0) return res.json(cachedRSS);
    res.status(500).json({ error: "RSS Feed unavailable" });
  }
});

// Proxy Wikipedia Random Article
router.get('/wiki', async (req, res) => {
  try {
    // Wikipedia requires a custom User-Agent to prevent bot-blocking
    const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary', {
      headers: { 'User-Agent': 'GnosysLabsGateway/1.0 (cheshire.84@icloud.com)' }
    });
    if (!response.ok) throw new Error('Wiki API offline');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Wiki link failed." });
  }
});

// Proxy Open-Meteo Weather
router.get('/weather', async (req, res) => {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.0128&longitude=-82.1287&current=temperature_2m,weather_code&temperature_unit=fahrenheit');
    if (!response.ok) throw new Error('Weather API offline');
    const data = await response.json();
    res.json(data.current); // Send only the 'current' object the frontend expects
  } catch (err) {
    res.status(500).json({ error: "Weather Telemetry: Sensor failure." });
  }
});

module.exports = router;