import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = "https://home.gnosys.labs/api";

export function useGnosysData() {
  const [time, setTime] = useState(new Date());
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ cpu: 0, mem: 0, disk: 0, uptime: 0 });
  const [weather, setWeather] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Track previous service states to detect transitions (e.g., OPERATIONAL -> OFFLINE)
  const prevServices = useRef([]);

  // --- AUTH STATE ---
  const [token, setToken] = useState(localStorage.getItem('gateway_token') || '');
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('gateway_user') || '');
  const [setupRequired, setSetupRequired] = useState(false);

  const addLog = useCallback((msg) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev.slice(-15), `[${timestamp}] ${msg}`]);
  }, []);

  // --- BROWSER NOTIFICATIONS ---
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(`GNOSYS GATEWAY: ${title}`, { 
        body, 
        icon: "/favicon.svg" 
      });
    }
  };

  // --- AUTH FUNCTIONS ---
  const checkAuthStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/status`);
      if (res.ok) {
        const data = await res.json();
        setSetupRequired(data.setupRequired);
      }
    } catch (err) { console.error("Auth check failed"); }
  };

  const handleLogin = async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setCurrentUser(data.username);
      localStorage.setItem('gateway_token', data.token);
      localStorage.setItem('gateway_user', data.username);
      addLog(`Security: Authority granted to ${data.username}`);
      return true;
    } else {
      addLog("Security: Authentication failed.");
      alert(data.error || "Login Failed");
      return false;
    }
  };

  const handleSetup = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { data = { detail: "Server Error: Non-JSON Response" }; }

      if (res.ok) {
        alert("Master Authority Established. Please log in.");
        setSetupRequired(false);
        return true;
      } else {
        alert(data.detail || "Setup Failed");
        return false;
      }
    } catch (err) {
      alert("Network Error during setup");
      return false;
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser('');
    localStorage.removeItem('gateway_token');
    localStorage.removeItem('gateway_user');
    addLog("Security: Terminal locked.");
  };

  // --- DATA FETCHING ---
  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE}/services`);
      const data = await res.json();
      
      // Compare current status with previous status for reactive pulses and alerts
      data.forEach(service => {
        const previous = prevServices.current.find(p => p.id === service.id);
        
        if (previous) {
          // Trigger Alert on Critical Failure
          if (previous.status !== 'OFFLINE' && service.status === 'OFFLINE') {
            addLog(`CRITICAL: Asset ${service.name.toUpperCase()} is OFFLINE`);
            sendNotification("ASSET_CRITICAL", `${service.name} has dropped from the network.`);
          }
        }
      });
      
      prevServices.current = data;
      setServices(data);
    } catch (err) { 
      addLog("Error: DB link severed."); 
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error("Telemetry offline"); }
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch(`${API_BASE}/weather`);
      const data = await res.json();
      if (res.ok) setWeather(data);
    } catch (e) { addLog("Weather Telemetry: Sensor failure."); }
  };

  const syncAllData = () => {
    fetchServices();
    fetchStats();
    fetchWeather();
    checkAuthStatus();
  };

  // --- SECURED ACTIONS ---
  const submitNewService = async (serviceData) => {
    try {
      const res = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(serviceData)
      });
      if (res.ok) {
        addLog(`Asset Created: ${serviceData.name.toUpperCase()}`);
        fetchServices();
        return true; 
      }
    } catch (err) { addLog("Write Error: Transaction failed."); return false; }
  };

  const updateService = async (id, serviceData) => {
    try {
      const res = await fetch(`${API_BASE}/services/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(serviceData)
      });
      if (res.ok) {
        addLog(`Asset Updated: ${serviceData.name.toUpperCase()}`);
        fetchServices();
        return true; 
      }
    } catch (err) { addLog("Write Error: Transaction failed."); return false; }
  };

  const removeService = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE}/services/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addLog(`Asset Purged: ${name.toUpperCase()}`);
        fetchServices();
      }
    } catch (err) { addLog("Delete Error: Transaction failed."); }
  };

  useEffect(() => {
    addLog("System boot sequence initiated...");
    const timer = setInterval(() => setTime(new Date()), 1000);
    syncAllData();
    const statsInterval = setInterval(fetchStats, 5000); 
    const servicesInterval = setInterval(fetchServices, 15000);
    
    return () => {
      clearInterval(timer);
      clearInterval(statsInterval);
      clearInterval(servicesInterval);
    };
  }, []);

  return {
    time, services, stats, weather, logs,
    token, currentUser, setupRequired,
    handleLogin, handleSetup, handleLogout,
    addLog, syncAllData, submitNewService, removeService, updateService
  };
}