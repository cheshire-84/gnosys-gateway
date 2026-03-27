import React, { useState, useEffect } from 'react';
import { useGnosysData } from './hooks/useGnosysData';
import TopBar from './components/TopBar';
import ServiceManager from './components/ServiceManager';
import ServiceGrid from './components/ServiceGrid';
import Sidebar from './components/Sidebar';
import DocumentationPanel from './components/DocumentationPanel';
import AuthPanel from './components/AuthPanel';
import SettingsPanel from './components/SettingsPanel';

const App = () => {
  const {
    time, services, stats, wiki, rss, weather, logs,
    token, currentUser, setupRequired, handleLogin, handleSetup, handleLogout,
    addLog, syncAllData, submitNewService, removeService, updateService
  } = useGnosysData();

  const [view, setView] = useState('dashboard');
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [newService, setNewService] = useState({ name: '', tag: '', url: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [view]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery) {
      addLog(`External Query: routing to Google via '${searchQuery}'`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
      setSearchQuery('');
    }
  };

  const handleAddOrUpdateService = async (e) => {
    e.preventDefault();
    const success = editingId 
      ? await updateService(editingId, newService)
      : await submitNewService(newService);
      
    if (success) {
      setNewService({ name: '', tag: '', url: '', description: '' });
      setEditingId(null);
    }
  };

  const triggerEdit = (service) => {
    setNewService({ name: service.name, tag: service.tag, url: service.url, description: service.description });
    setEditingId(service._id);
  };

  const cancelEdit = () => {
    setNewService({ name: '', tag: '', url: '', description: '' });
    setEditingId(null);
  };

  const toggleManageServices = () => {
    if (isManageOpen) {
      setIsManageOpen(false);
      cancelEdit();
    } else {
      token ? setIsManageOpen(true) : setShowAuthModal(true);
    }
  };

  const processAuth = async (username, password) => {
    const success = setupRequired ? await handleSetup(username, password) : await handleLogin(username, password);
    if (success && !setupRequired) {
      setShowAuthModal(false);
      setIsManageOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 font-sans p-6 md:p-12 selection:bg-white selection:text-black">

      {/* AUTH MODAL OVERLAY */}
      {showAuthModal && (
        <AuthPanel
          type={setupRequired ? 'setup' : 'login'}
          onSubmit={processAuth}
          onCancel={() => setShowAuthModal(false)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <nav className="flex justify-between items-center mb-8 border-b border-[#262626] pb-4">
          <div className="flex gap-8 text-[10px] tracking-[0.3em] uppercase font-bold">
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? "text-white border-b border-white" : "text-gray-600 hover:text-white transition"}>01. GATEWAY</button>
            <button onClick={() => setView('docs')} className={view === 'docs' ? "text-white border-b border-white" : "text-gray-600 hover:text-white transition"}>02. DOCUMENTATION</button>
            <button onClick={() => { token ? setView('settings') : setShowAuthModal(true); }} className={view === 'settings' ? "text-white border-b border-white" : "text-gray-600 hover:text-white transition"}>03. ACCESS_CONTROL</button>
          </div>
          {token && (
            <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest items-center">
              <span className="text-gray-500">ROOT: {currentUser}</span>
              <button onClick={() => { handleLogout(); setIsManageOpen(false); setView('dashboard'); }} className="text-red-900 hover:text-red-500">LOCK</button>
            </div>
          )}
        </nav>

        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <TopBar
              isManageOpen={isManageOpen} setIsManageOpen={toggleManageServices}
              syncAllData={syncAllData} searchQuery={searchQuery}
              setSearchQuery={setSearchQuery} handleSearch={handleSearch}
              weather={weather} time={time}
            />

            {isManageOpen && (
              <ServiceManager
                services={services} newService={newService} setNewService={setNewService}
                handleAddOrUpdate={handleAddOrUpdateService} removeService={removeService}
                editingId={editingId} triggerEdit={triggerEdit} cancelEdit={cancelEdit}
              />
            )}

            {/* items-start here prevents the whole grid from stretching to the sidebar's height */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <ServiceGrid services={services} />
              <Sidebar logs={logs} wiki={wiki} stats={stats} rss={rss} />
            </div>
          </div>
        )}

        {view === 'docs' && (
          <DocumentationPanel />
        )}

        {view === 'settings' && (
          <SettingsPanel token={token} addLog={addLog} />
        )}

        <footer className="mt-24 border-t border-[#262626] pt-10 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.3em] text-gray-700 font-bold gap-4">
          <div className="flex gap-8"><span>© 2026 Gnosys Labs Gateway</span><span className="hidden md:inline">//</span><span>Plant City NOC</span></div>
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-900 shadow-[0_0_5px_rgba(5,150,105,0.5)]"></span><span>Uptime_Stable</span></div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-800 animate-pulse"></span><span>System_Heartbeat</span></div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;