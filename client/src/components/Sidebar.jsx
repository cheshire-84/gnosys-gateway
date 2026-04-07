import React, { useEffect, useRef } from 'react';
import NetworkGraph from './NetworkGraph';

export default function Sidebar({ logs, stats, services, currentUser }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [logs]);

  return (
    <aside className="lg:col-span-3 space-y-8">
      {/* SYSTEM LOG BOX */}
      <div className="p-5 bg-black border border-[#222] font-mono text-[9px] h-64 flex flex-col">
        <h2 className="text-gray-700 border-b border-[#1a1a1a] pb-2 mb-2 uppercase tracking-widest">System_Event_Log</h2>
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-gray-500 break-words leading-tight">
              <span className="text-gray-800">&gt;</span> {log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* TELEMETRY */}
      <div className="p-6 border border-[#262626] bg-[#0a0a0a]">
        <h2 className="text-[9px] font-bold text-white uppercase tracking-widest mb-6 border-b border-[#1a1a1a] pb-2">Local_Telemetry</h2>
        <div className="space-y-5 font-mono text-[9px]">
          {[
            { label: 'CPU', val: `${stats.cpu}%` },
            { label: 'MEM', val: `${stats.mem}%` },
            { label: 'DSK', val: `${stats.disk}%` },
            { label: 'UPT', val: `${stats.uptime}h` }
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>{item.label}</span>
                <span>{item.val}</span>
              </div>
              <div className="w-full bg-[#111] h-[1px]">
                <div 
                  className="bg-white h-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                  style={{ width: item.label === 'UPT' ? '100%' : item.val }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: LIVE NETWORK TOPOLOGY GRAPH */}
      <NetworkGraph services={services} currentUser={currentUser} />
    </aside>
  );
}