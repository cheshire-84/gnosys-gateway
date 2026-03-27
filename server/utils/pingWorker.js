const Service = require('../models/Service');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const checkServices = async () => {
  try {
    const services = await Service.find();
    if (services.length === 0) return;

    for (let service of services) {
      let currentPing = 0;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const startTime = Date.now();
        const response = await fetch(service.url, { 
          method: 'GET', 
          signal: controller.signal 
        });
        clearTimeout(timeoutId);

        currentPing = Date.now() - startTime;

        if (response.ok) {
          service.status = currentPing > 2000 ? 'DEGRADED' : 'OPERATIONAL';
        } else {
          service.status = 'OFFLINE';
          currentPing = 5000; // Cap at 5000ms for the chart if it drops
        }
      } catch (err) {
        service.status = 'OFFLINE';
        currentPing = 5000;
      }

      // --- SPARKLINE ARRAY LOGIC ---
      service.pingHistory.push(currentPing);
      if (service.pingHistory.length > 15) {
        service.pingHistory.shift(); // Remove the oldest ping to keep the chart moving
      }

      service.lastChecked = new Date();
      await service.save();
    }
  } catch (err) {
    console.error('[Heartbeat] Critical database failure during ping cycle.');
  }
};

const startHeartbeat = () => {
  console.log('Telemetry: Heartbeat Monitor initialized.');
  checkServices(); 
  setInterval(checkServices, 60000); 
};

module.exports = startHeartbeat;