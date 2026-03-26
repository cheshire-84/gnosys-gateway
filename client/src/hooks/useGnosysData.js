import { useState, useEffect, useCallback } from 'react';

const API_BASE = "https://home.gnosys.labs/api";

export function useGnosysData() {
  const [time, setTime] = useState(new Date());
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ cpu: 0, mem: 0, disk: 0, uptime: 0 });
  const [wiki, setWiki] = useState(null);
  const [rss, setRss] = useState([]);
  const [weather, setWeather] = useState(null);
  const [logs, setLogs] = useState([]);

  // --- AUTH STATE ---
  const [token, setToken] = useState(localStorage.getItem('gateway_token') || '');
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('gateway_user') || '');
  const [setupRequired, setSetupRequired] = useState(false);

  const addLog = useCallback((msg) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev.slice(-15), `[${timestamp}] ${msg}`]);
  }, []);

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
    const res = await fetch(`${API_BASE}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      alert("Master Authority Established. Please log in.");
      setSetupRequired(false);
      return true;
    } else {
      alert((await res.json()).error || "Setup Failed");
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
      setServices(data);
    } catch (err) { addLog("Error: DB link severed."); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      setStats(await res.json());
    } catch (err) { console.error("Telemetry offline"); }
  };

  const fetchWiki = async () => {
    try {
      const res = await fetch(`${API_BASE}/wiki`);
      const data = await res.json();
      if (res.ok) setWiki(data);
    } catch (e) { addLog("Wiki link failed."); }
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch(`${API_BASE}/weather`);
      const data = await res.json();
      if (res.ok) setWeather(data);
    } catch (e) { addLog("Weather Telemetry: Sensor failure."); }
  };

  const fetchRSS = async () => {
    try {
      const res = await fetch(`${API_BASE}/rss`);
      setRss(await res.json());
    } catch (err) { addLog("RSS Relay: Connection timeout."); }
  };

  const syncAllData = () => {
    fetchServices();
    fetchStats();
    fetchWiki();
    fetchRSS();
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
          'Authorization': `Bearer ${token}` // JWT injected here
        },
        body: JSON.stringify(serviceData)
      });
      if (res.ok) {
        addLog(`Asset Created: ${serviceData.name.toUpperCase()}`);
        fetchServices();
        return true; 
      } else {
        if (res.status === 401 || res.status === 403) handleLogout();
        addLog("Write Error: Access Denied.");
      }
    } catch (err) { 
      addLog("Write Error: Transaction failed."); 
      return false;
    }
  };

  const removeService = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE}/services/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` } // JWT injected here
      });
      if (res.ok) {
        addLog(`Asset Purged: ${name.toUpperCase()}`);
        fetchServices();
      } else {
        if (res.status === 401 || res.status === 403) handleLogout();
        addLog("Delete Error: Access Denied.");
      }
    } catch (err) { addLog("Delete Error: Transaction failed."); }
  };

  useEffect(() => {
    addLog("System boot sequence initiated...");
    const timer = setInterval(() => setTime(new Date()), 1000);
    syncAllData();
    const statsInterval = setInterval(fetchStats, 5000); 
    const rssInterval = setInterval(fetchRSS, 600000); 
    
    return () => {
      clearInterval(timer);
      clearInterval(statsInterval);
      clearInterval(rssInterval);
    };
  }, []);

  return {
    time, services, stats, wiki, rss, weather, logs,
    token, currentUser, setupRequired,
    handleLogin, handleSetup, handleLogout,
    addLog, syncAllData, submitNewService, removeService
  };
}