import React from 'react';

export default function ServiceGrid({ services }) {
  if (!services || services.length === 0) {
    return (
      <div className="col-span-1 lg:col-span-8 flex items-center justify-center border border-[#262626] bg-[#0e0e0e] min-h-[400px]">
        <p className="text-gray-600 font-mono text-xs uppercase tracking-widest animate-pulse">
          [ WARNING: NO ASSETS DETECTED IN REGISTRY ]
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {services.map((service) => {
        let dotColor = "bg-gray-600";
        let textColor = "text-gray-600";
        let pulse = "";
        let shadow = "";
        // defaultBaseColor will be used to color the graph bars
        let defaultBaseColor = "bg-[#333]"; 

        if (service.status === 'OPERATIONAL') {
          dotColor = "bg-green-500";
          textColor = "text-green-500";
          shadow = "shadow-[0_0_8px_rgba(34,197,94,0.4)]";
          // Change graph bars to green for healthy status
          defaultBaseColor = "bg-green-900/60"; 
        } else if (service.status === 'OFFLINE') {
          dotColor = "bg-red-600";
          textColor = "text-red-500";
          shadow = "shadow-[0_0_10px_rgba(220,38,38,0.8)]";
          pulse = "animate-pulse"; 
          // Change *entire graph* to aggressive red for offline status
          defaultBaseColor = "bg-red-900"; 
        } else if (service.status === 'DEGRADED') {
          dotColor = "bg-yellow-500";
          textColor = "text-yellow-500";
          shadow = "shadow-[0_0_8px_rgba(234,179,8,0.4)]";
        }

        const history = service.pingHistory || [];
        const maxExpectedPing = 1000; // Anything above 1000ms is a 'tall' bar

        return (
          <a
            key={service._id}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between h-full min-h-[180px] bg-[#0e0e0e] border border-[#262626] hover:border-white p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase tracking-widest font-bold ${textColor}`}>
                    {service.status || 'UNKNOWN'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${dotColor} ${shadow} ${pulse}`}></span>
                </div>
              </div>

              <div className="mb-6 mt-2">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest border border-[#262626] px-2 py-1 bg-black">
                  {service.tag}
                </span>
              </div>

              <h3 className="text-lg text-white font-light tracking-[0.2em] uppercase mb-2 group-hover:text-gray-300 transition-colors">
                {service.name}
              </h3>
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-gray-500 font-mono line-clamp-2 mb-4 h-8">
                {service.description}
              </p>
              
              {/* --- MINI SPARKLINE CHART (With Enhanced Coloring Logic) --- */}
              <div className="flex items-end gap-[2px] h-8 border-b border-[#262626] pb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {history.map((ping, idx) => {
                  const heightPercent = Math.min((ping / maxExpectedPing) * 100, 100);
                  
                  // Coloring logic:
                  // 1. If critical (offline), whole chart is red. (Already handled by defaultBaseColor)
                  // 2. If healthy (operational), whole chart is green. (Already handled by defaultBaseColor)
                  // 3. BUT: If a specific bar *exceeds* the 1500ms threshold *within* a green history,
                  //    we pinpoint that specific bar as yellow to warn the sysadmin of a latency spike.
                  let barColor = defaultBaseColor;
                  
                  if (service.status === 'OPERATIONAL' && ping > 1500) {
                    barColor = 'bg-yellow-700'; 
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex-1 ${barColor} transition-all duration-500`} 
                      style={{ height: `${Math.max(heightPercent, 10)}%` }}
                      title={`${ping}ms`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}