import React, { useEffect, useRef } from 'react';

export default function Sidebar({ logs, wiki, stats, rss }) {
  const logEndRef = useRef(null);

  // Auto-scroll logs logic encapsulated here
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [logs]);

  return (
    <aside className="lg:col-span-3 space-y-8">
      {/* SYSTEM LOG BOX */}
      <div className="p-5 bg-black border border-[#222] font-mono text-[9px] h-48 flex flex-col">
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

      {/* WIKI DISCOVERY */}
      <div>
        <h2 className="text-[9px] font-bold tracking-[0.3em] text-gray-600 uppercase mb-4">Discovery_Feed</h2>
        {wiki ? (
          <div className="bg-[#141414] border-l-2 border-white p-5 animate-in">
            <h4 className="text-white text-xs font-bold uppercase mb-2 tracking-tight">{wiki.title}</h4>
            <p className="text-[10px] leading-relaxed text-gray-500 line-clamp-5 mb-4">{wiki.extract}</p>
            <a href={wiki.content_urls.desktop.page} target="_blank" rel="noreferrer" className="text-[9px] text-gray-400 hover:text-white underline uppercase">Full_Archive_Access</a>
          </div>
        ) : <div className="h-40 bg-[#141414] animate-pulse border border-[#222]"></div>}
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
      
      {/* RSS FEED */}
      <div className="p-6 bg-[#141414] border border-[#262626]">
          <h2 className="text-[9px] font-bold text-white uppercase tracking-widest mb-4 italic">Hacker_News_Relay</h2>
          <div className="space-y-4">
            {rss.length > 0 ? rss.map((item, idx) => (
              <div key={idx} className="border-b border-[#222] pb-3 last:border-0 last:pb-0">
                <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 hover:text-white block transition line-clamp-2 mb-1">
                  {item.title}
                </a>
                <span className="text-[8px] text-gray-800 uppercase font-bold italic tracking-tighter">
                  {new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} // RELAY_01
                </span>
              </div>
            )) : <p className="text-[9px] text-gray-800 italic animate-pulse">Waiting for relay sync...</p>}
          </div>
      </div>
    </aside>
  );
}