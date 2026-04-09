import React from 'react';

export default function TopBar({ 
  isManageOpen, setIsManageOpen, syncAllData, 
  searchQuery, setSearchQuery, handleSearch, weather, time 
}) {
  return (
    <nav className="flex flex-col md:flex-row justify-between items-center pb-4 mb-10 gap-4">
      <div className="flex gap-6 text-[10px] tracking-[0.3em] font-bold uppercase w-full md:w-auto">
        <span className="text-white">Gnosys Gateway // v2.5</span>
        <button 
          onClick={() => setIsManageOpen(!isManageOpen)}
          className="text-gray-600 hover:text-white transition-colors"
        >
          [ {isManageOpen ? 'CLOSE_TERMINAL' : 'MANAGE_SERVICES'} ]
        </button>
        <button onClick={syncAllData} className="text-gray-600 hover:text-white transition-colors">
          [ RESYNC_STREAMS ]
        </button>
      </div>
      
      <div className="flex-1 max-w-md w-full relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-700 font-bold">$</span>
        <input 
          type="text"
          className="w-full bg-black/40 border border-[#1a1a1a] rounded-sm py-2 pl-8 pr-4 text-xs font-mono text-white focus:border-white/40 outline-none transition-all placeholder:text-gray-800"
          placeholder="GLOBAL_QUERY_INPUT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="flex items-center gap-6 text-[10px] font-mono tracking-widest text-gray-500">
        {weather && (
          <span className="text-gray-700 uppercase">
            {weather.temperature_2m}°F // Plant City
          </span>
        )}
        <span>{time.toLocaleTimeString([], { hour12: false })}</span>
      </div>
    </nav>
  );
}